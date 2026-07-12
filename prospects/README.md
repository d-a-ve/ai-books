# Cold Email Prospects (200)

Prospect list for cold outreach to **software companies, tech agencies, and startups** in Nigeria, Kenya, United Kingdom, Australia, South Africa, and Senegal.

## Files

| File | Description |
|------|-------------|
| `prospects-200.csv` | Spreadsheet-ready list (primary deliverable) |
| `prospects-200.json` | Same data as JSON |
| `build_list.py` | Script used to rebalance country quotas |

## Columns

| Column | Meaning |
|--------|---------|
| `company_name` | Legal / trading name |
| `location` | City / region |
| `country` | Target market |
| `website` | Company site when found |
| `contact_emails` | Public emails (`;`-separated). Prefer careers / HR / founder / hello / info |
| `contact_role` | Who the inbox is aimed at |
| `description` | Short note on what they do |
| `employee_estimate` | Estimated headcount (target: under 100) |
| `source_platform` | `Indeed` or `LinkedIn` (discovery source) |
| `source_job` | Job post that surfaced the company |

## Coverage (200 total)

| Country | Count |
|---------|------:|
| Nigeria | 46 |
| United Kingdom | 40 |
| Australia | 38 |
| Kenya | 32 |
| South Africa | 24 |
| Senegal | 20 |

- **176 / 200** have at least one public contact email
- Discovery mix: ~108 Indeed, ~92 LinkedIn

## How prospects were found

1. Searched **Indeed** and **LinkedIn Jobs** only for software / fullstack / frontend / backend / agency / startup roles in each market.
2. Recorded the **employer** on each job post (not the recruiter’s client when unnamed).
3. Visited company websites (contact, about, careers, privacy) and, where present, job-post application emails.
4. Kept companies that appear **under ~100 employees** from public signals (LinkedIn size bands, About pages, job copy). Excluded clear large banks and global giants when obvious.

## Important caveats

- **Emails are public inboxes**, not guaranteed CEO personal addresses. Most small firms publish `hello@`, `info@`, `careers@`, or `hr@` only.
- **Employee counts are estimates**. Re-check LinkedIn company size before sending.
- **Senegal** has fewer LinkedIn/Indeed software listings than other markets; the Senegal set is smaller and includes agencies / nearshore recruiters that post Dakar roles.
- Some rows have empty `contact_emails` — website forms only, or no crawlable inbox. Still useful for LinkedIn outreach.
- Job posts and emails go stale; verify before campaigns.
- Comply with local email marketing / spam laws (e.g. PECR/UK GDPR, Australia Spam Act, POPIA, NDPR).

## Suggested next steps (product build)

1. Import CSV into a CRM or simple SQLite/Postgres table.
2. Enrich missing emails (Hunter, Apollo, or manual contact-page crawl).
3. Score by fit (agency vs product vs fintech) and country.
4. Draft sequences and launch the cold-email system.
