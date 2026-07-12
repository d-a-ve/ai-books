import path from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";
import { z } from "zod";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

loadEnv({ path: path.join(rootDir, ".env") });

function resolveFromRoot(p: string) {
  return path.isAbsolute(p) ? p : path.resolve(rootDir, p);
}

const baseSchema = z.object({
  PORT: z.coerce.number().default(8787),
  API_KEY: z.string().default("dev-api-key"),

  GMAIL_USER: z.string().optional(),
  GMAIL_APP_PASSWORD: z.string().optional(),
  EMAIL_FROM: z.string().optional(),

  GOOGLE_SERVICE_ACCOUNT_EMAIL: z.string().optional(),
  GOOGLE_PRIVATE_KEY: z.string().optional(),
  GOOGLE_SHEETS_ID: z.string().optional(),

  PROSPECTS_CSV: z.string().default("../prospects/prospects-1000.csv"),
  CV_PATH: z.string().default("./assets/cv.pdf"),
  TEMPLATE_PATH: z.string().default("./templates/outreach.md"),

  DEFAULT_BATCH_SIZE: z.coerce.number().int().positive().default(20),
  MAX_BATCH_SIZE: z.coerce.number().int().positive().default(50),
  SEND_CONCURRENCY: z.coerce.number().int().positive().default(5),
  SEND_DELAY_MS: z.coerce.number().int().nonnegative().default(2000),
  RETRY_DELAY_MIN_MS: z.coerce.number().int().nonnegative().default(2000),
  RETRY_DELAY_MAX_MS: z.coerce.number().int().nonnegative().default(5000),

  DRY_RUN: z
    .string()
    .optional()
    .transform((v) => v === "true" || v === "1"),
});

const e = baseSchema.parse(process.env);

export const config = {
  rootDir,
  port: e.PORT,
  apiKey: e.API_KEY,
  gmail: {
    user: e.GMAIL_USER ?? "",
    appPassword: e.GMAIL_APP_PASSWORD ?? "",
    from: e.EMAIL_FROM || e.GMAIL_USER || "",
  },
  google: {
    clientEmail: e.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? "",
    privateKey: (e.GOOGLE_PRIVATE_KEY ?? "").replace(/\\n/g, "\n"),
    spreadsheetId: e.GOOGLE_SHEETS_ID ?? "",
  },
  prospectsCsv: resolveFromRoot(e.PROSPECTS_CSV),
  cvPath: resolveFromRoot(e.CV_PATH),
  templatePath: resolveFromRoot(e.TEMPLATE_PATH),
  defaultBatchSize: e.DEFAULT_BATCH_SIZE,
  maxBatchSize: e.MAX_BATCH_SIZE,
  sendConcurrency: e.SEND_CONCURRENCY,
  sendDelayMs: e.SEND_DELAY_MS,
  retryDelayMinMs: e.RETRY_DELAY_MIN_MS,
  retryDelayMaxMs: e.RETRY_DELAY_MAX_MS,
  dryRun: Boolean(e.DRY_RUN),
};

export function assertMailConfig() {
  if (config.dryRun) return;
  if (!config.gmail.user || !config.gmail.appPassword || !config.gmail.from) {
    throw new Error(
      "Missing Gmail SMTP env: GMAIL_USER, GMAIL_APP_PASSWORD, EMAIL_FROM",
    );
  }
}

export function assertSheetsConfig() {
  if (
    !config.google.clientEmail ||
    !config.google.privateKey ||
    !config.google.spreadsheetId
  ) {
    throw new Error(
      "Missing Google Sheets env: GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_SHEETS_ID",
    );
  }
}

export type AppConfig = typeof config;
