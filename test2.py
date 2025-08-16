# Create a VERBATIM .docx that contains exactly the Markdown previously provided (no structural or wording changes)
from docx import Document
from docx.shared import Cm, Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH

md_text = """# Rouse MEA – Patents & Designs: Country One‑Pagers (v1.0)

_Last updated: 9 Aug 2025_

## What competitors typically publish (quick scan)

- **RWS Agent Network / Sun IP / AGIP / SABA IP / NJQ & Associates**: most provide PCT/Paris **deadlines**, **PoA/Assignment** requirements with **legalization level**, **commercial register**/certificate needs, **priority doc** timing, and **translation windows**; some include **design quirks** (e.g., multiple designs, views) and **exam timings**. Useful examples: UAE/KSA/Qatar/Oman/Kuwait/Bahrain pages on RWS & Sun IP; AGIP “Summary of Prosecution” PDFs; SABA updates. citeturn12search1turn23view0turn16search6turn12search2turn13search17

> Below are compact one‑pagers you can paste into a doc/PDF. Replace the `maps/*.png` paths once your Python map renders are ready.

---

## UNITED ARAB EMIRATES (UAE) — Patents & Designs

![UAE map](maps/uae.png)

**Population (2024):** 10,876,981. citeturn10search4

### Documentary Requirements
| Item | Required? | Deadline (from filing) | Execution / Form |
|---|---|---:|---|
| Power of Attorney | **Yes** | **90 days** (non‑extendable per practice) | **Notarized original** (legalization generally **not** required for PoA) |
| Assignment (if applicant ≠ inventor) | **Yes** | **90 days** | **Notarized** original (UAE public-entity stamp may suffice as notarization) |
| Commercial/Trade Licence or Commercial Register Extract (corporate applicants) | **Yes** | **90 days** | **Notarized + Legalized up to UAE Consulate** (per some practice) |
| Priority Document (if Paris; PCT usually via IB) | **If claimed** | **Typically by office invitation** (often 2–3 months) | Certified copy; translation only if requested |

**Notes:** UAE MoE states missing mandatory docs can be completed **within 90 days**; market guides differ on legalization for corporate papers vs PoA. **Confidence**: PoA notarization only (≈70%); corporate extract legalization (≈60%). citeturn12search17turn12search1turn12search3

---

## SAUDI ARABIA — Patents & Designs

![Saudi map](maps/saudi.png)

**Population (2024 est.):** ~33.9 million. citeturn10search21

### Documentary Requirements
| Item | Required? | Deadline (from filing) | Execution / Form |
|---|---|---:|---|
| Power of Attorney | **Yes** | Commonly **up to 3 months** (per invitation/practice) | **Legalized or Apostilled** |
| Assignment (if applicant ≠ inventor) | **Yes** | **Up to 3 months** (practice) | **Legalized or Apostilled** |
| Commercial/Certificate of Incorporation (corporate) | **Often required** | With formalities | **Certified/Legalized** (practice varies) |
| Priority Document (if Paris) | **If claimed** | **60–90 days** from filing (practice; some say 60) | Certified copy; translation generally **not** required unless asked |

**Notes:** SAIP PCT chapter lists **PoA appointment** as a special requirement (invitation gives **3 months**). Multiple firms confirm **apostille accepted**. **Confidence**: Apostille accepted (≈90%); 60–90‑day practice for priority doc (≈70%). citeturn13search1turn13search9turn13search18turn13search5

---

## OMAN — Patents & Designs

![Oman map](maps/oman.png)

**Population (2023):** 5,049,269. citeturn10search22

### Documentary Requirements
| Item | Required? | Deadline (from filing) | Execution / Form |
|---|---|---:|---|
| Power of Attorney | **Yes** | **60 days** | **Legalized to Omani Consulate** **or Apostille** |
| Assignment (if applicant ≠ inventor) | **Yes** | **≤90 days** (practice) | **Legalized** (Consulate or Apostille) |
| Commercial/Certificate of Incorporation (corporate) | **Yes** | **≤90 days** | **Legalized** (Consulate or Apostille) |
| Priority Document (if Paris) | **If claimed** | **3 months** | Certified copy (Arabic translation per practice) |

**Notes:** WIPO (OM.05) states **PoA within 60 days** or app is void. Several firms confirm **legalization/Apostille** practice. **Confidence**: timelines (≥90%). citeturn16search0turn16search6turn16search3

---

## QATAR — Patents & Designs

![Qatar map](maps/qatar.png)

**Population (2023):** 2,979,082. citeturn10search19

### Documentary Requirements
| Item | Required? | Deadline (from filing) | Execution / Form |
|---|---|---:|---|
| Power of Attorney | **Yes** | **Within 3–6 months** (varies by route) | **Legalized to Qatari Consulate** (Qatar is **not** Apostille) |
| Assignment (if applicant changes post‑PCT) | **If applicable** | By invitation | Legalized |
| Commercial/Certificate of Incorporation | **Sometimes** | With formalities | Legalized |
| Priority Document (if Paris) | **If claimed** | **Up to 6 months** (per practice) | Certified copy; no translation typically required |

**Notes:** WIPO EQE shows **translation can be furnished within 6 months** after the standard limit; RWS confirms **PoA consular legalization** and timing windows. **Confidence**: legalization (≥90%). citeturn19search5turn19search1turn19search0

---

## BAHRAIN — Patents & Designs

![Bahrain map](maps/bahrain.png)

**Population (2024):** 1,588,670. citeturn11search6

### Documentary Requirements
| Item | Required? | Deadline (from filing) | Execution / Form |
|---|---|---:|---|
| Power of Attorney | **Yes** | **3 months** | **Apostille _or_ Consular Legalization** |
| Assignment (if applicant ≠ inventor) | **Yes** | **3 months** | **Apostille _or_ Consular Legalization** |
| Commercial/Corporate proof | **If corporate** | With formalities | Certified/Legalized (practice) |
| Priority Document (if Paris) | **If claimed** | **3 months** | Certified copy (+ translation if required) |

**Notes:** Sun IP shows apostille/consular options with **3‑month** window. **Confidence**: ≥85%. citeturn23view0

---

## KUWAIT — Patents & Designs

![Kuwait map](maps/kuwait.png)

**Population (2024):** 4,973,861. citeturn11search13

### Documentary Requirements
| Item | Required? | Deadline (from filing) | Execution / Form |
|---|---|---:|---|
| Power of Attorney | **Yes** | **90 days** | **Legalized via Kuwaiti Consulate** (copy at filing; original later) |
| Assignment (if applicant ≠ inventor) | **Yes** | **90 days** | **Legalized** (Kuwaiti Consulate) |
| Commercial/Commercial Register Extract | **Yes (corporate)** | **90 days** | **Legalized** |
| Priority Document (if Paris) | **If claimed** | By invitation (**90 days**) | Certified; Arabic translation if requested |

**Notes:** WIPO shows 90‑day invitation window under Rule 51bis; RWS/AGIP align on **consular legalization**. **Confidence**: ≥85%. citeturn22search0turn22search3turn22search5

---

## EGYPT — Patents & Designs

![Egypt map](maps/egypt.png)

**Population (2024):** 116,538,258. citeturn11search14

### Documentary Requirements
| Item | Required? | Deadline (from filing) | Execution / Form |
|---|---|---:|---|
| Power of Attorney | **Yes** | **Commonly within 4 months** (practice) | **Consular Legalization** (Egyptian Consulate) |
| Assignment (if applicant ≠ inventor) | **Yes** | **≈4 months** | **Consular Legalization** |
| Commercial/Certificate of Incorporation (corporate) | **Yes** | With formalities | **Consular Legalization** (+ Arabic translation) |
| Priority Document (if Paris) | **If claimed** | By invitation (typ. 2–3 months) | Certified; Arabic translation if required |

**Notes:** WIPO PCT chapter confirms general requirements; most local practitioners require **consular legalization**. **Confidence**: ≥85%. citeturn25search0

---

## SOUTH AFRICA — Patents & Designs

![South Africa map](maps/south_africa.png)

**Population (2024 mid‑year est.):** ~63.1 million. citeturn11search15

### Documentary Requirements
| Item | Required? | Deadline (from filing) | Execution / Form |
|---|---|---:|---|
| Power of Attorney | **Yes** | **By request / within office‑set period** (often filed promptly) | **Simply signed** (no notarization/legalization) |
| Assignment (if applicant ≠ inventor/assignee) | **Yes** | Pre‑acceptance | **Simple** (not typically legalized) |
| Commercial/Corporate docs | **No** (routine) | — | — |
| Priority Document (if Paris) | **If claimed** | **Within 6 months of SA filing** (extendable) | Certified copy; translation if not in an official language |

**Notes:** South Africa is formalities‑light: **simple PoA & assignment** generally accepted; priority doc timing per regulations. **Confidence**: ≥85%. citeturn7search12turn24search14

---

## NIGERIA — Patents & Designs

![Nigeria map](maps/nigeria.png)

**Population (2024):** 232,679,478. citeturn11search10

### Documentary Requirements
| Item | Required? | Deadline (from filing) | Execution / Form |
|---|---|---:|---|
| Power of Attorney | **Yes** | At/soon after filing | **Simply signed** (no notarization) |
| Assignment (if applicant ≠ inventor) | **Yes** | Prompt (office practice) | **Simple** (no legalization) |
| Commercial/Corporate docs | **Sometimes** | If requested | Simple copy |
| Priority Document (if Paris) | **If claimed** | With/shortly after filing | Certified copy |

**Notes:** Multiple practitioner guides indicate **no notarization** for PoA; local practice can invite originals later. **Confidence**: ≈75% (official guidance is sparse online; cross‑check with local agent). citeturn9search16turn9search17

---

## KENYA — Patents & Designs

![Kenya map](maps/kenya.png)

**Population (2024):** 56,432,944. citeturn11search11

### Documentary Requirements
| Item | Required? | Deadline (from filing) | Execution / Form |
|---|---|---:|---|
| Power of Attorney | **Yes** (if foreign applicant uses an agent) | At/after filing (office may invite) | **Simply signed** |
| Assignment (if applicant ≠ inventor) | **Yes** | Before grant/recordal | **Simple** (not typically legalized) |
| Commercial/Corporate docs | **No** (routine) | — | — |
| Priority Document (if Paris) | **If claimed** | Upon request | Certified copy |

**Notes:** KIPI/WIPO confirm agent appointment; practitioner notes: **PoA simply signed**. **Confidence**: ≥80%. citeturn21search0turn1open0

---

## ARIPO (AP) — Regional (Patents & Designs)

![ARIPO map](maps/aripo.png)

**Population:** _Regional system (21 member states); use member‑state stats as needed._

### Documentary Requirements (regional application or PCT regional phase)
| Item | Required? | Deadline (from filing) | Execution / Form |
|---|---|---:|---|
| Power of Attorney (Form 4) | **Yes** (if applicant not resident in AP state) | If not at entry, **within 2 months after** national/regional‑phase time limit | **Simply signed** (no legalization) |
| Assignment (if applicant ≠ inventor) | **Sometimes** | By invitation | Simple |
| Commercial/Corporate docs | **No** (routine) | — | — |
| Priority Document (if Paris) | **If claimed** | **3 months** | Certified copy (+ English translation if non‑English) |

**Notes:** WIPO AP chapter and firm references confirm **2‑month window for PoA** and **3‑month** for priority docs. **Confidence**: ≥85%. citeturn24search7turn24search1

---

## OAPI (OA) — Regional (Patents & Designs)

![OAPI map](maps/oapi.png)

**Population:** _Regional system (17 member states); use member‑state stats as needed._

### Documentary Requirements
| Item | Required? | Deadline (from filing) | Execution / Form |
|---|---|---:|---|
| Power of Attorney | **Yes** | **At filing** (original may follow in short window) | **Simple** (no authentication per some practice) |
| Assignment (if applicant ≠ inventor) | **Yes** | At/soon after filing | Original or certified copy |
| Commercial/Corporate docs | **No** (routine) | — | — |
| Priority Document (if Paris) | **If claimed** | **3–6 months** (practice varies) | Certified copy (+ FR/EN translation if required) |

**Notes:** RWS/SABA indicate **PoA at filing** and **priority doc within 3 months**; check current office practice for translation nuances. **Confidence**: ≈75%. citeturn24search0turn24search4

---

### Sources (selection per section)
- **Population**: World Bank/WHO/Stats SA country pages. citeturn10search4turn10search22turn10search19turn11search6turn11search13turn11search14turn11search15turn11search10turn11search11  
- **Official/PCT**: WIPO PCT eGuide national chapters for **KSA, OM, QA, KW, EG, KE, AP/OA**, and WIPO guidance. citeturn13search1turn16search0turn19search1turn22search0turn25search0turn21search0turn20search0turn20search1turn25search2  
- **Competitor/practitioner references** (to cross‑check formalities & legalization practice): **RWS Agent Network**, **Sun IP**, **AGIP**, **SABA IP**, **NJQ & Associates**, **STA Law Firm**, etc. citeturn12search1turn23view0turn16search6turn12search2turn13search17turn16search3

---

## A couple of important caveats (kept brief)
- Formalities **do change** (e.g., apostille adoption, new PoA validation rules). When in doubt, **re‑confirm with the local agent or most recent WIPO PCT eGuide entry** for that office. (Confidence that the above is current **today**: ~80–90%, depending on jurisdiction and item.)  
- **Design‑specific extras** (number of views, sets, locarno class quirks) are intentionally omitted here for minimalism; shout if you want a one‑line “Designs quirks” row added.

---

### Want this as individual files?
Say the word and I’ll split the one‑pagers into separate **.md** files (one per jurisdiction) or a single **.docx**/**.pdf**. If you want me to output the files now, I’ll generate them directly and give you download links.
"""

# Build document with NO content changes
doc = Document()

# Margins modest, but content purely text
for section in doc.sections:
    section.top_margin = Cm(2.0)
    section.bottom_margin = Cm(2.0)
    section.left_margin = Cm(2.2)
    section.right_margin = Cm(2.2)

# Use a readable font
style = doc.styles['Normal']
style.font.name = 'Calibri'
style.font.size = Pt(11)

# Insert the Markdown text line-for-line verbatim
for line in md_text.split("\n"):
    p = doc.add_paragraph(line)

# Save file
out_path = "/mnt/data/Rouse_MEA_Patents_Designs_OnePagers_VERBATIM.docx"
doc.save(out_path)
out_path
