import fs from "node:fs";
import nodemailer from "nodemailer";
import { assertMailConfig, config } from "../config.js";
import type { Prospect } from "../types.js";
import { renderOutreach } from "./template.js";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomRetryDelay() {
  const min = config.retryDelayMinMs;
  const max = Math.max(config.retryDelayMaxMs, min);
  return min + Math.floor(Math.random() * (max - min + 1));
}

function createTransport() {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: config.gmail.user,
      pass: config.gmail.appPassword,
    },
  });
}

export type MailSendResult =
  | { ok: true; messageId?: string }
  | { ok: false; error: string };

async function sendOnce(prospect: Prospect): Promise<MailSendResult> {
  if (prospect.contact_emails.length === 0) {
    return { ok: false, error: "No contact emails" };
  }

  const { subject, text } = renderOutreach(prospect);
  const attachments: { filename: string; path: string }[] = [];

  if (fs.existsSync(config.cvPath)) {
    attachments.push({
      filename: "CV.pdf",
      path: config.cvPath,
    });
  }

  if (config.dryRun) {
    return { ok: true, messageId: "dry-run" };
  }

  assertMailConfig();
  const transporter = createTransport();
  try {
    const info = await transporter.sendMail({
      from: config.gmail.from,
      to: prospect.contact_emails.join(", "),
      subject,
      text,
      attachments,
    });
    return { ok: true, messageId: info.messageId };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: message };
  } finally {
    transporter.close();
  }
}

/**
 * Send with one retry after 2–5s on failure.
 */
export async function sendWithRetry(prospect: Prospect): Promise<MailSendResult> {
  const first = await sendOnce(prospect);
  if (first.ok) return first;

  const delay = randomRetryDelay();
  await sleep(delay);

  const second = await sendOnce(prospect);
  if (second.ok) return second;

  return {
    ok: false,
    error: `Failed after retry. First: ${first.error}; Second: ${second.error}`,
  };
}

export { sleep };
