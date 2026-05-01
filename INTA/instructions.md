# Rouse MEA Patent & Design Filing Hub
## Build Specification for AI Agent

> **Purpose of this document:** Complete instructions for an AI coding agent (Claude Code) to build the Rouse Middle East & Africa patent and design filing directory as a static site hosted on GitHub Pages. The site exposes filing requirements publicly; pricelists are gated behind a Microsoft Forms registration that emails the Rouse team.

---

## Table of contents

1. [Project overview](#1-project-overview)
2. [Architecture & stack](#2-architecture--stack)
3. [Repository structure](#3-repository-structure)
4. [Data pipeline (extraction from Excel)](#4-data-pipeline-extraction-from-excel)
5. [Data schema](#5-data-schema)
6. [Brand & design system](#6-brand--design-system)
7. [Page 1 — Landing page](#7-page-1--landing-page)
8. [Page 2 — Country detail page](#8-page-2--country-detail-page)
9. [Page 3 — Registration page](#9-page-3--registration-page)
10. [Microsoft Forms integration](#10-microsoft-forms-integration)
11. [Map implementation](#11-map-implementation)
12. [Build sequence (instructions for AI agent)](#12-build-sequence-instructions-for-ai-agent)
13. [Acceptance criteria](#13-acceptance-criteria)
14. [Maintenance & future work](#14-maintenance--future-work)

---

## 1. Project overview

### 1.1 What this is

A public directory of patent and design filing requirements across 25+ Middle East and Africa jurisdictions, hosted on GitHub Pages from the repository `pmuscat41/Rouse-MENA_INFO`. The site is a marketing and lead-generation tool for Rouse's MEA patent team.

### 1.2 What it isn't

This is **not** a public pricelist. Filing fees, professional fees, and translation costs remain confidential and are sent to verified foreign agents only after they register via a Microsoft Forms registration form.

### 1.3 Why this site exists

Foreign patent agents and in-house counsel routinely need to confirm:
- Whether a Power of Attorney needs notarisation, apostille, or simple signature
- Deadlines for filing formality documents after the application date
- Translation requirements per jurisdiction
- Which authority handles patents in each country

This information is currently scattered, often outdated online, and inconsistent between sources. Rouse's verified, current view is the differentiator. The site is also a lead-capture mechanism: every agent who requests fees becomes a known contact.

### 1.4 Target users

- **Primary:** Foreign IP agents and patent attorneys evaluating MEA filing for their clients
- **Secondary:** In-house counsel at multinational corporations with MEA exposure
- **Tertiary:** Rouse's own staff using it as an internal quick reference

### 1.5 Repository context

The repo (`pmuscat41/Rouse-MENA_INFO`) contains earlier abandoned attempts including:
- `index.html`, `country-detail.html` — dark glassmorphism map+grid
- `concept.html`, `concept_full.html` — tabbed dashboard with navy/gold palette (incorrect brand)
- `Rouse_MEA_Patents_Designs_OnePagers_v1.html` — utilitarian one-pager document approach
- `data.json` — earlier mixed prices+requirements data for ~14 jurisdictions
- `2025 - Middle East and Africa Patent Geographic Hub - Fee Sheet.xlsx` — original Excel source

**These are reference material only.** The new build replaces them with a clean implementation per this spec. The AI agent should preserve these files (don't delete) but build the new site as fresh files.

---

## 2. Architecture & stack

### 2.1 Hosting

GitHub Pages, served from the `main` branch root. No build process. No frameworks.

### 2.2 Stack

- **HTML5** for structure
- **Vanilla CSS** for styling (no Tailwind, no preprocessor)
- **Vanilla JavaScript (ES6)** for interactivity
- **D3.js v7** + **TopoJSON v3** loaded from cdnjs, for the map
- **world-atlas v2** TopoJSON country boundary data, loaded from jsdelivr
- **Microsoft Forms** for the registration form (separate, hosted on Microsoft 365)

### 2.3 No build tools

The site must run by simply opening `index.html` in a browser, or being served as static files by GitHub Pages. No npm install, no compilation, no bundling.

### 2.4 Browser support

Target: latest two versions of Chrome, Firefox, Safari, Edge. No IE11 support required.

### 2.5 Mobile

Fully responsive. The map collapses gracefully on narrow viewports; tabs and tables wrap appropriately.

---

## 3. Repository structure

```
Rouse-MENA_INFO/
├── index.html                    # Landing page with map
├── country.html                  # Country detail page (data-driven by ?id=xxx)
├── register.html                 # Registration page (redirects to MS Forms)
├── 404.html                      # Custom 404
├── assets/
│   ├── css/
│   │   └── main.css              # Single stylesheet
│   ├── js/
│   │   ├── landing.js            # Landing page logic (map + tabs)
│   │   ├── country.js            # Country page logic (renders detail)
│   │   └── shared.js             # Header, footer, common utilities
│   ├── img/
│   │   └── rouse-logo.svg        # Placeholder until brand SVG provided
│   └── data/
│       └── requirements.json     # All public-facing country data
├── data-pipeline/
│   ├── extract.py                # Excel → JSON extraction script
│   └── README.md                 # How to re-run the extraction
├── INTA/
│   └── Price_Lists/              # Source Excel files (commit to repo)
│       └── *.xlsx                # One file per country, or master workbook
├── archive/                      # Previous abandoned versions
│   └── (move old files here)
├── README.md                     # Public repo readme
└── BUILD_SPEC.md                 # This document
```

### 3.1 What goes in `archive/`

Move (don't delete) these earlier files into `archive/` to keep the root clean:
- `concept.html`, `concept_full.html`
- `memo.html`, `memo_modern.html`, `memo_presentation.html`
- `Rouse_MEA_Patents_Designs_OnePagers_v1.html`
- `map.ipynb`, `map2.ipynb`, `map_backup.py`
- `test 1.py`, `test2.py`, `viewhtml.py`
- The Natural Earth shapefiles at root (`ne_50m_admin_0_countries.*`)
- The old `data.json` (rename to `archive/data-old.json`)
- The old `index.html`, `country-detail.html` (rename to `archive/index-old.html` etc.)

---

## 4. Data pipeline (extraction from Excel)

### 4.1 Source location

All source data is in `INTA/Price_Lists/` as Excel files (`.xlsx`). There may be one master workbook with a sheet per country, or multiple workbooks one per country. The extraction script must handle both layouts.

### 4.2 Source data structure

Each country's data follows this format (taken from a verified UAE entry):

**Formality documents table (six columns):**
| Document | Required? | Format | Authentication | Translation | Deadline |
|---|---|---|---|---|---|
| Application in English | Yes | eCopy | Not applicable | English | On filing |
| Power of Attorney | Yes | eCopy | Simply signed | English | Within 2 months from filing date |
| Deed of Assignment | Yes | eCopy | Simply signed | English | Within 4 months from filing date |
| Commercial Certificate | Yes | eCopy | Simple copy | English | None |
| Priority application | Yes, if not lodged in international phase | eCopy | Certified | English | Within 3 months from filing date |
| PCT application (Publication, ISR, WO, IPRP) | Yes | eCopy | Simple copy | English | None |

**Information required on filing (parallel list):**
- Applicant address and nationality
- Inventor(s) address and nationality
- Application in English
- Priority application date and number
- PCT application date and number

**Plus separately, NOT to be exposed publicly:**
- Professional fees per service
- Official fees per service
- Individual vs company fee tiers
- Translation costs per language

### 4.3 Extraction logic

The extraction script (`data-pipeline/extract.py`) must:

1. **Iterate** every `.xlsx` file in `INTA/Price_Lists/`
2. **Identify** the country name (from sheet name, file name, or a header cell — the script should be tolerant)
3. **Locate** the formality documents table within the sheet — it may not start at A1; search for header rows containing "Formality documents", "Required?", "Document"
4. **Extract** the six columns into structured rows
5. **Locate** the "Information/Documents required on filing" panel (may be a parallel column or a separate section)
6. **Skip** any columns containing fee data (`prof_fee`, `comm_fee`, `indiv_fee`, currency-prefixed cells)
7. **Output** a single `data/requirements.json` file matching the schema in section 5
8. **Log** any rows or columns it could not parse, for human review

### 4.4 Required Python libraries

```bash
pip install openpyxl pandas
```

`openpyxl` for `.xlsx` reading, `pandas` for tabular manipulation. Both standard, both available on any Python install.

### 4.5 Re-running the extraction

When new Excel files are added or existing ones updated:

```bash
cd data-pipeline
python extract.py
```

The script overwrites `assets/data/requirements.json`. Commit the regenerated JSON.

### 4.6 Data validation

The script must validate before writing:
- Every country has at least one formality document
- Every formality document has all six columns populated (use empty string `""` for missing values, never `null`)
- Country names are consistent (no "UAE" vs "United Arab Emirates" mixed)
- Last-verified date is present per country (default to today's date if missing)

### 4.7 Confidence flag

If the source Excel includes a confidence indicator per row (e.g., "Conf ~70%"), preserve it as a `confidence` field. If not present, omit the field.

---

## 5. Data schema

### 5.1 `assets/data/requirements.json`

```json
{
  "countries": [
    {
      "id": "uae",
      "name": "United Arab Emirates",
      "region": "mideast",
      "iso_numeric": "784",
      "office": "UAE Ministry of Economy",
      "filing_language": "English",
      "routes": ["Paris", "PCT National Phase"],
      "coverage": "National",
      "law_reference": "Federal Law No. 11 of 2021",
      "last_verified": "2026-04-01",
      "formality_documents": [
        {
          "document": "Application in English",
          "required": "Yes",
          "format": "eCopy",
          "authentication": "Not applicable",
          "translation": "English",
          "deadline": "On filing",
          "confidence": null
        },
        {
          "document": "Power of Attorney",
          "required": "Yes",
          "format": "eCopy",
          "authentication": "Simply signed",
          "translation": "English",
          "deadline": "Within 2 months from filing date",
          "confidence": null
        }
      ],
      "information_required": [
        "Applicant address and nationality",
        "Inventor(s) address and nationality",
        "Application in English",
        "Priority application date and number",
        "PCT application date and number"
      ]
    }
  ],
  "regional_systems": [
    {
      "id": "aripo",
      "name": "ARIPO",
      "long_name": "African Regional Intellectual Property Organisation",
      "host_office_country": "Zimbabwe",
      "host_office_city": "Harare",
      "host_coordinates": [-17.8252, 31.0335],
      "member_states_count": 22,
      "treaty": "Harare Protocol",
      "filing_language": "English",
      "last_verified": "2026-04-01",
      "formality_documents": [],
      "information_required": []
    }
  ],
  "metadata": {
    "last_generated": "2026-04-01T00:00:00Z",
    "source": "INTA/Price_Lists/*.xlsx",
    "version": "1.0"
  }
}
```

### 5.2 Field rules

| Field | Type | Notes |
|---|---|---|
| `id` | string | URL slug (lowercase, hyphenated, e.g. `"uae"`, `"saudi-arabia"`) |
| `name` | string | Display name |
| `region` | enum | `"mideast"` or `"africa"` only |
| `iso_numeric` | string | ISO 3166-1 numeric code as string with leading zeros (e.g. `"048"` for Bahrain). Used to match TopoJSON country IDs. |
| `office` | string | Patent office name |
| `filing_language` | string | Language(s) accepted at filing |
| `routes` | array | Available filing routes |
| `coverage` | string | `"National"` or `"Regional"` |
| `law_reference` | string | Statute citation, optional |
| `last_verified` | string | ISO date (`YYYY-MM-DD`) |
| `formality_documents` | array of objects | Required documents — see 5.3 |
| `information_required` | array of strings | Info points needed on filing |

### 5.3 `formality_documents` object

Six required string fields plus optional `confidence`:

| Field | Required | Notes |
|---|---|---|
| `document` | yes | Document name |
| `required` | yes | `"Yes"`, `"No"`, or conditional like `"Yes, if applicant ≠ inventor"` |
| `format` | yes | `"eCopy"`, `"Original"`, `"Certified copy"`, etc. |
| `authentication` | yes | `"Simply signed"`, `"Notarised"`, `"Apostille"`, `"Legalised"`, `"Not applicable"` |
| `translation` | yes | Language name (`"English"`, `"Arabic"`, `"French"`) or `"Not required"` |
| `deadline` | yes | Free text, often `"On filing"`, `"Within X months"`, `"None"` |
| `confidence` | no | Float 0.0-1.0 if available, else `null` |

---

## 6. Brand & design system

> **Source of truth:** Rouse Brand Guideline 2025 (`archive/Rouse Guide - Branding.pdf`, 28 pages). All values below are taken from that document. Do not invent or substitute colours.

### 6.1 Colour palette

**Primary colours** (per brand guide p.12):

| Token | Hex | RGB | Pantone | Usage |
|---|---|---|---|---|
| `--rouse-purple` | `#5b2080` | 91-32-128 | 2597 C | Primary brand colour. CTA backgrounds, regional system markers, eyebrow text. |
| `--rouse-green` | `#096e4a` | 9-110-74 | 349 C | Map fill for covered countries, success/confirmation accents. |
| `--rouse-petrol` | `#007f9c` | 0-127-156 | 3145 C | Section headings, table header text, links and active states. |

**Secondary colours** (per brand guide p.12):

| Token | Hex | RGB | Pantone | Usage |
|---|---|---|---|---|
| `--rouse-orange` | `#d74021` | 215-64-34 | 7597 C | Soft accent for highlights, last-verified pill background. |
| `--rouse-red` | `#ac162c` | 172-22-44 | 187 C | Conditional pills (`Yes, if …`) — replaces the made-up "magenta" referenced in earlier drafts. |
| `--rouse-grey-dark` | `#232222` | — | Neutral Black C | Body text. |
| `--rouse-grey-mid` | `#706F6F` | 112-111-111 | — | Secondary text, captions, footer (matches email-signature spec, brand guide p.23). |

**Tints.** Each primary colour has 80 / 60 / 40 / 20 % tints in the brand guide. For UI use derive these in CSS rather than hardcoding:
- 20% tint of green (light fill backgrounds): `rgba(9,110,74,0.20)` or pre-mixed `#cee2da`
- 20% tint of purple (regional marker halo): `rgba(91,32,128,0.20)`
- 20% tint of red (conditional pill background): `rgba(172,22,44,0.10)`

**Neutrals (site-only, not in brand guide):**

| Token | Hex | Usage |
|---|---|---|
| `--neutral-bg` | `#FAFBFC` | Page background. |
| `--neutral-card` | `#FFFFFF` | Card and panel background. |
| `--neutral-sand` | `#FAF9F6` | Soft grouping background. |
| `--neutral-border` | `rgba(9,110,74,0.18)` | Default border (green at 18% opacity). |
| `--map-other` | `#E8E3DA` | Non-covered country fill on the map. |

### 6.2 The wordmark — asset, not CSS

The Rouse "ROUSE" wordmark is a multi-colour treatment of **three overlapping geometric blocks** of purple (`#5b2080`), green (`#096e4a`) and petrol (`#007f9c`) bleeding through every letter — **not** five solidly-coloured letters. The brand guide (p.9) explicitly forbids:

- Outlining, stretching, squeezing, or rotating the logo
- Changing the 3 primary colours
- Recreating the logo as a single colour
- Integrating the logo with copy

This means the wordmark **must be embedded as a vector asset**, not synthesised in CSS or HTML.

**Asset placement and usage:**

```html
<a href="index.html" class="rs-logo" aria-label="Rouse — return to hub">
  <img src="assets/img/rouse-logo.svg" alt="Rouse" width="120" height="32">
</a>
```

```css
.rs-logo img {
  display: block;
  height: 32px;
  width: auto;
}
```

**Three logo variants** are defined in the brand guide (p.6):
- **Primary logo** (3-colour) — for white / light backgrounds. Use this in the site header.
- **Black & white logo** — for dark or busy backgrounds. Optional, only if a dark CTA bar uses the wordmark.
- **Favicon** — the "R" glyph alone with the same 3-colour treatment. Use as `favicon.ico` / `favicon.svg`.

**Asset status (2026-05):**
- `INTA/Price_Lists/Rouse_Logo.png` (existing PNG) is the only logo asset currently in the repo.
- Patrick to provide the official SVG. Until then, copy the PNG to `assets/img/rouse-logo.png` and reference it; switch the `<img src>` to `.svg` once supplied.
- The earlier draft of this spec proposed a per-letter CSS recreation (R=teal, O=magenta, U=teal-blue, S=purple, E=teal). **That approach is wrong on three counts** — magenta is not in the brand, the colours quoted are not Rouse hexes, and the design isn't a per-letter solid-fill treatment. Do not use it.

### 6.3 Typography

Per brand guide p.10, the brand typeface is **Calibri** for all print and digital communications, with **Aptos** for PowerPoint and **Tahoma** as a fallback when Calibri isn't available.

For a static GitHub-Pages site served to foreign agents on every OS, Calibri is not licensable as a webfont. Use **Carlito** (an OFL-licensed, metric-compatible Calibri clone hosted on Google Fonts) as the primary web face, and let the cascade fall back to Calibri on Windows machines and Tahoma everywhere else.

```html
<link href="https://fonts.googleapis.com/css2?family=Carlito:wght@400;700&display=swap" rel="stylesheet">
```

```css
:root {
  --font-body: 'Carlito', 'Calibri', 'Aptos', 'Tahoma', sans-serif;
}
body { font-family: var(--font-body); }
```

**Type scale:**

- **Body:** 14px, weight 400, line-height 1.55, colour `#232222`
- **H1 (page title):** 24-28px, weight 700, colour `#232222`
- **H2 (section title):** 14-16px, weight 700, colour `#007f9c` (petrol)
- **Eyebrow text:** 11px, uppercase, letter-spacing 0.1em, weight 700, colour `#5b2080` (purple)
- **Table cells:** 12px, weight 400, colour `#232222`
- **Table headers:** 10px, uppercase, letter-spacing 0.04em, weight 700, petrol text on a 10%-green tint background
- **Captions / muted text:** 12px, weight 400, colour `#706F6F` (grey-mid)

Carlito only ships 400 and 700 — no 500 weight. Use 700 wherever the earlier draft of this spec called for "weight 500".

### 6.4 Layout principles

- **Page width:** max 1100px, centred
- **Card border radius:** 8-10px
- **Section spacing:** 18-24px vertical between major sections
- **Generous whitespace:** the site should never feel cramped. Foreign agents will skim — let them.
- **Sentence case throughout.** Never title case. Never ALL CAPS (except in eyebrow text styling).

### 6.5 Pills and badges

Status pills follow this pattern, using **brand colours only**:

```css
.rs-pill {
  display: inline-block;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 700;
  letter-spacing: 0.02em;
}
.rs-pill-yes  { background: rgba(9,110,74,0.12);   color: #096e4a; }   /* Green */
.rs-pill-cond { background: rgba(172,22,44,0.10);  color: #ac162c; }   /* Red — secondary */
.rs-pill-no   { background: #f0ece5;               color: #706F6F; }   /* Grey-mid */
```

- **Yes (green)** for unconditional yes
- **Conditional (red)** for "Yes, if X" phrasing — anything starting with "Yes," followed by a comma. (Earlier drafts used magenta, which is not a Rouse brand colour. Replaced with secondary red `#ac162c`.)
- **No (grey)** for "No" / "Not required"

The colour gives instant visual signal of which rows have conditions to read carefully.

---

## 7. Page 1 — Landing page

### 7.1 Purpose

Hero entry point. Communicates regional scope, lets users navigate to a specific country via the map, and serves as the registration call-to-action for users who already know they want fees.

### 7.2 Layout (top to bottom)

```
┌─────────────────────────────────────────────────────────┐
│  [ROUSE wordmark]    Jurisdictions  Regional  About  Request fees │
├─────────────────────────────────────────────────────────┤
│                                                         │
│         PATENT & DESIGN FILING HUB                      │
│                                                         │
│              Middle East & Africa                       │
│                                                         │
│   Filing requirements across 25+ jurisdictions,         │
│   prepared and verified by Rouse's regional team.       │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│         [ Middle East ]  [ Africa ]                     │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                                                         │
│                                                         │
│                  [INTERACTIVE MAP]                      │
│                                                         │
│             Hover/click any country                     │
│                                                         │
│                                                         │
│  [legend bottom-left]                                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  All jurisdictions                       14 of 25+ live │
│                                                         │
│  [UAE] [Saudi] [Egypt] [Kuwait] [Bahrain] [Oman]       │
│  [Qatar] [Israel] [Morocco] [South Africa] [Nigeria]   │
│  [Kenya] [ARIPO]   [OAPI]                               │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────┐   │
│  │  Request the MEA fee schedules                   │   │
│  │  Foreign agents register once...     [Request →] │   │
│  └──────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│  © Rouse 2026 · Information only      Last updated... │
└─────────────────────────────────────────────────────────┘
```

### 7.3 Tab system

Default to Middle East tab on page load. Click "Africa" to switch.

When a tab is clicked:
1. Update the active class on the tab buttons
2. Re-call `draw(region)` with the new region
3. The D3 projection re-fits to the new region's bounding box
4. Country shapes redraw with the new geography
5. Regional system markers (ARIPO, OAPI) appear only on Africa

### 7.4 Map specifications

See section 11 for full map implementation details.

### 7.5 Country grid

Below the map, a 3-column grid lists every covered jurisdiction. Each card is a clickable link to that country's detail page (`country.html?id=uae`).

**Card variations:**
- **National jurisdictions:** white background, teal border at 18% opacity, dark text
- **Regional systems (ARIPO, OAPI):** purple-tinted background (`rgba(107,42,137,0.06)`), purple border, purple text, weight 500 — visually distinct from countries because they aren't countries

### 7.6 Reference HTML

The complete working mockup is provided in section 7.7. The agent should treat this as the structural reference and adapt — not copy verbatim, since it needs to be data-driven from `requirements.json` rather than hardcoded.

### 7.7 Reference: full landing page HTML

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rouse | Middle East & Africa Patent Filing Hub</title>
  <link rel="icon" type="image/svg+xml" href="assets/img/favicon.svg">
  <link href="https://fonts.googleapis.com/css2?family=Carlito:wght@400;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/css/main.css">
</head>
<body>
  <header class="rs-header">
    <a href="index.html" class="rs-logo" aria-label="Rouse — return to hub">
      <img src="assets/img/rouse-logo.svg" alt="Rouse" width="120" height="32">
    </a>
    <nav class="rs-nav">
      <a href="#jurisdictions">Jurisdictions</a>
      <a href="#regional">Regional systems</a>
      <a href="#about">About</a>
      <a href="register.html" class="rs-cta">Request fees</a>
    </nav>
  </header>

  <section class="rs-hero">
    <p class="rs-eyebrow">Patent &amp; design filing hub</p>
    <h1 class="rs-h1">Middle East &amp; Africa</h1>
    <p class="rs-sub">Filing requirements across 25+ jurisdictions, prepared and verified by Rouse's regional team. Click any country on the map to see what's needed and when.</p>
  </section>

  <div class="rs-tabs" id="rs-tabs">
    <button class="rs-tab active" data-region="mideast">Middle East</button>
    <button class="rs-tab" data-region="africa">Africa</button>
  </div>

  <div class="rs-mapwrap">
    <div id="rs-map"></div>
    <div id="rs-tip" class="rs-tip"></div>
    <div class="rs-mlegend">
      <div class="rs-leg-item"><span class="rs-leg-sw" style="background:#096e4a;"></span><span>Covered jurisdiction</span></div>
      <div class="rs-leg-item"><span class="rs-leg-sw" style="background:#E8E3DA;"></span><span>Other</span></div>
      <div class="rs-leg-item"><span class="rs-leg-sw rs-leg-regional"></span><span>Regional system</span></div>
    </div>
  </div>

  <section id="jurisdictions" class="rs-grid-section">
    <div class="rs-grid-head">
      <h2>All jurisdictions</h2>
      <span id="rs-count">14 of 25+ live</span>
    </div>
    <div id="rs-grid" class="rs-grid"></div>
  </section>

  <section class="rs-cta-bar">
    <div class="rs-cta-text">
      <strong>Request the MEA fee schedules</strong>
      <span>Foreign agents register once and we send the schedules direct.</span>
    </div>
    <a href="register.html" class="rs-cta-btn">Request access →</a>
  </section>

  <footer class="rs-foot">
    <span>© Rouse 2026 · Information only, not legal advice</span>
    <span>Last updated <span id="rs-updated">April 2026</span></span>
  </footer>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/topojson/3.0.2/topojson.min.js"></script>
  <script src="assets/js/shared.js"></script>
  <script src="assets/js/landing.js"></script>
</body>
</html>
```

### 7.8 `assets/js/landing.js` core logic

```javascript
// Load requirements.json, then build the map and grid.
fetch('assets/data/requirements.json')
  .then(r => r.json())
  .then(data => {
    initGrid(data);
    initMap(data);
  });

function initGrid(data) {
  const grid = document.getElementById('rs-grid');
  const all = [...data.countries, ...data.regional_systems];
  all.forEach(item => {
    const card = document.createElement('a');
    card.className = 'rs-card' + (item.coverage === 'Regional' ? ' regional' : '');
    card.href = `country.html?id=${item.id}`;
    card.textContent = item.name;
    grid.appendChild(card);
  });
  document.getElementById('rs-count').textContent = `${all.length} of 25+ live`;
}

// initMap implementation — see section 11.
```

---

## 8. Page 2 — Country detail page

### 8.1 Purpose

Single-country deep-view showing filing requirements, key facts, and a country-specific call-to-action for fee schedules.

### 8.2 URL pattern

`country.html?id=uae` — driven by query string. The page reads `id`, looks it up in `requirements.json`, and renders.

### 8.3 Layout (top to bottom)

```
┌─────────────────────────────────────────────────────────┐
│  [ROUSE wordmark]    Jurisdictions  Regional  About  Request fees │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Hub › Middle East › United Arab Emirates               │
│                                                         │
│  United Arab Emirates — patents & designs   Last verified: ... │
│                                                         │
│  Filing requirements at the UAE Ministry of Economy...  │
│                                                         │
│  ┌────────┬────────┬────────┬────────┐                 │
│  │Coverage│ Office │Filing L│ Routes │                 │
│  └────────┴────────┴────────┴────────┘                 │
│                                                         │
│  Formality documents              All eCopies accepted │
│  ┌─────────┬────────┬──────┬─────────┬────────┬──────┐ │
│  │Document │Required│Format│Authentic│Translat│Deadln│ │
│  ├─────────┼────────┼──────┼─────────┼────────┼──────┤ │
│  │Applicat │ [Yes]  │eCopy │Not appl │English │On fil│ │
│  │PoA      │ [Yes]  │eCopy │Simply s │English │2 mo  │ │
│  │Deed of  │ [Yes]  │eCopy │Simply s │English │4 mo  │ │
│  │Comm Cer │ [Yes]  │eCopy │Simple c │English │None  │ │
│  │Priority │[Yes,if]│eCopy │Certified│English │3 mo  │ │
│  │PCT app  │ [Yes]  │eCopy │Simple c │English │None  │ │
│  └─────────┴────────┴──────┴─────────┴────────┴──────┘ │
│                                                         │
│  ┌────────────────────────────────────────────────┐    │
│  │ INFORMATION REQUIRED ON FILING                 │    │
│  │ • Applicant address     • Inventor address     │    │
│  │ • Application English   • Priority date/no     │    │
│  │ • PCT date and number                          │    │
│  └────────────────────────────────────────────────┘    │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Request the UAE fee schedule           [Req →]   │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  ← Tunisia                                  Yemen →    │
└─────────────────────────────────────────────────────────┘
```

### 8.4 Six-column documentary table

The table is the core artefact of this page. Column widths (sum to 100%):

| Column | Width | Notes |
|---|---|---|
| Document | 22% | Document name |
| Required? | 14% | Status pill (yes / conditional / no) |
| Format | 9% | Original, eCopy, Certified copy |
| Authentication | 17% | Notarised / Apostille / Simply signed / etc. |
| Translation | 12% | Language name |
| Deadline | 26% | Free text, often the longest cell |

Header styling: 10px uppercase, letter-spacing 0.04em, weight 700, petrol text (`#007f9c`) on `rgba(9,110,74,0.10)` background (10% green tint, per §6.3).

Body cells: 12px, weight 400, line-height 1.45, vertical-align top, word-wrap break-word, colour `#232222`.

### 8.5 Pill rendering rule

```javascript
function renderRequiredPill(value) {
  if (value === 'No' || value === 'Not required') {
    return `<span class="rs-pill rs-pill-no">${value}</span>`;
  }
  if (value.startsWith('Yes,')) {
    // Conditional — strip "Yes, " for display, show condition
    const condition = value.substring(5).trim();
    return `<span class="rs-pill rs-pill-cond">${condition}</span>`;
  }
  if (value === 'Yes') {
    return `<span class="rs-pill rs-pill-yes">Yes</span>`;
  }
  // Fallback — render as plain pill
  return `<span class="rs-pill rs-pill-yes">${value}</span>`;
}
```

### 8.6 Information required panel

Below the table, separated by purple border-left. Two-column bullet list. Heading: "Information required on filing" in 11px uppercase purple.

### 8.7 Country CTA

The CTA bar at the bottom must be **country-specific**: "Request the UAE fee schedule" not generic "Request the MEA fee schedules". This personalises the lead capture and tells the Rouse team which country the agent is interested in.

The CTA link should pass the country to the registration page:
`register.html?country=uae`

### 8.8 Prev/next navigation

Footer links to the alphabetically previous and next countries within the same region. If the user is on Tunisia, the prev link goes to Sudan (or whatever sorts before Tunisia in the Africa list) and next goes to Yemen. Calculate this in JavaScript from the sorted country list.

### 8.9 Reference: full country page HTML

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title id="rs-title">Loading... | Rouse MEA Filing Hub</title>
  <link rel="icon" type="image/svg+xml" href="assets/img/favicon.svg">
  <link href="https://fonts.googleapis.com/css2?family=Carlito:wght@400;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/css/main.css">
</head>
<body>
  <header class="rs-header">
    <a href="index.html" class="rs-logo" aria-label="Rouse — return to hub">
      <img src="assets/img/rouse-logo.svg" alt="Rouse" width="120" height="32">
    </a>
    <nav class="rs-nav">
      <a href="index.html#jurisdictions">Jurisdictions</a>
      <a href="index.html#regional">Regional systems</a>
      <a href="index.html#about">About</a>
      <a href="register.html" class="rs-cta">Request fees</a>
    </nav>
  </header>

  <div class="rs-crumbs">
    <a href="index.html">Hub</a> ›
    <a id="rs-region-link" href="#"></a> ›
    <span id="rs-country-name"></span>
  </div>

  <div class="rs-title-row">
    <h1 class="rs-h1" id="rs-h1"></h1>
    <span class="rs-meta" id="rs-verified"></span>
  </div>

  <p class="rs-sub" id="rs-sub"></p>

  <div class="rs-keyfacts" id="rs-keyfacts"></div>

  <div class="rs-section-head">
    <p class="rs-section-title">Formality documents</p>
    <span class="rs-section-aside" id="rs-aside"></span>
  </div>

  <div class="rs-table-wrap">
    <table class="rs-table">
      <colgroup>
        <col style="width: 22%;">
        <col style="width: 14%;">
        <col style="width: 9%;">
        <col style="width: 17%;">
        <col style="width: 12%;">
        <col style="width: 26%;">
      </colgroup>
      <thead>
        <tr>
          <th>Document</th>
          <th>Required?</th>
          <th>Format</th>
          <th>Authentication</th>
          <th>Translation</th>
          <th>Deadline</th>
        </tr>
      </thead>
      <tbody id="rs-rows"></tbody>
    </table>
  </div>

  <div class="rs-info-block">
    <p class="rs-info-head">Information required on filing</p>
    <ul class="rs-info-list" id="rs-info-list"></ul>
  </div>

  <div class="rs-cta-bar">
    <div class="rs-cta-text">
      <strong id="rs-cta-title">Request the fee schedule</strong>
      <span>Professional, official and translation costs sent on request to verified agents.</span>
    </div>
    <a id="rs-cta-link" href="register.html" class="rs-cta-btn">Request access →</a>
  </div>

  <div class="rs-foot-nav">
    <a id="rs-prev"></a>
    <a id="rs-next"></a>
  </div>

  <script src="assets/js/shared.js"></script>
  <script src="assets/js/country.js"></script>
</body>
</html>
```

### 8.10 `assets/js/country.js` core logic

```javascript
const params = new URLSearchParams(window.location.search);
const countryId = params.get('id');

if (!countryId) {
  window.location.href = 'index.html';
}

fetch('assets/data/requirements.json')
  .then(r => r.json())
  .then(data => {
    const all = [...data.countries, ...data.regional_systems];
    const country = all.find(c => c.id === countryId);
    if (!country) {
      document.body.innerHTML = '<p>Country not found. <a href="index.html">Back to hub.</a></p>';
      return;
    }
    renderCountry(country, all);
  });

function renderCountry(c, all) {
  document.title = `${c.name} | Rouse MEA Filing Hub`;
  document.getElementById('rs-h1').textContent = `${c.name} — patents & designs`;
  document.getElementById('rs-country-name').textContent = c.name;
  document.getElementById('rs-verified').textContent = `Last verified: ${formatDate(c.last_verified)}`;
  document.getElementById('rs-sub').textContent = subFor(c);

  // Region link in breadcrumb
  const regionLink = document.getElementById('rs-region-link');
  regionLink.textContent = c.region === 'mideast' ? 'Middle East' : 'Africa';
  regionLink.href = `index.html#${c.region}`;

  // Key facts
  renderKeyFacts(c);

  // Table rows
  renderRows(c.formality_documents);

  // Information panel
  renderInfo(c.information_required);

  // CTA
  document.getElementById('rs-cta-title').textContent = `Request the ${c.name} fee schedule`;
  document.getElementById('rs-cta-link').href = `register.html?country=${c.id}`;

  // Prev/next
  renderPrevNext(c, all);
}
```

---

## 9. Page 3 — Registration page

### 9.1 Purpose

Lightweight redirect page that hands the user off to the Microsoft Forms registration. Pre-selects the country if the user clicked through from a country-specific CTA.

### 9.2 Implementation

There are two viable approaches. The agent should implement **Option B** by default; switch to Option A if the user later requests an embedded form.

#### Option A: Embed the Microsoft Form in an iframe

```html
<iframe
  src="https://forms.office.com/r/YOUR_FORM_ID?embed=true"
  width="100%"
  height="800"
  frameborder="0"
  marginwidth="0"
  marginheight="0"
  style="border: none; max-width:800px; margin:0 auto; display:block;"
  allowfullscreen
  webkitallowfullscreen
  mozallowfullscreen
  msallowfullscreen>
</iframe>
```

#### Option B: Redirect with country pre-fill (preferred)

Microsoft Forms supports URL parameters to pre-fill answer values. When you've created the form, find each question's "id" via the share-by-URL feature, and construct a redirect URL like:

```
https://forms.office.com/Pages/ResponsePage.aspx?id=YOUR_FORM_ID&r123abc456=United+Arab+Emirates
```

The `register.html` page reads the `?country=` query parameter, looks up the country name in `requirements.json`, and constructs the redirect URL with the pre-filled jurisdiction value. Then it does a `window.location.replace(url)` to send the user straight to MS Forms with their country pre-selected.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Redirecting to registration | Rouse MEA</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Carlito', 'Calibri', 'Tahoma', sans-serif; text-align: center; padding: 80px 20px; color: #232222; }
    .spinner { display: inline-block; width: 32px; height: 32px; border: 3px solid rgba(9,110,74,0.18); border-top-color: #096e4a; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="spinner"></div>
  <p>Taking you to the registration form...</p>
  <p><a id="manual-link" href="#">Click here</a> if you are not redirected automatically.</p>

  <script>
    const FORM_BASE_URL = 'https://forms.office.com/Pages/ResponsePage.aspx?id=YOUR_FORM_ID';
    const COUNTRY_FIELD_ID = 'r123abc456'; // Replace with actual MS Forms question ID

    const params = new URLSearchParams(window.location.search);
    const countryId = params.get('country');

    let url = FORM_BASE_URL;

    if (countryId) {
      fetch('assets/data/requirements.json')
        .then(r => r.json())
        .then(data => {
          const all = [...data.countries, ...data.regional_systems];
          const country = all.find(c => c.id === countryId);
          if (country) {
            url += `&${COUNTRY_FIELD_ID}=${encodeURIComponent(country.name)}`;
          }
          redirect(url);
        });
    } else {
      redirect(url);
    }

    function redirect(url) {
      document.getElementById('manual-link').href = url;
      setTimeout(() => window.location.replace(url), 800);
    }
  </script>
</body>
</html>
```

The constants `FORM_BASE_URL` and `COUNTRY_FIELD_ID` will need to be replaced once the actual Microsoft Form is created — see section 10.

---

## 10. Microsoft Forms integration

### 10.1 Form creation

The Rouse user (Patrick) will create the Microsoft Form manually. The agent does not have access to do this. The form should have these fields:

| Field | Type | Required |
|---|---|---|
| Full name | Short text | Yes |
| Firm name | Short text | Yes |
| Work email | Short text (email validation) | Yes |
| Country of practice | Short text | Yes |
| Role | Single choice (Foreign agent / In-house counsel / Other) | Yes |
| Jurisdictions of interest | Multi-choice (list every country + "All MEA") | Yes |
| IP types | Multi-choice (Patents / Designs / Both) | Yes |
| What are you working on? | Long text | No |
| Privacy consent | Yes/No | Yes |

### 10.2 Power Automate flow (recommended)

When a response is submitted, send three emails in this order:

**Email 1 — Confirmation to the agent (immediate):**
- To: agent's email address (from form response)
- From: mea-patents@rouse.com (or designated team inbox)
- Subject: "Your Rouse MEA registration"
- Body: "Thank you for registering. The Rouse MEA team will review your request and send the relevant fee schedules within one business day."

**Email 2 — Notification to the team (immediate):**
- To: mea-patents@rouse.com
- Subject: "New MEA fee request: [agent name] from [firm name]"
- Body: contains all form responses formatted as a list

**Email 3 — Schedule attachment (manual, by team):**
- After review, a team member replies to the agent with the requested fee schedule(s) attached.

Power Automate setup:
1. Go to make.powerautomate.com
2. Create → Automated cloud flow
3. Trigger: "When a new response is submitted" (Microsoft Forms)
4. Pick the form
5. Add step: "Get response details"
6. Add two "Send an email (V2)" steps as above
7. Save and test

### 10.3 Privacy notice

The form's introduction should include this text:

> Rouse will use the information you provide to send you the fee schedules you've requested and to follow up about Rouse's IP services in the Middle East and Africa. Your information will not be shared with third parties. You can unsubscribe at any time by replying to any email from us.

### 10.4 URL parameters for pre-fill

After creating the form:
1. Click "Collect responses" → "Customise the link"
2. Or copy the URL from "Get a link to fill in"
3. Submit a test response, watch the URL — you'll see parameter names like `r123abc456`
4. Each form question has its own parameter ID. Map "Jurisdictions of interest" to its parameter ID.
5. Update `COUNTRY_FIELD_ID` in `register.html` accordingly.

---

## 11. Map implementation

### 11.1 Library choices

- **D3.js v7** (`https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js`)
- **TopoJSON v3** (`https://cdnjs.cloudflare.com/ajax/libs/topojson/3.0.2/topojson.min.js`)
- **world-atlas v2 110m** (`https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json`) — ~95KB, low-resolution boundaries, good for regional view

### 11.2 Two regions, two bounding boxes

```javascript
const regions = {
  mideast: {
    bbox: { type:"Polygon", coordinates:[[[33,40],[60,40],[60,11],[33,11],[33,40]]] },
    regional: []  // No regional systems in Middle East currently
  },
  africa: {
    bbox: { type:"Polygon", coordinates:[[[-18,38],[52,38],[52,-36],[-18,-36],[-18,38]]] },
    regional: [
      {n:'ARIPO', c:[31.0335,-17.8252]},  // Harare, Zimbabwe
      {n:'OAPI',  c:[11.5021, 3.848]}     // Yaoundé, Cameroon
    ]
  }
};
```

### 11.3 Render function

```javascript
const W = 600, H = 600;
const svg = d3.select('#rs-map').append('svg')
  .attr('viewBox', `0 0 ${W} ${H}`)
  .attr('preserveAspectRatio', 'xMidYMid meet');
const gCountries = svg.append('g');
const gMarkers = svg.append('g');
const tip = document.getElementById('rs-tip');

let features;
let coveredById; // built from requirements.json

function draw(region) {
  if (!features) return;
  const cfg = regions[region];
  const proj = d3.geoMercator().fitExtent([[12, 12], [W-12, H-12]], cfg.bbox);
  const path = d3.geoPath(proj);

  const sel = gCountries.selectAll('path').data(features, d => d.id);
  sel.enter().append('path').merge(sel)
    .attr('d', path)
    .attr('fill', d => coveredById[d.id] ? '#096e4a' : '#E8E3DA')
    .attr('stroke', '#FAFBFC')
    .attr('stroke-width', 0.5)
    .style('cursor', d => coveredById[d.id] ? 'pointer' : 'default')
    .on('mouseover', function(e, d) {
      if (!coveredById[d.id]) return;
      d3.select(this).attr('fill', '#054930'); // 70% darkened green for hover
      tip.textContent = coveredById[d.id].name;
      tip.classList.add('visible');
    })
    .on('mousemove', function(e) {
      const r = document.getElementById('rs-map').getBoundingClientRect();
      tip.style.left = (e.clientX - r.left + 12) + 'px';
      tip.style.top = (e.clientY - r.top - 30) + 'px';
    })
    .on('mouseout', function(e, d) {
      if (!coveredById[d.id]) return;
      d3.select(this).attr('fill', '#096e4a');
      tip.classList.remove('visible');
    })
    .on('click', function(e, d) {
      if (!coveredById[d.id]) return;
      window.location.href = `country.html?id=${coveredById[d.id].id}`;
    });

  // Re-draw regional system markers
  gMarkers.selectAll('*').remove();
  cfg.regional.forEach(r => {
    const p = proj(r.c);
    const grp = gMarkers.append('g')
      .attr('transform', `translate(${p[0]},${p[1]})`)
      .style('cursor', 'pointer')
      .on('click', () => window.location.href = `country.html?id=${r.n.toLowerCase()}`);
    grp.append('circle').attr('r', 7).attr('fill', '#5b2080').attr('stroke', 'white').attr('stroke-width', 2);
    grp.append('circle').attr('r', 11).attr('fill', 'none').attr('stroke', '#5b2080').attr('stroke-width', 1.5).attr('opacity', 0.5);
    grp.append('text').attr('y', -15).attr('text-anchor', 'middle').attr('font-size', 12).attr('font-weight', 700).attr('fill', '#5b2080').text(r.n);
  });
}

// Build coveredById from requirements.json
function initMap(data) {
  coveredById = {};
  data.countries.forEach(c => {
    coveredById[c.iso_numeric] = c;
  });

  fetch('https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json')
    .then(r => r.json())
    .then(world => {
      features = topojson.feature(world, world.objects.countries).features;
      draw('mideast');
    });

  document.getElementById('rs-tabs').addEventListener('click', e => {
    const b = e.target.closest('.rs-tab');
    if (!b) return;
    document.querySelectorAll('.rs-tab').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    draw(b.dataset.region);
  });
}
```

### 11.4 Map container CSS

```css
.rs-mapwrap {
  margin: 0 auto 16px;
  max-width: 600px;
  aspect-ratio: 1 / 1;
  max-height: 540px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--neutral-border);
  position: relative;
  background: var(--neutral-bg);
}

#rs-map { width: 100%; height: 100%; }
#rs-map svg { display: block; width: 100%; height: 100%; }

.rs-mlegend {
  position: absolute;
  bottom: 12px;
  left: 12px;
  background: white;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 11px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  gap: 5px;
  z-index: 10;
}

.rs-tip {
  position: absolute;
  pointer-events: none;
  background: var(--rouse-purple);
  color: white;
  font-size: 11px;
  padding: 5px 9px;
  border-radius: 4px;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.1s;
  z-index: 20;
  font-weight: 500;
}

.rs-tip.visible { opacity: 1; }
```

### 11.5 ISO numeric codes for MEA countries

Reference list to verify against `requirements.json`. Use these exact strings (with leading zeros) as `iso_numeric` values.

**Middle East:**
- 048 = Bahrain
- 376 = Israel
- 400 = Jordan
- 414 = Kuwait
- 422 = Lebanon
- 512 = Oman
- 634 = Qatar
- 682 = Saudi Arabia
- 760 = Syria
- 784 = United Arab Emirates
- 887 = Yemen

**Africa:**
- 012 = Algeria
- 024 = Angola
- 072 = Botswana
- 818 = Egypt
- 231 = Ethiopia
- 270 = Gambia
- 288 = Ghana
- 384 = Côte d'Ivoire
- 404 = Kenya
- 426 = Lesotho
- 434 = Libya
- 450 = Madagascar
- 504 = Morocco
- 508 = Mozambique
- 516 = Namibia
- 562 = Niger
- 566 = Nigeria
- 646 = Rwanda
- 686 = Senegal
- 710 = South Africa
- 728 = South Sudan
- 729 = Sudan
- 834 = Tanzania
- 768 = Togo
- 788 = Tunisia
- 800 = Uganda
- 894 = Zambia
- 716 = Zimbabwe

---

## 12. Build sequence (instructions for AI agent)

Execute these steps in order. Don't skip ahead.

### Step 1: Archive previous attempts

Move all old files into `archive/` per section 3.1. Don't delete — preserve in case the user wants to reference them later.

### Step 2: Set up directory structure

Create the empty folder structure from section 3, including empty `assets/css/`, `assets/js/`, `assets/img/`, `assets/data/`, and `data-pipeline/`.

### Step 3: Build the data pipeline

Create `data-pipeline/extract.py`. The script should:

1. Read every `.xlsx` in `INTA/Price_Lists/`
2. For each, identify the country and locate the formality table
3. Extract the six columns into structured rows
4. Skip any fee/price columns (column headers containing "fee", "cost", "$", "£", "€", "USD", "AED", "SAR", etc.)
5. Locate the "Information required on filing" panel
6. Build the JSON per the schema in section 5
7. Validate per section 4.6
8. Write `assets/data/requirements.json`
9. Print a summary: countries extracted, rows extracted, warnings

If the Excel structure is unclear or rows fail to parse, the script should log warnings to `data-pipeline/extract.log` and continue, not crash.

### Step 4: Run the extraction

```bash
cd data-pipeline
python extract.py
```

Verify `assets/data/requirements.json` exists and contains valid data. Open it, spot-check a few countries.

### Step 5: Build `assets/css/main.css`

Single stylesheet containing:
- CSS variables for the colour palette (section 6.1)
- Carlito font import (with Calibri / Aptos / Tahoma fallback chain per §6.3)
- Base styles (body, h1-h3, p, a)
- Header / nav styles
- Hero section
- Tabs
- Map wrapper, legend, tooltip
- Country grid and cards
- Country detail page key facts
- Six-column table including pills
- Information panel
- CTA bar
- Footer
- Mobile breakpoints (collapse nav at 700px, single-column grid at 600px, etc.)

### Step 6: Build `index.html` (landing page)

Per the reference HTML in section 7.7. The header, footer, and CTA are static; the country grid is rendered dynamically by `landing.js` from `requirements.json`.

### Step 7: Build `country.html`

Per the reference HTML in section 8.9. All content is dynamically rendered from `requirements.json` based on the `?id=` query parameter.

### Step 8: Build `register.html`

Per section 9.2 Option B. Use placeholder constants for `FORM_BASE_URL` and `COUNTRY_FIELD_ID` with a clear comment that these need replacing once the Microsoft Form is created.

### Step 9: Build the JavaScript files

- `assets/js/shared.js` — header, footer, common helpers (formatDate, etc.)
- `assets/js/landing.js` — landing page logic (sections 7.8 and 11.3)
- `assets/js/country.js` — country page logic (section 8.10)

### Step 10: Build a 404 page

`404.html` — simple "Page not found" with a link back to the hub. GitHub Pages serves this automatically for unmatched URLs.

### Step 11: Local testing

Open `index.html` directly in a browser. Test:

1. Map renders, both tabs work, hover tooltips appear
2. Click a covered country — navigates to `country.html?id=xxx`
3. Country page renders the right country's data
4. All six table columns populated for every country
5. Required pills colour correctly (green / red / grey)
6. Information panel renders
7. Country-specific CTA reads "Request the [Country] fee schedule"
8. Prev/next navigation works
9. Click "Request fees" or any CTA — goes to `register.html`
10. `register.html` redirects (will fail on placeholder URL, but the redirect should fire)
11. Resize the browser to 400px wide — site remains usable on mobile

### Step 12: Update README.md

Replace the current readme with a public-facing one explaining what the site is, how to view it, and how to update the data.

### Step 13: Commit and push

Single commit, message: "Initial build of MEA filing hub per BUILD_SPEC.md"

GitHub Pages will serve the new site at `https://pmuscat41.github.io/Rouse-MENA_INFO/` (or the configured custom domain).

---

## 13. Acceptance criteria

The build is complete when:

- [ ] `index.html` renders with the Rouse multi-colour wordmark, Middle East & Africa hero copy, two map tabs, an interactive D3 map, a country grid, and a registration CTA bar
- [ ] The Middle East tab shows a tight zoom on the Gulf region with all GCC states clearly visible and clickable
- [ ] The Africa tab shows the full continent with South Africa visible at the bottom and ARIPO + OAPI markers shown
- [ ] Hovering a covered country shows a tooltip with the country name and darkens the country to deep teal
- [ ] Clicking a covered country navigates to its `country.html?id=xxx` page
- [ ] `country.html` renders correctly for every country in `requirements.json`
- [ ] The six-column documentary table is correctly populated with no broken cells
- [ ] Required pills colour appropriately (yes / conditional / no)
- [ ] Information required panel renders below the table
- [ ] Country CTA reads with the country name interpolated
- [ ] Prev/next links work in both directions
- [ ] `register.html` redirects to the Microsoft Forms URL (placeholder OK until form is built)
- [ ] All previous attempt files moved to `archive/` (not deleted)
- [ ] No console errors in the browser developer tools on any page
- [ ] Site is responsive: usable at 400px width
- [ ] Run `data-pipeline/extract.py` and confirm `requirements.json` regenerates without errors

---

## 14. Maintenance & future work

### 14.1 Adding a new country

1. Add the country's Excel file to `INTA/Price_Lists/`
2. Run `python data-pipeline/extract.py`
3. Verify `requirements.json` includes the new country
4. Commit and push — site updates automatically via GitHub Pages

### 14.2 Updating an existing country

1. Update the Excel file in `INTA/Price_Lists/`
2. Re-run extraction
3. Commit and push

### 14.3 Updating fees

Fees never appear on the public site. Update them in the Excel files and SharePoint pricelist PDF, but no website changes are needed.

### 14.4 Future enhancements (not in scope for v1)

- Switch from Microsoft Forms to HubSpot if marketing wants the leads in the CRM
- Add language switching (Arabic / French) for users in MEA
- Add a "compare countries" feature side-by-side
- Add an analytics tag (Plausible or Google Analytics) — will require updating the privacy notice
- Add a search box for fast country lookup
- Replace world-atlas 110m with 50m boundaries for higher map resolution
- Add Egypt to the Middle East tab as well as Africa, since MENA practitioners often think of it that way

---

*End of build specification.*
