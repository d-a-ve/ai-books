import { google } from "googleapis";
import { assertSheetsConfig, config } from "../config.js";
import type { SendStatus, SheetSendRow } from "../types.js";

const SENDS_SHEET = "Sends";
const STATE_SHEET = "State";
const SENDS_HEADER = [
  "prospect_id",
  "company_name",
  "contact_emails",
  "location",
  "sent_at",
  "replied_at",
  "status",
  "error",
  "batch_id",
];

function sheetsClient() {
  assertSheetsConfig();
  const auth = new google.auth.JWT({
    email: config.google.clientEmail,
    key: config.google.privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

async function ensureSheet(title: string) {
  const sheets = sheetsClient();
  const meta = await sheets.spreadsheets.get({
    spreadsheetId: config.google.spreadsheetId,
  });
  const exists = meta.data.sheets?.some((s) => s.properties?.title === title);
  if (!exists) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: config.google.spreadsheetId,
      requestBody: {
        requests: [{ addSheet: { properties: { title } } }],
      },
    });
  }
}

async function ensureSendsHeader() {
  await ensureSheet(SENDS_SHEET);
  const sheets = sheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: config.google.spreadsheetId,
    range: `${SENDS_SHEET}!A1:I1`,
  });
  if (!res.data.values?.[0]?.length) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: config.google.spreadsheetId,
      range: `${SENDS_SHEET}!A1`,
      valueInputOption: "RAW",
      requestBody: { values: [SENDS_HEADER] },
    });
  }
}

async function ensureState() {
  await ensureSheet(STATE_SHEET);
  const sheets = sheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: config.google.spreadsheetId,
    range: `${STATE_SHEET}!A1:B10`,
  });
  if (!res.data.values?.length) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: config.google.spreadsheetId,
      range: `${STATE_SHEET}!A1`,
      valueInputOption: "RAW",
      requestBody: {
        values: [
          ["key", "value"],
          ["current_index", "1"],
          ["updated_at", new Date().toISOString()],
          ["last_batch_id", ""],
        ],
      },
    });
  }
}

export async function initSheets() {
  await ensureSendsHeader();
  await ensureState();
}

export async function getCurrentIndex(): Promise<number> {
  await ensureState();
  const sheets = sheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: config.google.spreadsheetId,
    range: `${STATE_SHEET}!A:B`,
  });
  const rows = res.data.values ?? [];
  for (const row of rows) {
    if (row[0] === "current_index") {
      const n = Number(row[1]);
      return Number.isFinite(n) && n >= 1 ? n : 1;
    }
  }
  return 1;
}

export async function setCurrentIndex(nextId: number, batchId: string) {
  await ensureState();
  const sheets = sheetsClient();
  await sheets.spreadsheets.values.update({
    spreadsheetId: config.google.spreadsheetId,
    range: `${STATE_SHEET}!A1`,
    valueInputOption: "RAW",
    requestBody: {
      values: [
        ["key", "value"],
        ["current_index", String(nextId)],
        ["updated_at", new Date().toISOString()],
        ["last_batch_id", batchId],
      ],
    },
  });
}

export async function getSentProspectIds(): Promise<Set<number>> {
  await ensureSendsHeader();
  const sheets = sheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: config.google.spreadsheetId,
    range: `${SENDS_SHEET}!A2:G`,
  });
  const ids = new Set<number>();
  for (const row of res.data.values ?? []) {
    const id = Number(row[0]);
    const status = (row[6] ?? "") as SendStatus;
    if (Number.isFinite(id) && (status === "sent" || status === "dry_run")) {
      ids.add(id);
    }
  }
  return ids;
}

export async function appendSendRows(rows: SheetSendRow[]) {
  if (rows.length === 0) return;
  await ensureSendsHeader();
  const sheets = sheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: config.google.spreadsheetId,
    range: `${SENDS_SHEET}!A:I`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: rows.map((r) => [
        r.prospect_id,
        r.company_name,
        r.contact_emails,
        r.location,
        r.sent_at,
        r.replied_at,
        r.status,
        r.error,
        r.batch_id,
      ]),
    },
  });
}

export async function markReplied(opts: {
  prospect_id?: number;
  company_name?: string;
}): Promise<{ updated: number }> {
  await ensureSendsHeader();
  const sheets = sheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: config.google.spreadsheetId,
    range: `${SENDS_SHEET}!A2:I`,
  });
  const values = res.data.values ?? [];
  const now = new Date().toISOString();
  let updated = 0;

  const newValues = values.map((row) => {
    const id = Number(row[0]);
    const name = row[1] ?? "";
    const matchId = opts.prospect_id != null && id === opts.prospect_id;
    const matchName =
      opts.company_name &&
      name.toLowerCase() === opts.company_name.toLowerCase();
    if (matchId || matchName) {
      const next = [...row];
      while (next.length < 9) next.push("");
      next[5] = now;
      updated += 1;
      return next;
    }
    return row;
  });

  if (updated > 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: config.google.spreadsheetId,
      range: `${SENDS_SHEET}!A2`,
      valueInputOption: "RAW",
      requestBody: { values: newValues },
    });
  }

  return { updated };
}
