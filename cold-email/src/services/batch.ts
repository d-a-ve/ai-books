import { randomUUID } from "node:crypto";
import { config } from "../config.js";
import type {
  BatchSendResponse,
  SendAttemptResult,
  SheetSendRow,
} from "../types.js";
import { sendWithRetry, sleep } from "./mailer.js";
import {
  getCurrentIndex,
  getSentProspectIds,
  appendSendRows,
  setCurrentIndex,
} from "./state.js";
import { getMaxProspectId, getProspectsFromId } from "./prospects.js";

/**
 * Process in waves of `concurrency` (default 5).
 * Within each wave, send one-by-one with `delayMs` between emails.
 */
async function runInWaves<T, R>(
  items: T[],
  concurrency: number,
  delayMs: number,
  worker: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  for (let start = 0; start < items.length; start += concurrency) {
    const wave = items.slice(start, start + concurrency);
    for (let j = 0; j < wave.length; j++) {
      const index = start + j;
      results[index] = await worker(wave[j], index);
      const isLastOverall = index === items.length - 1;
      if (!isLastOverall && delayMs > 0) {
        await sleep(delayMs);
      }
    }
  }
  return results;
}

export async function sendBatch(batchSize?: number): Promise<BatchSendResponse> {
  const size = Math.min(
    Math.max(batchSize ?? config.defaultBatchSize, 1),
    config.maxBatchSize,
  );

  const batchId = randomUUID();
  const fromId = await getCurrentIndex();
  const alreadySent = await getSentProspectIds();
  const prospects = getProspectsFromId(fromId, size);
  const maxId = getMaxProspectId();

  if (prospects.length === 0) {
    return {
      batch_id: batchId,
      dry_run: config.dryRun,
      started_from_id: fromId,
      next_id: fromId,
      requested: size,
      sent: 0,
      skipped: 0,
      failed: 0,
      results: [],
      errors: [],
    };
  }

  const results = await runInWaves(
    prospects,
    config.sendConcurrency,
    config.sendDelayMs,
    async (prospect): Promise<SendAttemptResult> => {
      const emailsJoined = prospect.contact_emails.join("; ");

      if (prospect.contact_emails.length === 0) {
        return {
          prospect_id: prospect.id,
          company_name: prospect.company_name,
          contact_emails: "",
          status: "skipped_no_email",
          error: "No public contact email on file",
        };
      }

      if (alreadySent.has(prospect.id)) {
        return {
          prospect_id: prospect.id,
          company_name: prospect.company_name,
          contact_emails: emailsJoined,
          status: "skipped_already_sent",
        };
      }

      const mail = await sendWithRetry(prospect);
      const sentAt = new Date().toISOString();

      if (!mail.ok) {
        return {
          prospect_id: prospect.id,
          company_name: prospect.company_name,
          contact_emails: emailsJoined,
          status: "failed",
          error: mail.error,
          sent_at: sentAt,
        };
      }

      return {
        prospect_id: prospect.id,
        company_name: prospect.company_name,
        contact_emails: emailsJoined,
        status: config.dryRun ? "dry_run" : "sent",
        sent_at: sentAt,
      };
    },
  );

  const sheetRows: SheetSendRow[] = results.map((r) => ({
    prospect_id: r.prospect_id,
    company_name: r.company_name,
    contact_emails: r.contact_emails,
    location: prospects.find((p) => p.id === r.prospect_id)?.location ?? "",
    sent_at: r.sent_at ?? "",
    replied_at: "",
    status: r.status,
    error: r.error ?? "",
    batch_id: batchId,
  }));

  await appendSendRows(sheetRows);

  const lastProcessedId = prospects[prospects.length - 1].id;
  const nextId = Math.min(lastProcessedId + 1, maxId + 1);
  await setCurrentIndex(nextId, batchId);

  const errors = results
    .filter((r) => r.status === "failed")
    .map((r) => ({
      company_name: r.company_name,
      prospect_id: r.prospect_id,
      error: r.error ?? "Unknown error",
    }));

  return {
    batch_id: batchId,
    dry_run: config.dryRun,
    started_from_id: fromId,
    next_id: nextId,
    requested: size,
    sent: results.filter((r) => r.status === "sent" || r.status === "dry_run")
      .length,
    skipped: results.filter(
      (r) =>
        r.status === "skipped_no_email" || r.status === "skipped_already_sent",
    ).length,
    failed: errors.length,
    results,
    errors,
  };
}
