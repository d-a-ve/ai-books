export type Prospect = {
  id: number;
  company_name: string;
  location: string;
  country: string;
  website: string;
  contact_emails: string[];
  contact_role: string;
  description: string;
  employee_estimate: string;
  source_platform: string;
  source_job: string;
};

export type SendStatus = "sent" | "failed" | "skipped_no_email" | "skipped_already_sent" | "dry_run";

export type SendAttemptResult = {
  prospect_id: number;
  company_name: string;
  contact_emails: string;
  status: SendStatus;
  error?: string;
  sent_at?: string;
};

export type BatchSendResponse = {
  batch_id: string;
  dry_run: boolean;
  started_from_id: number;
  next_id: number;
  requested: number;
  sent: number;
  skipped: number;
  failed: number;
  results: SendAttemptResult[];
  /** Companies that failed after retry — for operator follow-up */
  errors: Array<{ company_name: string; prospect_id: number; error: string }>;
};

export type SheetSendRow = {
  prospect_id: number;
  company_name: string;
  contact_emails: string;
  location: string;
  sent_at: string;
  replied_at: string;
  status: SendStatus;
  error: string;
  batch_id: string;
};
