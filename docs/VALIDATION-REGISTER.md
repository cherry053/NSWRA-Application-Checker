# Validation Register — NSWRA Grant Application Quality Checker

**Status:** Current as at handover
**Applies to:** Essential Public Asset Restoration (EPAR) applications exported from SmartyGrants
**Authoritative source:** the code itself. Every entry below cites the file and function that implements it, so this register can always be re-verified against the running system.

This is the complete record of every validation the system applies. Nothing is
checked that is not listed here, and everything listed here is implemented in
code today.

---

## 1. How to read this register

The checker applies validations at three distinct points, and they behave
differently. Confusing the three is the most common source of misunderstanding,
so they are registered separately.

| Stage | When it runs | Where it appears to the user | Can it block a submission? |
| --- | --- | --- | --- |
| **Stage 1 — Paste pre-check** | On the upload page, immediately after "Check application" is pressed | Amber warning banners above the form | No. The user can always press "Run the full analysis anyway" |
| **Stage 2 — Parse observations** | While the pasted damage table is being read | Feeds the *Damage Table Parsed Cleanly* criterion (warnings) and the INFO cards (notes) | Warnings affect one criterion; notes affect nothing |
| **Stage 3 — Validation criteria** | After both sources are parsed and merged | The Criteria Summary and Active Flags panels on the results page, and the downloadable PDF report | No — the checker advises, it does not gate. It never submits or rejects anything in SmartyGrants |

A point worth stating plainly to every stakeholder: **this system is advisory.**
It reads an export of an application and reports on quality. It has no
connection to SmartyGrants, cannot change an application, and cannot approve or
reject one.

---

## 2. Severity model and status mapping

Every Stage 3 criterion carries a severity assigned in code. The user-facing
status is derived from severity plus outcome:

| Criterion outcome | Severity | User-facing status | Colour | Meaning |
| --- | --- | --- | --- | --- |
| Passed | any | **Pass** | Green | Nothing to do |
| Failed | `critical` | **Fail** | Red | An assessor-visible defect; fix before submitting |
| Failed | `warning` | **Review** | Amber | Needs a human decision; may legitimately be acceptable |

Implemented in `core/filters.py` → `criterion_status()`.

A form section's header icon shows the **worst** status among its criteria
(`core/filters.py` → `section_status()`), so a section reads red if any single
criterion inside it failed critically.

### Scoring and overall status

Implemented in `core/validators.py` → `run_checks()`:

- **Confidence score** = `round(100 × criteria_passed ÷ criteria_total)`. Every
  criterion carries equal weight regardless of severity.
- **Overall status:**
  - `PASS` — every criterion passed.
  - `FAIL` — at least one *critical* criterion failed **and** no more than half
    of all criteria passed.
  - `PARTIAL` — anything else (this is the normal outcome for a real
    application with a handful of defects).

The badge on the results page renders `PASS` as "Ready", `PARTIAL` as "Partial",
and `FAIL` as "Needs review" (`utils/ui.py` → `_READINESS_STYLES`).

**Informational notices never affect either number.** They are not criteria;
they are disclaimers, described in section 5.

---

## 3. Stage 1 — Upload pre-check screening

**Implemented in:** `core/paste_precheck.py` → `precheck_paste()`, `_build_warnings()`, `_build_notes()`
**Purpose:** catch a bad copy-and-paste in about a second, rather than after a
full analysis has run against half a table.

These rules screen the *paste* against the *PDF*. They deliberately do not judge
field-level quality — that is Stage 3's job.

