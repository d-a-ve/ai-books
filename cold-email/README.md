# Cold Email API

Fastify backend that sends batched cold emails from `prospects/prospects-1000.csv` via **Gmail SMTP**, attaches a CV, and logs progress in **Google Sheets**.

## Behaviour (as configured)

| Setting | Value |
|---------|--------|
| Default batch size | **20** prospects per `/send-batch` |
| Send pacing | Waves of **5**, **delay between each** email (`SEND_DELAY_MS`, default 2s) |
| Failure handling | Retry once after **2–5s**; if still failing, include in response `errors[]` |
| Cursor | Sheets `State.current_index` = next prospect `id` to process |
| Multiple emails on a row | Sent together in one message (`to:` all listed) |

## Setup

```bash
cd cold-email
pnpm install
cp .env.example .env
# fill Gmail + Google Sheets values
```

### Gmail

1. Enable 2FA on the Google account.
2. Create an [App Password](https://myaccount.google.com/apppasswords).
3. Set `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `EMAIL_FROM`.

### Google Sheets

1. Create a Google Cloud service account and download a JSON key.
2. Create a blank spreadsheet; copy its ID into `GOOGLE_SHEETS_ID`.
3. Share the sheet with the service account email (Editor).
4. Set `GOOGLE_SERVICE_ACCOUNT_EMAIL` and `GOOGLE_PRIVATE_KEY` (keep `\n` newlines escaped in `.env`).

On first use the API creates tabs **`Sends`** and **`State`**.

Without Sheets credentials, the API falls back to local files under `cold-email/data/` (`state.json`, `sends.json`) so you can dry-run locally.

### CV

Place your PDF at `cold-email/assets/cv.pdf` (or set `CV_PATH`). Emails still send without it; attach when present.

## Run

```bash
pnpm dev          # watch mode
# or
pnpm start
```

API listens on `PORT` (default `8787`). All routes except `/health` require header `x-api-key: $API_KEY`.

### Endpoints

| Method | Path | Body | Notes |
|--------|------|------|--------|
| `GET` | `/health` | — | No auth |
| `GET` | `/status` | — | Cursor + counts |
| `POST` | `/preview` | `{ "prospectId": 1 }` | Render template only |
| `POST` | `/send-batch` | `{ "batchSize": 20 }` optional | Send next batch |
| `POST` | `/mark-replied` | `{ "prospect_id" }` or `{ "company_name" }` | Set `replied_at` |

### Example

```bash
curl -s http://localhost:8787/status -H "x-api-key: $API_KEY" | jq

curl -s http://localhost:8787/preview \
  -H "x-api-key: $API_KEY" -H "content-type: application/json" \
  -d '{"prospectId":1}' | jq

# Dry run first: DRY_RUN=true in .env
curl -s http://localhost:8787/send-batch \
  -H "x-api-key: $API_KEY" -H "content-type: application/json" \
  -d '{"batchSize":20}' | jq
```

`send-batch` response includes:

- `sent` / `skipped` / `failed`
- `next_id` — cursor after this run
- `errors[]` — `{ company_name, prospect_id, error }` for failures after retry
- `results[]` — per-prospect detail

## Sheets columns (`Sends`)

`prospect_id`, `company_name`, `contact_emails`, `location`, `sent_at`, `replied_at`, `status`, `error`, `batch_id`

## Template

Edit `templates/outreach.md`. Variables: `{{company_name}}`, `{{description}}`, `{{location}}`, `{{country}}`.

## Notes

- Rows with empty emails are skipped (`skipped_no_email`) and still advance the cursor.
- Already-sent prospect ids (status `sent` / `dry_run`) are skipped.
- Keep batch sizes modest; Gmail rate-limits aggressive sending.
- Redraft copy in `outreach.md` before real campaigns.
