# Cold Email Prospects (1,000)

Prospect list for cold outreach to **software companies, tech agencies, and startups** with under ~100 employees in **English-speaking markets**.

## Primary deliverable

| File | Description |
|------|-------------|
| `prospects-1000.csv` | Spreadsheet-ready list (1,000 rows) |
| `prospects-1000.json` | Same data as JSON |
| `prospects-200.csv` / `.json` | Earlier 6-country subset (kept for reference) |
| `raw/` | Intermediate research batches used to build the list |

## Columns

| Column | Meaning |
|--------|---------|
| `company_name` | Legal / trading name |
| `location` | City / region |
| `country` | Market |
| `website` | Company site when found |
| `contact_emails` | Public emails (`;`-separated). Prefer careers / HR / founder / hello / info |
| `contact_role` | Who the inbox is aimed at |
| `description` | Short note on what they do |
| `employee_estimate` | Estimated headcount (target: under 100) |
| `source_platform` | `Indeed` or `LinkedIn` (discovery source) |
| `source_job` | Job post that surfaced the company |

## Coverage (1,000 total)

| Country | Count |
|---------|------:|
| United States | 401 |
| United Kingdom | 116 |
| Australia | 78 |
| Canada | 71 |
| India | 65 |
| Nigeria | 59 |
| South Africa | 57 |
| Kenya | 38 |
| Philippines | 34 |
| Ireland | 28 |
| Singapore | 23 |
| Ghana | 16 |
| New Zealand | 14 |

- **317 / 1,000** have at least one public contact email
- Discovery mix: ~232 Indeed, ~768 LinkedIn
- English-speaking markets only (Senegal and other non-English markets excluded from this list)

## How prospects were found

1. Searched **Indeed** and **LinkedIn Jobs** only for software / fullstack / frontend / backend / agency / startup / Shopify / WordPress roles.
2. Recorded the **employer** on each job post.
3. Visited company websites when available for public contact emails.
4. Kept companies that appear **under ~100 employees** from public signals. Excluded clear large enterprises (FAANG, major consultancies, large banks) when obvious.

## Important caveats

- **Most emails are empty or generic.** At this scale, personal CEO emails are rarely public. Enrich before campaigns (Hunter, Apollo, contact-page crawl).
- **Employee counts are estimates.** Re-check LinkedIn company size before sending.
- Job posts and emails go stale; verify before outreach.
- Comply with local email marketing / spam laws (CAN-SPAM, PECR/UK GDPR, Australia Spam Act, CASL, POPIA, NDPR, etc.).

## Suggested next steps

1. Import `prospects-1000.csv` into CRM / DB.
2. Enrich missing emails and verify headcount.
3. Score by fit (agency vs product vs fintech) and country.
4. Build sequences and launch the cold-email system.