| ID | Rule | Trigger condition | Type |
| --- | --- | --- | --- |
| PC-01 | **Empty paste** | Zero damage item records found in the pasted text | Warning |
| PC-02 | **More than one table pasted** | More than one line in the paste contains both `Asset Category` and `Damage Item ID` (i.e. two header rows) | Warning |
| PC-03 | **Duplicated damage items** | The same Damage Item ID appears on more than one record | Warning |
| PC-04 | **Truncated record** | One or more records lack their trailing cost amounts, meaning the copy stopped part-way through a record | Warning |
| PC-05 | **Paste shorter than the PDF declares** | Complete pasted records < the item count declared in the PDF | Warning |
| PC-06 | **Paste longer than the PDF declares** | Complete pasted records > the item count declared in the PDF | Warning |
| PC-07 | **PDF unreadable for pre-scan** | Any exception while scanning the PDF for its declared item count; the comparison is skipped rather than failing the upload | Warning |
| PC-08 | **PDF does not declare a count** | The `Number of damaged items being restored` field is absent, so PC-05/PC-06 cannot be evaluated | Warning |
| PC-09 | **Column labels absent from the paste** | Any of the eight expected column labels is not found anywhere in the pasted text | **Note only** — never a warning |

PC-09 is deliberately informational: copying the filled-in table body without
its header row is routine and harmless, so it must never hold a submission back.
The eight labels checked are `Asset Category`, `Damage Item ID`, `Asset ID`,
`Asset Name`, `Date Asset Accessible`, `Asset Sub-Category`, `Asset Material`,
`Damage Description` (`EXPECTED_COLUMN_LABELS`).

A record counts as **complete** for PC-04/05/06 when it has a Damage Item ID
*and* reached its total cost (`_is_complete_record()`). The cost block sits at
the tail of every record, so a missing total is a reliable truncation signal.

---

## 4. Stage 2 — Parse observations from the damage table

**Implemented in:** `core/damage_table_parser.py`
**Purpose:** record what could not be read out of the pasted text.

The parser distinguishes **warnings** (a genuine problem with the paste) from
**notes** (a known limitation of the plain-text export, which is nobody's
fault). This distinction is the reason a clean application can still show INFO
cards without losing points.

### 4.1 Parse warnings — these fail criterion `DI-X-03`

| ID | Raised when | Message |
| --- | --- | --- |
| PW-01 | No `Asset Category` anchor found anywhere | "No damage item records found in the pasted table text." |
| PW-02 | A record has no date in `dd/mm/yyyy` shape in its identity block | "No 'Date Asset Accessible' value found." |
| PW-03 | Fewer than four numeric coordinate values in the location block | "Expected 4 coordinate values, found N." |
| PW-04 | Fewer than four asset attribute values (classification, capacity, layout, dimensions) | "Expected 4 asset attribute values …, found N." |
| PW-05 | The cost block does not contain exactly five `$` amounts | "Expected 5 cost amounts, found N." |

Each warning is prefixed with the Damage Item ID (or `Item N`) before it reaches
the criterion.

### 4.2 Parse notes — informational only, never scored

| ID | Raised when | Effect |
| --- | --- | --- |
| PN-01 | The Asset Sub-Category selection could not be located | Recorded on the item; currently not surfaced as a user-facing notice |
| PN-02 | The Asset Material checkbox group was found | INFO card: the export lists every option without marking the chosen one, so the user must double-check it manually |
| PN-03 | The pre-disaster function question was found | INFO card: same limitation as PN-02 |

PN-02 and PN-03 are the two disclaimers users see on nearly every check. They
are grouped so that one card lists every affected item, rather than one card per
item (`core/validators.py` → `selection_notices()`).

---

## 5. Stage 3 — The validation criteria (main register)

**Implemented in:** `core/validators.py`
**Grouped by:** the six EPAR form-navigation sections (`core/sections.py`)

Criterion count for any application:

```
Total criteria = 34 + (7 × number of damage items)
```

That is 29 application-level criteria + 5 cross-document criteria + 7 per damage
item. A 10-item application therefore produces 104 criteria.

### 5.1 Section 1 — Grant Program Information (EPAR)

| ID | Criterion | Rule applied | Severity |
| --- | --- | --- | --- |
| GP-01 | Eligibility Confirmation Ticked | The eligibility declaration checkbox must be ticked (`☑`) | Critical |

