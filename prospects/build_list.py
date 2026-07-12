#!/usr/bin/env python3
"""Rebuild a geographically balanced 200-prospect list from researched data."""

import csv
import json
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent

# Load the previously written oversized set if present; otherwise load final and note.
# We reconstruct by loading prospects-200.json and also keeping cut SA/SN entries inline.

base = json.loads((ROOT / "prospects-200.json").read_text())

# Additional SA/SN (and others) that may have been cut when preferring email-bearing rows first
extras = [
    {
        "company_name": "Optimim",
        "location": "Cape Town, South Africa",
        "country": "South Africa",
        "website": "https://optimim.co.za",
        "contact_emails": "",
        "contact_role": "product engineering",
        "description": "Cape Town software product company building PHP/web solutions for the SA market.",
        "employee_estimate": "<50",
        "source_platform": "Indeed",
        "source_job": "Software Developer",
    },
    {
        "company_name": "SOFTA",
        "location": "Johannesburg, South Africa",
        "country": "South Africa",
        "website": "https://softa.co.za",
        "contact_emails": "",
        "contact_role": "founders",
        "description": "Johannesburg software firm hiring junior full-stack / AI-enthusiast developers.",
        "employee_estimate": "<50",
        "source_platform": "Indeed",
        "source_job": "Junior Full-Stack Developer",
    },
    {
        "company_name": "Prime Meridian Direct",
        "location": "Johannesburg, South Africa",
        "country": "South Africa",
        "website": "https://www.primemeridiandirect.com",
        "contact_emails": "",
        "contact_role": "product engineering",
        "description": "Insurance/fintech product company hiring full-stack Python developers.",
        "employee_estimate": "<100",
        "source_platform": "Indeed",
        "source_job": "Full-Stack Python Developer",
    },
    {
        "company_name": "Select Africa",
        "location": "Johannesburg, South Africa",
        "country": "South Africa",
        "website": "https://selectafrica.net",
        "contact_emails": "",
        "contact_role": "tech lead",
        "description": "Financial-services tech team hiring software developer interns (.NET/SQL).",
        "employee_estimate": "<100",
        "source_platform": "Indeed",
        "source_job": "Software Developer Intern",
    },
    {
        "company_name": "IndSAfri",
        "location": "Roodepoort, South Africa",
        "country": "South Africa",
        "website": "https://indsafri.com",
        "contact_emails": "",
        "contact_role": "engineering management",
        "description": "Software/services firm hiring permanent software developers for enterprise systems.",
        "employee_estimate": "<100",
        "source_platform": "Indeed",
        "source_job": "Software Developer - Permanent",
    },
    {
        "company_name": "Bluespec Holdings",
        "location": "Sandton, South Africa",
        "country": "South Africa",
        "website": "https://bluespec.co.za",
        "contact_emails": "",
        "contact_role": "tech leadership",
        "description": "Sandton tech group hiring AI developer interns.",
        "employee_estimate": "<100",
        "source_platform": "Indeed",
        "source_job": "AI Developer Intern",
    },
    {
        "company_name": "Hire Hangar",
        "location": "Cape Town / Johannesburg, South Africa",
        "country": "South Africa",
        "website": "https://www.hirehangar.com",
        "contact_emails": "",
        "contact_role": "ops",
        "description": "AI-powered global recruiting firm hiring SA full-stack developers.",
        "employee_estimate": "<100",
        "source_platform": "Indeed",
        "source_job": "Frontend-Focused Full Stack Developer",
    },
    {
        "company_name": "Hire Overseas",
        "location": "Cape Town, South Africa",
        "country": "South Africa",
        "website": "https://hireoverseas.com",
        "contact_emails": "",
        "contact_role": "product",
        "description": "Remote hiring platform with Cape Town roles for web developer & designer.",
        "employee_estimate": "<100",
        "source_platform": "Indeed",
        "source_job": "Web Developer & Designer",
    },
    {
        "company_name": "Sable International",
        "location": "Cape Town, South Africa",
        "country": "South Africa",
        "website": "https://www.sableinternational.com",
        "contact_emails": "",
        "contact_role": "tech / product",
        "description": "International services firm with Cape Town tech team hiring SQL developers.",
        "employee_estimate": "<100",
        "source_platform": "Indeed",
        "source_job": "Junior SQL Developer",
    },
    {
        "company_name": "Upstream",
        "location": "Johannesburg, South Africa",
        "country": "South Africa",
        "website": "https://www.upstreamsystems.com",
        "contact_emails": "",
        "contact_role": "engineering managers",
        "description": "Digital engagement / software firm hiring Java software engineers.",
        "employee_estimate": "<100",
        "source_platform": "Indeed",
        "source_job": "Software Engineer, Java",
    },
    {
        "company_name": "Speechify",
        "location": "Johannesburg, South Africa",
        "country": "South Africa",
        "website": "https://speechify.com",
        "contact_emails": "",
        "contact_role": "platform engineering",
        "description": "Text-to-speech product company hiring platform software engineers from Johannesburg.",
        "employee_estimate": "<100",
        "source_platform": "Indeed",
        "source_job": "Software Engineer, Platform",
    },
    {
        "company_name": "Team Liquid",
        "location": "Johannesburg, South Africa",
        "country": "South Africa",
        "website": "https://www.teamliquid.com",
        "contact_emails": "",
        "contact_role": "digital product",
        "description": "Esports org with Johannesburg digital-product full-stack engineer hiring.",
        "employee_estimate": "<100 local",
        "source_platform": "Indeed",
        "source_job": "Full Stack Engineer",
    },
    {
        "company_name": "Paathz",
        "location": "Dakar, Senegal",
        "country": "Senegal",
        "website": "https://paathz.com",
        "contact_emails": "",
        "contact_role": "engineering / founders",
        "description": "Tech company hiring Software Engineer (AI Algorithm) in Senegal.",
        "employee_estimate": "<50",
        "source_platform": "LinkedIn",
        "source_job": "Software Engineer (AI Algorithm)",
    },
    {
        "company_name": "TEHORA inc.",
        "location": "Dakar, Senegal",
        "country": "Senegal",
        "website": "https://tehora.ca",
        "contact_emails": "",
        "contact_role": "digital twin engineering",
        "description": "Engineering firm hiring portal/dashboard developer for digital-twin work in Dakar.",
        "employee_estimate": "~31",
        "source_platform": "LinkedIn",
        "source_job": "Développeur(se) portail / Tableaux de bord",
    },
    {
        "company_name": "Rekruit Nearshore",
        "location": "Senegal (nearshore)",
        "country": "Senegal",
        "website": "https://rekruitnearshore.com",
        "contact_emails": "",
        "contact_role": "nearshore delivery",
        "description": "Nearshore IT recruiting firm hiring ServiceNow developers/analysts in Senegal.",
        "employee_estimate": "<50",
        "source_platform": "LinkedIn",
        "source_job": "Développeur/Analyste fonctionnel ServiceNow",
    },
    {
        "company_name": "SBS",
        "location": "Dakar, Senegal",
        "country": "Senegal",
        "website": "https://www.s-b-s.fr",
        "contact_emails": "",
        "contact_role": "digital consulting",
        "description": "Digital consulting firm actively hiring Consultant PS Digital in Dakar.",
        "employee_estimate": "<100",
        "source_platform": "LinkedIn",
        "source_job": "Consultant PS Digital",
    },
    {
        "company_name": "The Flex",
        "location": "Dakar, Senegal",
        "country": "Senegal",
        "website": "https://theflex.com",
        "contact_emails": "",
        "contact_role": "product / design",
        "description": "Company hiring UX/UI Designer in Dakar via LinkedIn Senegal listings.",
        "employee_estimate": "<100",
        "source_platform": "LinkedIn",
        "source_job": "UX/UI Designer",
    },
    {
        "company_name": "Chapter One",
        "location": "Dakar, Senegal",
        "country": "Senegal",
        "website": "https://chapterone.com",
        "contact_emails": "",
        "contact_role": "engineering lead",
        "description": "Product/engineering team hiring full-stack React Native/NestJS engineers with Dakar visibility.",
        "employee_estimate": "<50",
        "source_platform": "LinkedIn",
        "source_job": "Full Stack Software Engineer",
    },
    {
        "company_name": "Galimatech",
        "location": "Dakar, Senegal",
        "country": "Senegal",
        "website": "",
        "contact_emails": "",
        "contact_role": "",
        "description": "Dakar nearshore Java/Angular software company visible via LinkedIn Senegal job search.",
        "employee_estimate": "<100",
        "source_platform": "LinkedIn",
        "source_job": "Java / Angular Developer",
    },
    {
        "company_name": "EPF Africa",
        "location": "Dakar, Senegal",
        "country": "Senegal",
        "website": "https://www.epf.fr",
        "contact_emails": "",
        "contact_role": "academic / digital",
        "description": "Engineering school campus in Dakar hiring UX/UI Design professors.",
        "employee_estimate": "<100 campus",
        "source_platform": "LinkedIn",
        "source_job": "Recrutement de professeurs en UX/UI Design",
    },
]

