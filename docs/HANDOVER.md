# Handover Documentation
## NSWRA Grant Application Quality Checker

| | |
| --- | --- |
| **System name** | Grant Application Quality Checker |
| **Owner on handover** | NSW Reconstruction Authority (NSWRA) |
| **Grant program** | Essential Public Asset Restoration (EPAR), under the Disaster Recovery Funding Arrangements |
| **Repository** | `cherry053/NSWRA-Application-Checker` |
| **Document status** | Handover issue |
| **Companion documents** | [Validation Register](VALIDATION-REGISTER.md) · [Installation Guide](INSTALLATION.md) · [Maintenance Guide](MAINTENANCE.md) |

---

## Contents

1. [Purpose of this document](#1-purpose-of-this-document)
2. [Executive summary](#2-executive-summary)
3. [What is being handed over](#3-what-is-being-handed-over)
4. [What the system does](#4-what-the-system-does)
5. [How it works — architecture and data flow](#5-how-it-works--architecture-and-data-flow)
6. [The validations applied](#6-the-validations-applied)
7. [Installation and deployment](#7-installation-and-deployment)
8. [Running the system day to day](#8-running-the-system-day-to-day)
9. [Maintaining the system — advice to NSWRA](#9-maintaining-the-system--advice-to-nswra)
10. [Known limitations, assumptions and risks](#10-known-limitations-assumptions-and-risks)
11. [Security and privacy posture](#11-security-and-privacy-posture)
12. [Outstanding items and recommended next steps](#12-outstanding-items-and-recommended-next-steps)
13. [Handover acceptance checklist](#13-handover-acceptance-checklist)
14. [Glossary](#14-glossary)
15. [Document control](#15-document-control)

---

## 1. Purpose of this document

This is the complete handover record for the Grant Application Quality Checker.
It is written so that a team with no prior exposure to the system can take
ownership of it: understand what it does, stand it up, verify it is behaving
correctly, change it safely, and know what it does *not* do.

Read it in this order depending on who you are:

| If you are… | Read |
| --- | --- |
| An executive or program owner | Sections 2, 4, 6, 10, 12 |
| Taking technical ownership | All of it, then the three companion documents |
| Installing or deploying it | Section 7, then [INSTALLATION.md](INSTALLATION.md) |
| Responsible for it long-term | Section 9, then [MAINTENANCE.md](MAINTENANCE.md) |
| Answering "what does it check?" | Section 6, then [VALIDATION-REGISTER.md](VALIDATION-REGISTER.md) |

Four things are explicitly included at NSWRA's request and each has a dedicated
home: **an outline of everything in the handover** (section 3), **a record of
every validation applied** (section 6 and the Validation Register), **the
installation process** (section 7 and the Installation Guide), and **advice on
maintaining the system** (section 9 and the Maintenance Guide).

---

## 2. Executive summary

The Grant Application Quality Checker is a web application that reviews an EPAR
grant application **before** it is submitted and tells the applicant what is
wrong with it. An applicant exports their SmartyGrants application as a PDF,
pastes in their damage table, and within seconds gets a structured report:
which criteria passed, which failed, why, and a downloadable PDF of the
feedback.

**It applies 34 fixed validation criteria plus 7 more for every damage item in
the application** — 104 criteria for a typical ten-item application — grouped
into the six sections of the EPAR form so the feedback maps directly onto the
form the applicant is filling in.

Three things to understand at management level:

- **It is advisory.** It has no connection to SmartyGrants. It cannot submit,
  change, approve or reject an application. It reads an export and reports.
- **It is simple and self-contained.** About 2,000 lines of Python, four
  dependencies, no database, no external services, no stored data, no secrets.
  It runs inside a firewalled network because everything it needs is vendored
  into the repository.
- **Its main long-term risk is not technical failure but silent drift.** If
  SmartyGrants changes its export format, the system will not crash — it will
  quietly start reporting that correctly-filled fields are missing. Section 9
  and the Maintenance Guide are built around detecting exactly that.

The intended benefit is fewer incomplete EPAR applications reaching NSWRA
assessors, and faster feedback loops for delivery agencies.

---

## 3. What is being handed over

### 3.1 In scope — delivered

| Item | Location | Notes |
| --- | --- | --- |
| **Application source code** | `app.py`, `core/`, `pages/`, `utils/` | ~2,000 lines of Python. Complete and working |
| **Automated test suite** | `tests/` | 26 tests. All passing at handover, verified on Python 3.11 |
| **Runtime configuration** | `.streamlit/config.toml` | Upload cap and theme. Committed, no secrets |
| **Dependency manifest** | `requirements.txt` | Four exactly-pinned packages |
| **NSW-branded interface** | `static/css/`, `static/html/`, `static/media/` | Page templates, stylesheet, NSW logo |
| **Vendored NSW Design System** | `static/vendor/` | v3.24.10 plus its MIT licence. Vendored deliberately so the system works offline and behind firewalls |
| **In-app user manual** | `pages/3_Guide.py`, `static/guide/images/` | Step-by-step instructions with screenshots, served as a page inside the app |
| **Downloadable feedback report** | `core/report_pdf.py` | Generates the applicant-facing PDF |
| **This handover pack** | `docs/` | This document plus the Validation Register, Installation Guide and Maintenance Guide |
| **Repository history** | Git | Full commit history retained |

### 3.2 Explicitly out of scope — NOT included

State these plainly so nobody assumes otherwise:

- **No hosting, infrastructure or domain.** NSWRA must decide where it runs. See
  section 7.
- **No credentials, API keys or secrets.** The system does not use any.
- **No SmartyGrants integration or access.** The system never talks to
  SmartyGrants; the applicant is the integration.
- **No user accounts or authentication.** Whoever can reach the URL can use it.
  See section 11.
- **No applicant data.** Nothing is stored, so nothing is transferred.
- **No support contract or on-call arrangement.**
- **No regression test sample.** A known-good PDF export plus its matching table
  text is the single most valuable operational asset for this system, and it
  cannot live in the repository because it contains real applicant data. **NSWRA
  must create and store one.** See section 9 and Maintenance Guide §4.

### 3.3 Access NSWRA needs to obtain

- Administrative ownership of the Git repository `cherry053/NSWRA-Application-Checker`.
- If the demonstration deployment on Streamlit Community Cloud is to continue,
  ownership of that deployment — or a decision to retire it (recommended; see
  section 11).

---

## 4. What the system does

### 4.1 Who uses it

**Eligible delivery agencies** — typically local councils and NSW state agencies
preparing an EPAR submission — plus **NSWRA program staff** who may use it to
sanity-check an application during assessment. There are no roles, permissions,
or accounts; every user sees the same thing.

### 4.2 The user journey

1. The applicant completes their EPAR application in SmartyGrants.
2. They download it as a **PDF export**.
3. They copy the **Damage Information – EPAR table** out of the web form as
   plain text.
4. On the checker's upload page they supply both: one PDF (up to 100 MB) and the
   pasted table text.
5. The system **screens the paste** against the PDF in about a second and warns
   about obvious copy-and-paste problems — an empty paste, a doubled-up paste, a
   record cut off part-way. These warnings never block: the applicant can always
   choose "Run the full analysis anyway".
6. A dedicated **Processing page** runs the full check with a live five-stage
   checklist and progress bar.
7. The **Results page** shows the outcome: an overall readiness badge, a
   confidence score, headline metrics, criteria grouped into the six EPAR form
   sections as expandable drop-downs, and raised flags ranked by severity.
8. The applicant filters the criteria by status (Pass / Review / Fail) or
   searches them, and **downloads the whole thing as a PDF report**.

### 4.3 Why two inputs are needed

This is the design decision that most often needs explaining.

The SmartyGrants PDF export renders the damage table in a rotated column layout
that **does not survive PDF text extraction** — it comes out as shredded
fragments. Those pages are unusable, so the system does not even read them. The
damage table data comes from the pasted text instead, and the PDF supplies
everything else.

This has a useful side effect: skipping those pages is also where the
performance comes from. A large application that would take minutes to extract
completes in seconds.

### 4.4 What it deliberately does not do

- It does not submit, alter, approve or reject anything.
- It does not store applications, results, or any personal information.
- It does not check one application against another, or against history.
- It does not verify facts about the world — that an asset exists, that costs
  are reasonable, or that a disaster was declared. It checks **completeness,
  format, internal consistency and stated thresholds**.

---

## 5. How it works — architecture and data flow

### 5.1 Technology

A single Python **Streamlit** web application. Streamlit provides the entire
interface — no separate front end, no JavaScript build, no API layer. Four
runtime dependencies: `streamlit`, `pdfplumber` (PDF text extraction),
`reportlab` (PDF report generation), and `pytest` (tests only).

### 5.2 The architectural rule that matters

**`core/` contains no Streamlit imports.** All parsing, validation, filtering and
reporting logic is plain, importable, directly testable Python. Streamlit appears
only in `app.py`, `pages/` and `utils/ui.py`.

This is why the full test suite runs in a fifth of a second with no browser and
no server, and it is the property most worth defending in any future change.

### 5.3 Module map

| Module | Responsibility |
| --- | --- |
| `app.py` | Upload page: the form, the paste pre-check, and the hand-off to processing |
| `pages/2_Processing.py` | Loading page — runs the pipeline with a staged progress checklist |
| `pages/1_Results.py` | Results view — metrics, filters, criteria sections, flag cards, PDF download |
| `pages/3_Guide.py` | Self-contained in-app user manual |
| `core/pipeline.py` | Orchestration: `check_application(pdf, table_text)` — the single entry point to everything |
| `core/pdf_extract.py` | PDF text extraction, page-skipping optimisation, header/footer removal |
| `core/section_splitter.py` | Cuts the PDF text at the damage-table boundaries |
| `core/field_parser.py` | Parses application-level fields (labels, radio buttons, checkboxes, currency) |
| `core/damage_table_parser.py` | Parses the pasted damage-table text into damage items |
| `core/paste_precheck.py` | Upload-time screening of the paste against the PDF |
| `core/validators.py` | **Every validation rule and the scoring logic** |
| `core/models.py` | The data structures: `ApplicationData`, `DamageItem`, `CriterionResult`, `CheckResult` |
| `core/sections.py` | The six EPAR form sections and criteria grouping |
| `core/filters.py` | Status mapping (Pass/Review/Fail) and results-page filtering |
| `core/report_pdf.py` | Builds the downloadable feedback PDF |
| `utils/ui.py` | NSW-branded rendering helpers; all HTML lives in `static/html` |

### 5.4 Data flow

```
Applicant supplies:  SmartyGrants PDF export  +  pasted damage table text
                                │                          │
                                ▼                          ▼
              ┌──────────────────────────────────────────────────┐
   STAGE 1    │  paste_precheck — fast screen, ~1 second         │
              │  Warnings shown; applicant may proceed anyway    │
              └──────────────────────────────────────────────────┘
                                │
                                ▼
              ┌──────────────────────────────────────────────────┐
   STAGE 2    │  pipeline.check_application()                    │
              │   1. pdf_extract    — read, skipping table pages │
              │   2. field_parser   — application-level fields   │
              │   3. damage_table_parser — the pasted items      │
              └──────────────────────────────────────────────────┘
                                │
                                ▼
              ┌──────────────────────────────────────────────────┐
   STAGE 3    │  validators.run_checks()                        │
              │   34 fixed criteria + 7 per damage item          │
              │   → confidence score + PASS / PARTIAL / FAIL     │
              └──────────────────────────────────────────────────┘
                                │
                                ▼
              Results page  ·  Downloadable PDF feedback report
                       (nothing is written to disk)
```

### 5.5 Two behaviours worth knowing about

**Page skipping.** `extract_pages` reads the PDF top-down only as far as the
`Damage Information` heading, then bottom-up only as far as
`Number of Damage Items`. The rotated table pages between them are never read.
If either heading is missing, it safely falls back to reading every page —
correct, but noticeably slower. Sudden across-the-board slowness is therefore a
signal that the export headings have changed.

**The deliberate minimum stage delay.** The Processing page holds each stage on
screen for ~0.45 seconds. The pipeline is usually fast enough that the checklist
would flash past unseen, which reads as a broken screen rather than work
happening. Slow stages already exceed the minimum and are never delayed. This is
intentional, not a performance defect.

---

## 6. The validations applied

> **Full detail:** every rule, threshold, severity, message and code location is
> recorded in **[VALIDATION-REGISTER.md](VALIDATION-REGISTER.md)**. This section
> is the summary.

### 6.1 Yes — there is a complete record of the validations

The Validation Register is the authoritative list. It records validations at all
three points the system applies them, states the exact rule and threshold for
each, cites the file and function that implements it, and includes a command to
regenerate the list from the running code so it can always be re-verified.

### 6.2 How many, and where they come from

```
Total criteria for any application  =  34  +  (7 × number of damage items)
```

| Group | Count | Applied to |
| --- | --- | --- |
| Application-level criteria | 29 | Once per application |
| Cross-document criteria | 5 | Once per application |
| Per-damage-item criteria | 7 each | Every damage item |

A ten-item application produces **104 criteria**.

### 6.3 By EPAR form section

| # | Form section | Criteria | Covers |
| --- | --- | --- | --- |
| 1 | Grant Program Information (EPAR) | 1 | Eligibility confirmation ticked |
| 2 | Eligible Delivery Agency Details | 12 | Organisation name, NSW addresses, phone and email formats, primary contact, ABN, public liability insurance and its evidence |
| 3 | EPAR Project Details | 9 | Title and description word limits, date range, NSW location, LGA, electorates, asset type, re-damaged asset question |
| 4 | Damage Information | 3 + 7 per item | Item count reconciliation, 50-item limit, clean parse; then per item: required fields, date validity, NSW locations, NSW coordinate bounds, cost components summing to the total, evidence file naming, upload sizes |
| 5 | EPAR Funding Request | 4 | Total amount present, insurance compensation answered, total reconciles against the damage table, $25M Independent Technical Review threshold |
| 6 | Declaration and Authorisation | 5 | Declaration agreed, authoriser name, position, phone and email |

### 6.4 Severity and how results are scored

| Outcome | Status shown | Meaning |
| --- | --- | --- |
| Passed | **Pass** (green) | Nothing to do |
| Failed, `critical` severity | **Fail** (red) | An assessor-visible defect; fix before submitting |
| Failed, `warning` severity | **Review** (amber) | Needs a human decision; may be legitimately acceptable |

- **Confidence score** = percentage of criteria passed. All criteria weigh
  equally.
- **Overall status** — `PASS` when everything passes; `FAIL` when a critical
  criterion failed **and** no more than half of all criteria passed; `PARTIAL`
  otherwise (the normal outcome for a real application with a few defects).

Only four criteria are `warning` severity: evidence file naming, upload sizes,
damage table parse cleanliness, and the $25M ITR threshold. Everything else is
`critical`.

### 6.5 Informational disclaimers — not validations

The plain-text export lists every option of the **Asset Material** checkbox group
and the **pre-disaster function** question without marking which was selected, so
the system genuinely cannot read them. Rather than guess or fail, it shows INFO
cards asking the user to double-check those selections manually.

**These never affect the confidence score or the overall status.** They are
disclosures of a limitation, not findings.

### 6.6 The most important caveat

The landing page currently advertises a **30% project-management cost cap** and
**postcode/council eligibility checking**. Neither is implemented. It also says
"10 criteria checked", which understates the system by an order of magnitude.

This is the most visible inconsistency in the handover and the cheapest to fix —
either implement the rules or correct `static/html/cards.html`. See
[Validation Register §7](VALIDATION-REGISTER.md#7-known-gaps--what-is-not-validated)
for the full list of what is *not* validated.

---

## 7. Installation and deployment

> **Full runbook:** **[INSTALLATION.md](INSTALLATION.md)** — local, server,
> Streamlit Cloud and container deployments, configuration, verification and
> troubleshooting.

### 7.1 Requirements at a glance

- **Python 3.10 or newer** (verified on 3.11). It will not run on 3.9.
- ~500 MB disk, 1–2 GB memory.
- Network access **only** to install packages. Once installed the system makes
  no outbound calls — everything is vendored, so it runs behind a firewall.
- No database, no secrets, no external services.

### 7.2 Installing it

```bash
git clone <repository-url> NSWRA-Application-Checker
cd NSWRA-Application-Checker
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
streamlit run app.py
```

That is the whole installation. The app serves at `http://localhost:8501`.

### 7.3 Choosing where it runs

| Option | Suitable for | Key consideration |
| --- | --- | --- |
| **Local workstation** | Development, one-off checks | No availability to other users |
| **NSWRA-hosted server** — **recommended** | Business use | Run under a dedicated service account with systemd, behind an nginx reverse proxy providing TLS. Full configuration in the Installation Guide |
| **Streamlit Community Cloud** | Demonstration, user testing only | Public, third-party infrastructure. Uploaded PDFs are processed outside NSWRA's control. **Not appropriate as a permanent home for real applicant data** |
| **Container** | If NSWRA's platform is container-based | No `Dockerfile` ships today; a working one is provided in the Installation Guide |

### 7.4 The two deployment mistakes people make

1. **Reverse proxy not configured for WebSockets.** The page loads once and then
   never updates; the progress bar looks frozen. Fix: the `Upgrade` and
   `Connection` headers in Installation Guide §3.3.
2. **`client_max_body_size` below 100 MB.** Large PDF uploads fail with a 413
   before the app ever sees them.

### 7.5 Verifying an installation

```bash
pip check                        # dependencies resolve
python -m pytest tests/ -q       # expected: 26 passed
streamlit run app.py             # then confirm HTTP 200 on the port
```

Then run one real application end to end — upload, paste, check, download the
PDF report. That is the only test that proves the whole chain works.

---

## 8. Running the system day to day

**There is nothing to operate.** No batch jobs, no queues, no scheduled tasks,
no data retention, no backups (there is no data to back up). Restarting the
service loses nothing, because state lives in the user's browser session only.

| Concern | Position |
| --- | --- |
| **Availability** | Single process. Restart on failure via systemd. No clustering |
| **Health check** | `GET /_stcore/health` — Streamlit's built-in endpoint |
| **Logging** | Python `logging` to stdout: pipeline stages, page counts, item counts, final status. **No applicant data is logged.** Under systemd: `journalctl -u appchecker -f` |
| **Backups** | Not applicable — the system is stateless. Back up the Git repository, which GitHub already does |
| **Capacity** | One check at a time per user. Concurrent heavy checks are CPU-bound on PDF extraction. If contention appears, run more instances behind the proxy |
| **Data retention** | Nothing is written to disk. Uploads live in memory for the duration of the check |

---

## 9. Maintaining the system — advice to NSWRA

> **Full guide:** **[MAINTENANCE.md](MAINTENANCE.md)** — calendar, roles,
> dependency procedure, diagnostics, and how to change validations safely.

### 9.1 The one thing to understand

This system is coupled to two things NSWRA does not control: **the SmartyGrants
PDF export layout** and **the Streamlit library**. The parsers anchor on exact
label text — `"Organisation Name *"`, `"Anticipated start date *"`,
`"Number of damaged items being restored"`.

**The likely failure mode is not a crash. It is silence.** If SmartyGrants
changes a label, the system will report that correctly-filled fields are missing,
and it will do so confidently. Applicants will act on wrong advice. Nothing will
alert you.

Everything below is designed to catch that.

### 9.2 Establish a regression sample — the single highest-value action

Keep one known-good SmartyGrants PDF export, its matching pasted table text, and
a record of the expected result (criteria passed, overall status, confidence
score). Store it in NSWRA's document management system — **not** in the Git
repository, which has no controls for real applicant data.

Run it whenever a funding round opens, whenever SmartyGrants changes, whenever
dependencies are updated, and whenever code changes. You are looking for the same
criteria passing and failing as last time. A sudden cluster of "Required field is
missing" against fields you know are populated is a broken parser, not a bad
application.

Log each run in a spreadsheet — date, criteria passed, status, anything that
changed. Without that record you cannot distinguish a regression from a genuinely
worse application.

### 9.3 Name three people

You do not need a full-time developer. You need three capabilities, each with a
named backup:

- **Product owner** — owns *what* is checked, approves every change to the
  Validation Register. Needs EPAR program knowledge, no technical skill. **This
  is the role most often left unfilled and the one that matters most:** a
  validation rule is policy expressed in code.
- **Maintainer** — applies updates, changes thresholds, fixes parsers. Needs
  intermediate Python and Git.
- **Operator** — keeps the service running, holds certificates. Standard NSWRA
  ICT server administration.

### 9.4 Maintenance calendar

| Cadence | Task |
| --- | --- |
| **Each funding round** | Run the regression sample. Review the thresholds — especially the $25M ITR threshold — against current EPAR guidelines |
| **Quarterly** | Apply dependency updates and re-run the tests plus the regression sample. Review the Guide page screenshots against the live SmartyGrants interface |
| **Annually** | Review deployment: TLS, access control, Python version support |
| **On any SmartyGrants change** | Re-run the regression sample immediately. Treat as priority |

If NSWRA can commit to only one item on this list, make it the regression run
each funding round. Everything else is recoverable; a season of confidently wrong
advice to applicants is not.

### 9.5 Changing a validation safely

A validation rule is a statement to applicants about what their application must
satisfy, so treat changes as controlled:

1. Agree the change with the EPAR program owner **in writing** before touching
   code.
2. Change the constant or function in `core/validators.py` — every tunable
   threshold sits at the top of that file.
3. Add or update a test in `tests/test_validators.py`.
4. Update `docs/VALIDATION-REGISTER.md` **in the same commit**.
5. Run the tests and the regression sample.

### 9.6 Two conventions to preserve

- **Keep `core/` free of Streamlit imports.** It is why the tests run in a
  fifth of a second without a browser. The moment validation logic reads
  `st.session_state`, this system becomes materially harder to maintain.
- **Keep the no-regex parsing style.** The parsers use anchor lines, ordered
  cursor walks and plain string operations deliberately, so they stay readable
  by someone who is not a Python specialist. That is the right trade-off for a
  system maintained occasionally rather than continuously.

### 9.7 If maintenance stops

Stated plainly: the system will keep working until the SmartyGrants export
changes, then it will start giving wrong advice without any visible error. The
minimum viable posture is **one named product owner and one regression run per
funding round** — a few hours a year. If NSWRA decides not to maintain it, the
correct action is to take it offline rather than leave it running unmonitored.

---

## 10. Known limitations, assumptions and risks

### 10.1 Functional limitations

| # | Limitation | Impact | Mitigation in place |
| --- | --- | --- | --- |
| 1 | Asset Material and the pre-disaster function answer cannot be read — the export lists every option without marking the selection | Two selections go unchecked | INFO disclaimer cards ask the user to verify manually. Resolving this needs a different SmartyGrants export, not a code change |
| 2 | The damage table must be pasted manually | User effort; risk of partial paste | The Stage 1 pre-check catches empty, doubled and truncated pastes |
| 3 | NSW location checks match the literal string `NSW` | "New South Wales" spelled out fails the check | Documented; low incidence in practice |
| 4 | ABN presence is checked, not its checksum | An invalid ABN passes | Documented |
| 5 | Asset Sub-Category is not enforced (commented out in `_item_required_fields`) | One required field unchecked | Documented in Validation Register §7 |
| 6 | Cost comparisons are exact — no rounding tolerance | A one-cent discrepancy fails | Intentional; relevant when triaging complaints |
| 7 | No disaster-zone, postcode or PM cost cap checks, despite the landing page implying otherwise | Public-facing inaccuracy | **Open item** — see section 12 |
| 8 | One application at a time; nothing retained | No duplicate detection across submissions | By design |

### 10.2 Assumptions the system depends on

- The SmartyGrants export keeps its current field labels and its
  `Damage Information` / `Number of Damage Items` section headings.
- Applicants paste the damage table as **plain text** copied from the web form.
- The damage table is unusable in the PDF and must come from the paste.
- Dates are `dd/mm/yyyy`; currency uses `$` with comma thousands separators.
- Applications have no more than 50 damage items.

### 10.3 Risk register

| Risk | Likelihood | Impact | Response |
| --- | --- | --- | --- |
| SmartyGrants export layout changes | **Medium** | **High** — silent wrong advice | Regression sample each funding round (§9.2). The primary control |
| No named owner after handover | **Medium** | **High** — drift goes unnoticed | Name the three roles in §9.3 as part of handover acceptance |
| Streamlit major version breaks the UI | Low–Medium | Medium — visible failure, quickly diagnosed | Pinned versions; controlled quarterly upgrades |
| Landing page overstates capability | **Certain today** | Medium — reputational | Fix `static/html/cards.html` (§12, item 1) |
| Malicious PDF exploiting the parser | Low | Medium | Run under a non-privileged service account; patch `pdfplumber` promptly on CVEs |
| Left running on public Community Cloud with real data | Medium | **High** — privacy | Migrate to NSWRA hosting or retire the public deployment (§12, item 2) |
| No CI — a broken change reaches production | Medium | Medium | Add a GitHub Actions workflow (§12, item 3) |

---

## 11. Security and privacy posture

**What is favourable:**

- **No data at rest.** Nothing is written to disk; uploads exist in memory for
  the duration of a check. There is no database and no retention.
- **No secrets.** No API keys, credentials or tokens anywhere in the system.
- **No outbound network calls at runtime.** The NSW Design System stylesheet and
  every image are vendored and inlined, so the system functions fully inside a
  firewalled government network and leaks nothing to third parties.
- **No applicant data in logs** — counts, application ID and status only.
- **All user-supplied text is HTML-escaped** before rendering (`utils/ui.py`,
  `core/report_pdf.py`), so a crafted field cannot inject markup into the page or
  the PDF report.

**What NSWRA must decide:**

1. **Authentication.** There is none. Anyone who can reach the URL can use it.
   Either keep it on the internal network only, or front the reverse proxy with
   NSWRA's identity provider. Internal-only is defensible — the data is the
   applicant's own and nothing is retained — but it must be a *recorded
   decision*, not an accident.
2. **Transport security.** Streamlit serves plain HTTP. TLS must be terminated
   at the reverse proxy.
3. **The public Community Cloud deployment.** If one is running, real applicant
   PDFs are being processed on third-party infrastructure NSWRA does not
   control. Migrate or retire it.
4. **Upload handling.** The system parses arbitrary user-supplied PDFs. Run it
   under a dedicated non-privileged service account and treat `pdfplumber` /
   `pdfminer.six` security advisories as priority patches.

---

## 12. Outstanding items and recommended next steps

Ordered by value for effort. None is a defect — the system works as delivered.

| # | Action | Why | Effort |
| --- | --- | --- | --- |
| 1 | **Correct the landing-page claims** in `static/html/cards.html` | It advertises a 30% PM cost cap and postcode eligibility checking that do not exist, and understates the criteria count | 30 min |
| 2 | **Decide where it is hosted** and retire the public Community Cloud deployment if real data is involved | Privacy exposure | Half a day |
| 3 | **Add CI** — a GitHub Actions workflow running `pytest` on every push | Permanently prevents merging a broken change | 1 hour |
| 4 | **Create the regression sample** and log its expected result | The primary control against silent parser drift | 1 hour |
| 5 | **Name the product owner, maintainer and operator** | Ownership gap is the top handover risk | Meeting |
| 6 | **Externalise the thresholds** into config a policy officer can edit | ITR threshold and word limits are policy, not code | Half a day |
| 7 | **Split `requirements-dev.txt`** so `pytest` is not installed in production | Tidiness; security reviews ask about it | 15 min |
| 8 | **Add a test using a real redacted export** | Current tests use synthetic text and will not catch a SmartyGrants layout change — today's biggest blind spot | 1 day |
| 9 | **Decide on Asset Sub-Category** — enforce it or record the decision not to | Currently commented out with no recorded rationale | 30 min |
| 10 | **Add a `Dockerfile`** (a working one is in the Installation Guide) | Only if NSWRA's platform is container-based | 2 hours |

---

## 13. Handover acceptance checklist

Work through this with the outgoing party present. Every item is verifiable.

**Code and documentation**

- [ ] Repository transferred; NSWRA holds administrative ownership
- [ ] Full commit history present
- [ ] This handover pack (`docs/`) reviewed and accepted
- [ ] Validation Register reviewed by the EPAR program owner and confirmed to
      match current program policy

**Technical verification** — perform on NSWRA's own machine

- [ ] Clean install completed following [INSTALLATION.md](INSTALLATION.md) §2
- [ ] `python -m pytest tests/ -q` → **26 passed**
- [ ] Application boots and serves HTTP 200
- [ ] A real EPAR application checked end to end, producing sensible results
- [ ] Feedback PDF downloads and is readable
- [ ] Results reviewed by a program subject-matter expert and agreed as correct

**Operational readiness**

- [ ] Hosting decision made and documented (section 7.3)
- [ ] Authentication decision made and documented (section 11)
- [ ] Product owner, maintainer and operator named, each with a backup
- [ ] Regression sample created and stored in NSWRA document management
- [ ] Maintenance calendar (section 9.4) entered in the team's planning system

**Knowledge transfer**

- [ ] Walkthrough of the module map and data flow (section 5) completed
- [ ] Walkthrough of `core/validators.py` completed with the maintainer
- [ ] Known limitations (section 10) and open items (section 12) accepted by
      the product owner

---

## 14. Glossary

| Term | Meaning |
| --- | --- |
| **EPAR** | Essential Public Asset Restoration — the NSW grant program this system supports |
| **DRFA** | Disaster Recovery Funding Arrangements — the Commonwealth/State framework EPAR sits under |
| **NSWRA** | NSW Reconstruction Authority |
| **SmartyGrants** | The third-party grants management platform where EPAR applications are lodged |
| **Delivery agency** | The applicant organisation — typically a council or state agency |
| **Damage item** | One damaged asset line in the Damage Information table |
| **Criterion** | One individual validation check with a Pass / Review / Fail outcome |
| **Confidence score** | Percentage of criteria passed |
| **ERC** | Estimated Reconstruction Cost — the total funding requested |
| **ITR** | Independent Technical Review — triggered above a $25M package total |
| **Critical / Warning** | Criterion severity, driving the Fail (red) or Review (amber) status |
| **Notice / INFO card** | An informational disclaimer about something the export cannot show; never scored |
| **Pre-check** | The fast upload-time screening of the pasted table against the PDF |

---

## 15. Document control

| Document | Purpose |
| --- | --- |
| `docs/HANDOVER.md` | This document — the complete handover record |
| `docs/VALIDATION-REGISTER.md` | Authoritative record of every validation applied |
| `docs/INSTALLATION.md` | Installation and deployment runbook |
| `docs/MAINTENANCE.md` | Maintenance guide for NSWRA |
| `README.md` | Developer-facing technical overview |

**Keeping these current:** the Validation Register must be updated in the same
commit as any change to `core/validators.py`. The Installation Guide must be
updated when `requirements.txt` or `.streamlit/config.toml` changes. Record
material changes in the log below.

### Change log

| Date | Change | Author |
| --- | --- | --- |
| Handover issue | Initial handover pack: handover record, validation register, installation guide, maintenance guide. Verified against the code at handover — 26 tests passing, application boots and serves, validation list regenerated from source | Delivery team |