### 5.2 Section 2 — Eligible Delivery Agency Details

| ID | Criterion | Rule applied | Severity |
| --- | --- | --- | --- |
| AG-01 | Organisation Name Provided | Non-empty value | Critical |
| AG-02 | Primary Address Within NSW | Address text must contain `NSW` | Critical |
| AG-03 | Postal Address Within NSW | Address text must contain `NSW` | Critical |
| AG-04 | Primary Phone Valid | Australian format: 10 digits starting `0` after stripping spaces, brackets and hyphens; `+61` is normalised to `0` | Critical |
| AG-05 | Email Address Valid | Exactly one `@`, no spaces, non-empty local part, domain contains a dot and does not start or end with one | Critical |
| AG-06 | Primary Contact Provided | Non-empty value | Critical |
| AG-07 | Primary Contact Position Provided | Non-empty value | Critical |
| AG-08 | Primary Contact Phone Valid | As AG-04 | Critical |
| AG-09 | Primary Contact Email Valid | As AG-05 | Critical |
| AG-10 | ABN Provided **or** ABN Question Answered | Conditional: if the ABN question was answered `Yes`, an ABN value must be present (*ABN Provided*); otherwise the question must simply have been answered (*ABN Question Answered*) | Critical |
| AG-11 | Public Liability Insurance Answered | The $20m public liability insurance question must have a selected option | Critical |
| AG-12 | Insurance Evidence Attached | A filename must be present against the insurance evidence upload | Critical |

AG-10 is the only criterion whose **name** changes with the data. The count does
not change — exactly one of the two variants is always produced.

### 5.3 Section 3 — EPAR Project Details

| ID | Criterion | Rule applied | Severity |
| --- | --- | --- | --- |
| PR-01 | Project Title Within Word Limit | Present and ≤ **25 words** | Critical |
| PR-02 | Brief Description Within Word Limit | Present and ≤ **50 words** | Critical |
| PR-03 | Start Date Before End Date | Both dates parse as `dd/mm/yyyy` and start ≤ end | Critical |
| PR-04 | Primary Initiative Location Within NSW | Location text must contain `NSW` | Critical |
| PR-05 | Predominant NSW LGA Provided | Non-empty value | Critical |
| PR-06 | State Electorate Provided | Non-empty value | Critical |
| PR-07 | Federal Electorate Provided | Non-empty value | Critical |
| PR-08 | Predominant Asset Type Selected | A radio option must be marked selected | Critical |
| PR-09 | Re-damaged Asset Question Answered | A radio option must be marked selected | Critical |

### 5.4 Section 4 — Damage Information (per damage item)

These seven criteria are generated **once for every damage item** parsed from
the pasted table. `X` below is the Damage Item ID, or `Item N` when the ID could
not be read.

| ID | Criterion | Rule applied | Severity |
| --- | --- | --- | --- |
| DI-X-01 | *X* — Required Fields Present | All 14 required fields present and non-empty (list below) | Critical |
| DI-X-02 | *X* — Accessible Date Valid | `Date Asset Accessible` parses as `dd/mm/yyyy` | Critical |
| DI-X-03 | *X* — Damage Locations Within NSW | Both the start and the end damage location are present and contain `NSW` | Critical |
| DI-X-04 | *X* — Coordinates Within NSW Bounds | All four coordinates present and inside the NSW bounding box (see §6) | Critical |
| DI-X-05 | *X* — Cost Components Sum To Total | Construction + PM/design + contingency + escalation **exactly equals** the stated total; any missing amount fails | Critical |
| DI-X-06 | *X* — Evidence File Naming Convention | Pre-disaster and damage evidence filenames must follow `<DamageID>_PredisasterEvidence.<ext>` and `<DamageID>_DamageEvidence.<ext>` | **Warning** |
| DI-X-07 | *X* — Upload Sizes Within 100MB | No evidence upload (pre-disaster, damage, or cost) may exceed 100 MB | **Warning** |