# Merge
seen = {p["company_name"].strip().lower() for p in base}
pool = list(base)
for e in extras:
    key = e["company_name"].strip().lower()
    if key not in seen:
        seen.add(key)
        pool.append(e)

# Target quotas (sum = 200)
quotas = {
    "Nigeria": 40,
    "Kenya": 32,
    "United Kingdom": 40,
    "Australia": 38,
    "South Africa": 30,
    "Senegal": 20,
}

by_country = defaultdict(list)
for p in pool:
    by_country[p["country"]].append(p)

# Prefer email-bearing within each country
def sort_key(p):
    return (0 if p.get("contact_emails") else 1, p["company_name"].lower())


final = []
for country, quota in quotas.items():
    rows = sorted(by_country.get(country, []), key=sort_key)
    take = rows[:quota]
    final.extend(take)
    if len(take) < quota:
        print(f"WARN: {country} only has {len(take)}/{quota}")

# If under 200 due to short countries, top up from remaining with emails
if len(final) < 200:
    taken = {p["company_name"].strip().lower() for p in final}
    leftovers = [p for p in pool if p["company_name"].strip().lower() not in taken]
    leftovers = sorted(leftovers, key=sort_key)
    final.extend(leftovers[: 200 - len(final)])

final = final[:200]
for i, p in enumerate(final, 1):
    p["id"] = i

fields = [
    "id",
    "company_name",
    "location",
    "country",
    "website",
    "contact_emails",
    "contact_role",
    "description",
    "employee_estimate",
    "source_platform",
    "source_job",
]

with open(ROOT / "prospects-200.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
    w.writeheader()
    w.writerows(final)

(ROOT / "prospects-200.json").write_text(json.dumps(final, indent=2), encoding="utf-8")

print("Count:", len(final))
print("By country:", Counter(p["country"] for p in final))
print("With emails:", sum(1 for p in final if p.get("contact_emails")))
print("By source:", Counter(p["source_platform"] for p in final))
