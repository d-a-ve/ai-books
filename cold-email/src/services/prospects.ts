import fs from "node:fs";
import { parse } from "csv-parse/sync";
import { config } from "../config.js";
import type { Prospect } from "../types.js";

function splitEmails(raw: string): string[] {
  return raw
    .split(/[;,]/)
    .map((e) => e.trim())
    .filter((e) => e.includes("@"));
}

let cache: Prospect[] | null = null;

export function loadProspects(force = false): Prospect[] {
  if (cache && !force) return cache;

  const csv = fs.readFileSync(config.prospectsCsv, "utf8");
  const rows = parse(csv, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Record<string, string>[];

  cache = rows.map((r) => ({
    id: Number(r.id),
    company_name: r.company_name ?? "",
    location: r.location ?? "",
    country: r.country ?? "",
    website: r.website ?? "",
    contact_emails: splitEmails(r.contact_emails ?? ""),
    contact_role: r.contact_role ?? "",
    description: r.description ?? "",
    employee_estimate: r.employee_estimate ?? "",
    source_platform: r.source_platform ?? "",
    source_job: r.source_job ?? "",
  }));

  return cache;
}

export function getProspectById(id: number): Prospect | undefined {
  return loadProspects().find((p) => p.id === id);
}

/**
 * Return the next `limit` prospects with id >= fromId (inclusive),
 * in ascending id order.
 */
export function getProspectsFromId(fromId: number, limit: number): Prospect[] {
  return loadProspects()
    .filter((p) => p.id >= fromId)
    .sort((a, b) => a.id - b.id)
    .slice(0, limit);
}

export function getMaxProspectId(): number {
  const all = loadProspects();
  return all.reduce((max, p) => Math.max(max, p.id), 0);
}
