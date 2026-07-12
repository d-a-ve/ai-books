import fs from "node:fs";
import { config } from "../config.js";
import type { Prospect } from "../types.js";

export type RenderedEmail = {
  subject: string;
  text: string;
};

function applyVars(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key: string) => {
    return vars[key] ?? "";
  });
}

export function renderOutreach(prospect: Prospect): RenderedEmail {
  const raw = fs.readFileSync(config.templatePath, "utf8");
  const vars = {
    company_name: prospect.company_name,
    description: prospect.description || "your work in software and technology",
    location: prospect.location,
    country: prospect.country,
  };

  const subjectMatch = raw.match(/^Subject:\s*(.+)$/im);
  const subject = subjectMatch
    ? applyVars(subjectMatch[1].trim(), vars)
    : applyVars("Quick intro — software engineer for {{company_name}}", vars);

  const body = applyVars(
    raw.replace(/^Subject:\s*.+\n+/im, "").trim(),
    vars,
  );

  return { subject, text: body };
}
