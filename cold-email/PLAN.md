# Cold Email System — Implementation Plan

Backend API that sends batched cold emails to prospects from `prospects/prospects-1000.csv`, attaches a CV, and logs sends/replies in Google Sheets. Cursor position is persisted so each run continues where the last left off.

---

## Goals

1. **Batch send** cold emails (not all 1,000 at once).
2. **Personalize** a reusable template with company name + description.
3. **Attach CV** (file added to the repo later).
4. **Track sends** in Google Sheets: company, sent_at, replied_at.
5. **Persist cursor** so the next run starts at the next unsent prospect.
6. **Backend API** only for now (UI later if needed).

Out of scope for v1: reply inbox parsing automation (column exists; fill manually or via later webhook), A/B templates, bounce handling beyond basic logging.

---

## Recommended stack

| Piece | Choice | Why |
|-------|--------|-----|
| Runtime | Node.js + TypeScript | Matches existing repo |
| API | Fastify (or Express) in `cold-email/` | Clean separation from the React Router books app |
| Email | Resend or Nodemailer + SMTP | Resend is simple for transactional; SMTP works with Gmail/Workspace |
| Sheets | Google Sheets API (service account) | Exact tracking surface you asked for |
| Prospects | Read `prospects/prospects-1000.csv` | Already in repo |
| Config | `.env` | Secrets stay out of git |
| Cursor store | Google Sheet “State” tab **or** local `state.json` | Sheets keeps everything in one place; local file is simpler for local runs |

**Recommendation:** put the service under `cold-email/` as its own package so the books frontend stays untouched. Cursor + send log live in one Google Spreadsheet (two tabs: `Sends`, `State`).

---

## Architecture

```
┌─────────────────┐     POST /send-batch      ┌──────────────────────┐
│  You / cron /   │ ───────────────────────►  │  cold-email API      │
│  script client  │                           │  (Fastify)           │
└─────────────────┘                           └──────────┬───────────┘
                                                         │
                    ┌────────────────────────────────────┼────────────────────┐
                    ▼                                    ▼                    ▼
           prospects-1000.csv                    Email provider         Google Sheets
           (+ assets/cv.pdf)                     (Resend/SMTP)          Sends + State tabs
```

### Flow per batch run

1. Load cursor (`current_index`) from Sheets `State` tab (or `state.json`).
2. Read next `N` prospects from CSV starting at that index (skip rows with empty `contact_emails`).
3. For each prospect:
   - Render email HTML/text from template (`{{company_name}}`, `{{description}}`).
   - Send email with CV attachment.
   - Append row to Sheets `Sends`: name, emails, sent_at, replied_at (blank), prospect_id, status.
4. Advance cursor by number of **attempted** rows (or only successful — decide below).
5. Return summary: `{ started_at_index, sent, skipped, failed, next_index }`.

---

## Google Sheet schema

### Tab: `Sends`

| Column | Type | Notes |
|--------|------|--------|
| `prospect_id` | number | From CSV `id` |
| `company_name` | string | |
| `contact_emails` | string | Address(es) used |
| `location` | string | Optional, useful for filtering |
| `sent_at` | ISO datetime | When we sent |
| `replied_at` | ISO datetime / blank | Filled when you get a reply (manual v1) |
| `status` | enum | `sent` / `failed` / `skipped_no_email` |
| `error` | string | Failure reason if any |
| `batch_id` | string | UUID for the run |

### Tab: `State`

| Key | Value |
|-----|--------|
| `current_index` | Next CSV row index to process (0-based into the filtered/sendable list **or** raw CSV id — pick one and document it) |
| `updated_at` | Last run timestamp |
| `last_batch_id` | Last batch UUID |

**Index convention (recommended):** store the next **CSV `id`** to process (1–1000). Skip rows with no email without counting them as “sent”, but still advance past them so we don’t retry forever. Persist the highest `id` we have finished processing.

---

## API surface (v1)

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/health` | Liveness |
| `GET` | `/status` | Cursor, last batch, counts from Sheets |
| `POST` | `/send-batch` | Body: `{ batchSize?: number }` (default 10, max e.g. 25) |
| `POST` | `/preview` | Body: `{ prospectId }` — render template without sending |
| `POST` | `/mark-replied` | Body: `{ company_name }` or `{ prospect_id }` — set `replied_at` now |

Protect mutating routes with a simple `API_KEY` header for v1.

---

## Email template (draft structure)

Subject and body are placeholders until you redraft. Variables: `{{company_name}}`, `{{description}}`.

**Subject (draft):**
```text
Quick intro — software engineer for {{company_name}}
```

**Body (draft):**
```text
Hi {{company_name}} team,

I'm a software engineer with 3+ years of experience across frontend, backend, and mobile.
I've shipped products in AI, marketplace/aggregator platforms, and edtech — including [brief project hooks once CV is finalized].

I came across {{company_name}} ({{description}}) and would love to contribute to what you're building.

