# Data pipeline

Extracts patent filing requirements from the source Excel pricelists in `../INTA/Price_Lists/` and emits `../assets/data/requirements.json` for the website to consume.

## One-time setup

From the repo root (`Rouse-MENA_INFO/`):

```bash
python3 -m venv .venv
.venv/bin/pip install -r data-pipeline/requirements.txt
```

The venv lives at `Rouse-MENA_INFO/.venv/` and is git-ignored.

## Run the extractor

From the repo root:

```bash
.venv/bin/python data-pipeline/extract.py
```

The script is path-agnostic — it anchors on its own location, so you can run it from anywhere using its absolute path.

## What it does

1. Iterates every `.xlsx` in `../INTA/Price_Lists/`.
2. Identifies the country (or regional system) from the filename via a hardcoded metadata table.
3. Locates the formality table by searching for known document names, not by row index — handles layout variation across files.
4. Reads the six formality columns (Document, Required, Format, Authentication, Translation, Deadline).
5. Reads the "Minimum requirements for filing" panel by searching for the "Applicant" header.
6. Normalises common typos in the source data (`Appostile` → `Apostille`, `Certifed` → `Certified`).
7. Writes a structured JSON file matching the schema in `instructions.md` §5.

## Outputs

- `../assets/data/requirements.json` — public-facing data consumed by the website.
- `extract.log` — warnings for any rows or files that could not be parsed (empty if all clean).

## Adding a new country

1. Drop the new `.xlsx` into `../INTA/Price_Lists/`.
2. Add an entry to the `COUNTRIES` (or `REGIONAL_SYSTEMS`) dict in `extract.py`. Key it by the cleaned filename (lowercase, year and "- Patent" suffix stripped).
3. Re-run the extractor and commit the regenerated JSON.
