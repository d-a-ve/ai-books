import fs from "node:fs";
import path from "node:path";
import { config } from "../config.js";
import type { SheetSendRow } from "../types.js";
import * as sheets from "./sheets.js";

const localStatePath = path.join(config.rootDir, "data", "state.json");
const localSendsPath = path.join(config.rootDir, "data", "sends.json");

type LocalState = {
  current_index: number;
  updated_at: string;
  last_batch_id: string;
};

function sheetsConfigured(): boolean {
  return Boolean(
    config.google.clientEmail &&
      config.google.privateKey &&
      config.google.spreadsheetId,
  );
}

function ensureLocalDir() {
  fs.mkdirSync(path.dirname(localStatePath), { recursive: true });
}

function readLocalState(): LocalState {
  ensureLocalDir();
  if (!fs.existsSync(localStatePath)) {
    const initial: LocalState = {
      current_index: 1,
      updated_at: new Date().toISOString(),
      last_batch_id: "",
    };
    fs.writeFileSync(localStatePath, JSON.stringify(initial, null, 2));
    return initial;
  }
  return JSON.parse(fs.readFileSync(localStatePath, "utf8")) as LocalState;
}

function writeLocalState(state: LocalState) {
  ensureLocalDir();
  fs.writeFileSync(localStatePath, JSON.stringify(state, null, 2));
}

function readLocalSends(): SheetSendRow[] {
  ensureLocalDir();
  if (!fs.existsSync(localSendsPath)) return [];
  return JSON.parse(fs.readFileSync(localSendsPath, "utf8")) as SheetSendRow[];
}

function writeLocalSends(rows: SheetSendRow[]) {
  ensureLocalDir();
  fs.writeFileSync(localSendsPath, JSON.stringify(rows, null, 2));
}

export async function initTracking() {
  if (sheetsConfigured()) {
    await sheets.initSheets();
    return { mode: "sheets" as const };
  }
  readLocalState();
  return { mode: "local" as const };
}

export async function getCurrentIndex(): Promise<number> {
  if (sheetsConfigured()) return sheets.getCurrentIndex();
  return readLocalState().current_index;
}

export async function setCurrentIndex(nextId: number, batchId: string) {
  if (sheetsConfigured()) {
    await sheets.setCurrentIndex(nextId, batchId);
    return;
  }
  writeLocalState({
    current_index: nextId,
    updated_at: new Date().toISOString(),
    last_batch_id: batchId,
  });
}

export async function getSentProspectIds(): Promise<Set<number>> {
  if (sheetsConfigured()) return sheets.getSentProspectIds();
  const ids = new Set<number>();
  for (const row of readLocalSends()) {
    if (row.status === "sent" || row.status === "dry_run") {
      ids.add(row.prospect_id);
    }
  }
  return ids;
}

export async function appendSendRows(rows: SheetSendRow[]) {
  if (rows.length === 0) return;
  if (sheetsConfigured()) {
    await sheets.appendSendRows(rows);
    return;
  }
  writeLocalSends([...readLocalSends(), ...rows]);
}

export async function markReplied(opts: {
  prospect_id?: number;
  company_name?: string;
}): Promise<{ updated: number; mode: "sheets" | "local" }> {
  if (sheetsConfigured()) {
    const result = await sheets.markReplied(opts);
    return { ...result, mode: "sheets" };
  }

  const now = new Date().toISOString();
  const rows = readLocalSends();
  let updated = 0;
  for (const row of rows) {
    const matchId =
      opts.prospect_id != null && row.prospect_id === opts.prospect_id;
    const matchName =
      opts.company_name &&
      row.company_name.toLowerCase() === opts.company_name.toLowerCase();
    if (matchId || matchName) {
      row.replied_at = now;
      updated += 1;
    }
  }
  if (updated > 0) writeLocalSends(rows);
  return { updated, mode: "local" };
}

export function trackingMode(): "sheets" | "local" {
  return sheetsConfigured() ? "sheets" : "local";
}