**The 14 fields checked by DI-X-01:** Damage Item ID, Asset ID, Asset Name,
Date Asset Accessible, Asset Capacity, Asset Layout, Asset Dimensions, Damage
Description, Estimation Method, Pre-Disaster Evidence, Damage Evidence, Cost
Estimation Evidence, Cost Estimation Methodology, Total Damage Estimate.

> **Known deviation:** *Asset Sub-Category* is present in the required-fields
> list but **commented out** (`core/validators.py`, in `_item_required_fields`).
> It is therefore not enforced today. See §7.

**Naming convention detail (DI-X-06):** the filename stem is split at the first
underscore. The prefix must match the Damage Item ID **case-sensitively**; the
suffix is compared **case-insensitively** against `predisasterevidence` /
`damageevidence`. A filename with no underscore fails. Cost evidence has **no**
naming rule — only presence (DI-X-01) and size (DI-X-07).

**Cost sum detail (DI-X-05):** comparison is exact `Decimal` equality. There is
no rounding tolerance, so a one-cent discrepancy fails. This is intentional but
worth knowing when triaging user complaints.

### 5.5 Section 4 — Damage Information (cross-document)

Produced once per application regardless of item count.

| ID | Criterion | Rule applied | Severity |
| --- | --- | --- | --- |
| DX-01 | Damage Item Count Reconciles | The count declared in the PDF must equal the number of records parsed from the paste; a PDF with no declared count fails | Critical |
| DX-02 | Damage Item Limit | No more than **50** damage items | Critical |
| DX-03 | Damage Table Parsed Cleanly | Zero Stage 2 parse warnings (PW-01 … PW-05). The first six warnings are listed in the detail text | **Warning** |

### 5.6 Section 5 — EPAR Funding Request

| ID | Criterion | Rule applied | Severity |
| --- | --- | --- | --- |
| FR-01 | Total Amount Requested Provided | A total amount was found in the PDF | Critical |
| FR-02 | Insurance Compensation Question Answered | The insurance compensation question has a selected option | Critical |
| FR-03 | Total Amount Requested Reconciles | The PDF's total must **exactly equal** the sum of the pasted items' totals. A missing PDF total fails | Critical |
| FR-04 | Independent Technical Review Threshold | Package total ≤ **$25,000,000**. Above that, an Independent Technical Review is triggered | **Warning** |

FR-04 uses the PDF's declared total when available, otherwise the sum of parsed
item totals.

### 5.7 Section 6 — Declaration and Authorisation

| ID | Criterion | Rule applied | Severity |
| --- | --- | --- | --- |
| DC-01 | Declaration Agreed | The "I agree" checkbox must be ticked | Critical |
| DC-02 | Authoriser Name Provided | Non-empty value | Critical |
| DC-03 | Authoriser Position Provided | Non-empty value | Critical |
| DC-04 | Authoriser Phone Valid | As AG-04 | Critical |
| DC-05 | Authoriser Email Valid | As AG-05 | Critical |

---

## 6. Thresholds and constants

Every tunable value lives at the top of `core/validators.py`, except the upload
cap which is also enforced by Streamlit.

| Constant | Value | Used by | Source |
| --- | --- | --- | --- |
| `MAX_TITLE_WORDS` | 25 | PR-01 | `core/validators.py` |
| `MAX_DESCRIPTION_WORDS` | 50 | PR-02 | `core/validators.py` |
| `MAX_DAMAGE_ITEMS` | 50 | DX-02 | `core/validators.py` |
| `MAX_UPLOAD_BYTES` | 100,000,000 (100 MB) | DI-X-07 | `core/validators.py` |
| `ITR_THRESHOLD` | $25,000,000 | FR-04 | `core/validators.py` |
| `LONGITUDE_MIN` / `LONGITUDE_MAX` | 140.902254 / 153.730439 | DI-X-04 | `core/validators.py` |
| `LATITUDE_MIN` / `LATITUDE_MAX` | −37.633837 / −28.592358 | DI-X-04 | `core/validators.py` |
| `DATE_FORMAT` | `%d/%m/%Y` | PR-03, DI-X-02 | `core/validators.py` |
| `PRE_DISASTER_EVIDENCE_SUFFIX` | `predisasterevidence` | DI-X-06 | `core/validators.py` |
| `DAMAGE_EVIDENCE_SUFFIX` | `damageevidence` | DI-X-06 | `core/validators.py` |
| `maxUploadSize` | 100 (MB) | Upload form | `.streamlit/config.toml` |