I've attached my CV. Happy to share more or jump on a short call if useful.

Best regards,
[Your Name]
[Phone / LinkedIn / Portfolio]
```

Implementation: store as `cold-email/templates/outreach.md` (or `.html`) and render with a tiny mustache/replace helper. Easy to redraft later without code changes.

**Attachment:** `cold-email/assets/cv.pdf` (gitignored until you add it, or committed when ready). Env `CV_PATH` override.

---

## Project layout

```text
cold-email/
  package.json
  tsconfig.json
  .env.example
  src/
    index.ts              # boot server
    config.ts             # env
    routes/
      health.ts
      status.ts
      send-batch.ts
      preview.ts
      mark-replied.ts
    services/
      prospects.ts        # CSV load + slice by cursor
      template.ts         # render subject/body
      mailer.ts           # Resend/Nodemailer + CV attach
      sheets.ts           # Google Sheets read/write
      cursor.ts           # get/set current_index
    types.ts
  templates/
    outreach.md
  assets/
    .gitkeep              # cv.pdf added later
  README.md
```

Prospects path: `../prospects/prospects-1000.csv` (or env `PROSPECTS_CSV`).

---

## Environment variables

```bash
PORT=8787
API_KEY=...

# Email
EMAIL_FROM="Your Name <you@domain.com>"
EMAIL_PROVIDER=resend          # or smtp
RESEND_API_KEY=...
# or SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS

# Google Sheets
GOOGLE_SERVICE_ACCOUNT_EMAIL=...
GOOGLE_PRIVATE_KEY=...         # or path to JSON key file
GOOGLE_SHEETS_ID=...

# App
PROSPECTS_CSV=../prospects/prospects-1000.csv
CV_PATH=./assets/cv.pdf
DEFAULT_BATCH_SIZE=10
MAX_BATCH_SIZE=25
SEND_DELAY_MS=1500             # polite pacing between emails
```

---

## Safety rules (important for cold email)

1. **Only send to rows with `contact_emails`.** Skip empties; log as `skipped_no_email`.
2. **Cap batch size** (default 10). Never expose an “send all” endpoint in v1.
3. **Delay between sends** (`SEND_DELAY_MS`) to reduce spam risk.
4. **Dry-run mode** (`DRY_RUN=true`): render + log Sheets as `dry_run`, do not call mailer.
5. **Idempotency:** before send, check Sheets if `prospect_id` already has `status=sent`; skip if so.
6. **Compliance:** include a clear identity and opt-out line when you finalize copy; respect local laws (CAN-SPAM, PECR, CASL, etc.).

---

## Implementation phases

### Phase 1 — Skeleton
- Scaffold `cold-email/` package, config, health route, CSV loader.
- Unit-test: load CSV, slice by id, skip empty emails.

### Phase 2 — Template + preview
- `templates/outreach.md` + renderer.
- `POST /preview` returns subject/body for a prospect id.
- Placeholder CV path with clear error if missing when sending.

### Phase 3 — Mailer
- Integrate Resend (or SMTP).
- Attach CV when file exists.
- Dry-run flag.

### Phase 4 — Google Sheets + cursor
- Service account auth.
- Create/ensure `Sends` + `State` tabs.
- Wire cursor get/set and append-on-send.
- Idempotent skip if already sent.

### Phase 5 — Send batch API
- `POST /send-batch` end-to-end.
- `GET /status`, `POST /mark-replied`.
- README: how to create Sheet, share with service account, set env, run locally.

### Phase 6 — Harden
- Rate limits, better error logging, optional cron script (`npm run send:batch`).
- Redraft final email copy with you; drop in real `cv.pdf`.

---

## Decisions to confirm before coding

1. **Email provider:** Resend vs Gmail/Workspace SMTP vs other?
2. **Cursor storage:** Google Sheets `State` tab only, or also local `state.json` backup?
3. **Default batch size:** 10 OK?
4. **Advance cursor on failure?** Recommended: advance only on success/skip; leave failed id for retry (or mark failed and advance — your call).
5. **Multiple emails per company:** send to all listed addresses, or first only?
6. **Where to host the API** later (Fly, Railway, VPS)? Not blocking v1 local.

---

## Success criteria for v1

- [ ] `POST /send-batch` with `batchSize: 5` sends ≤5 personalized emails with CV attached.
- [ ] Sheets gains one row per attempt with `company_name` + `sent_at`.
- [ ] `replied_at` can be set via `POST /mark-replied`.
- [ ] Second run continues from saved cursor (does not re-send already-sent ids).
- [ ] Empty-email prospects are skipped safely.
- [ ] Template file can be edited without code changes.
- [ ] Dry-run works without sending real mail.

---

## Immediate next step after plan approval

Implement **Phase 1–5** in `cold-email/` on this branch (or a dedicated feature branch), starting with Resend + Sheets unless you specify SMTP instead.