The coordinate bounds are the values stated on the EPAR form itself for damage
locations within NSW.

---

## 7. Known gaps — what is *not* validated

Recorded honestly so the incoming team is not surprised. None of these is a
defect in the running code; they are scope boundaries.

1. **Asset Sub-Category is not enforced.** The entry exists in the
   required-fields map in `_item_required_fields` but is commented out. The
   parser does attempt to read it and records PN-01 when it cannot.
2. **Asset Material and the pre-disaster function answer cannot be read at
   all.** The plain-text export lists every option without marking the
   selection. These surface as INFO disclaimers (PN-02, PN-03) asking the user
   to check manually. Resolving this needs a different export format from
   SmartyGrants, not a code change here.
3. **ABN is not checksum-validated.** AG-10 checks presence only, not the
   11-digit ABN modulus-89 check.
4. **Addresses are matched on the literal string `NSW`.** An address written as
   "New South Wales" fails AG-02/AG-03/PR-04/DI-X-03. There is no postcode,
   LGA, or gazetteer lookup.
5. **No disaster-event or declared-disaster-zone check.** The landing page card
   text mentions postcode/council eligibility; no such rule is implemented.
6. **No project-management cost cap.** The landing page card text mentions a 30%
   PM cost cap; no such rule is implemented. Only DI-X-05 (components sum to
   total) constrains the cost breakdown.
7. **No cross-application or historical checks.** The system holds one
   application at a time and stores nothing between sessions, so duplicate
   applications across submissions cannot be detected.
8. **Cost evidence filenames have no naming rule** — only pre-disaster and
   damage evidence do.

> **Action for NSWRA:** items 5 and 6 are *marketing copy on the landing page
> that overstates the system*. Either implement the rules or correct the text in
> `static/html/cards.html`. This is the single most visible inconsistency in the
> handover.

---

## 8. Change control for validations

Any change to this register is a change to what NSWRA tells applicants their
application must satisfy. Treat it as a controlled change:

1. Agree the rule change with the EPAR program owner **in writing** before
   touching code — a validation is policy, not a technical detail.
2. Change the constant or function in `core/validators.py`.
3. Add or update a test in `tests/test_validators.py`.
4. Update this register **in the same commit** as the code change.
5. Note the change in the handover log at the bottom of `docs/HANDOVER.md`.

If a threshold is expected to change with each funding round (the ITR threshold
is the likely candidate), see the recommendation in `docs/MAINTENANCE.md` about
lifting these constants into a configuration file so a policy officer can change
them without a developer.

---

## 9. Verifying this register against the code

The register can be regenerated at any time. From the repository root:

```bash
python3 -c "
from core.models import ApplicationData, DamageItem
from core.validators import application_checks, damage_item_checks, cross_checks
d = ApplicationData()
for label, checks in (
    ('APPLICATION-LEVEL', application_checks(d)),
    ('PER DAMAGE ITEM', damage_item_checks(DamageItem(damage_item_id='DI-001'), 1)),
    ('CROSS-DOCUMENT', cross_checks(d, [], [])),
):
    print(f'--- {label} ({len(checks)}) ---')
    for c in checks:
        print(f'{c.section} | {c.name} | {c.severity}')
"
```

If the output does not match sections 5.1–5.7, this register is out of date and
must be corrected.
