# Maintenance Guide for the NSW Reconstruction Authority

**System:** Grant Application Quality Checker
**Audience:** the NSWRA team taking ownership — the product owner, whoever holds
the ICT relationship, and any developer who touches the code.

This guide is written on the assumption that NSWRA may not have a full-time
developer assigned to this system. It is deliberately explicit about what
*must* happen, what *should* happen, and what can safely wait.

---

## 1. What kind of system you are maintaining

Three characteristics shape everything below.

**It is small.** Around 2,000 lines of Python across eleven modules. A competent
Python developer can read the whole thing in a morning. There is no framework
sprawl, no database, and no build step. This is the system's greatest
maintenance asset — protect it.

**It is stateless and offline.** It holds one application in the user's browser
session, stores nothing between sessions, and makes no outbound network calls at
runtime. There is no data to back up, no data to breach at rest, and no
integration that can break underneath you. Restarting it loses nothing.

**It is coupled to two things outside NSWRA's control**, and this is where
maintenance effort will actually go:

1. **The SmartyGrants PDF export layout.** The parsers anchor on exact label
   text — `"Organisation Name *"`, `"Anticipated start date *"`,
   `"Number of damaged items being restored"`, and the `Damage Information` /
   `Number of Damage Items` headings. If SmartyGrants changes its export, fields
   silently stop being found and start failing as "missing".
2. **The Streamlit library.** The interface uses recent Streamlit APIs. A major
   Streamlit release can change or remove them.

**The single most likely failure mode is not a crash. It is a silent
regression**: an export layout changes, a field stops parsing, and every
application starts failing the same criterion. Section 4 exists to catch exactly
this.

---

## 2. Maintenance calendar

| Cadence | Task | Effort | Who |
| --- | --- | --- | --- |
| **Each EPAR funding round** | Run the regression sample end to end (§4). Confirm the criteria in `docs/VALIDATION-REGISTER.md` still match program policy | 1 hour | Product owner + developer |
| **Each funding round** | Review the thresholds table (Validation Register §6) against the current EPAR guidelines — especially the $25M ITR threshold | 30 min | Product owner |
| **Quarterly** | Apply dependency security updates (§5) | 1–2 hours | Developer |
| **Quarterly** | Review the user Guide page against the live SmartyGrants interface; screenshots go stale | 1 hour | Product owner |
| **Annually** | Review the deployment: TLS certificates, access control, Python version support (§7) | 2 hours | ICT |
| **On any SmartyGrants change** | Immediately re-run the regression sample. Treat as priority | 1–4 hours | Developer |
| **On user reports** | Triage using §6 | Varies | Support |

If NSWRA can only commit to one thing on this list, make it **the regression run
each funding round**. Everything else is recoverable; a season of silently wrong
advice to applicants is not.

---

## 3. Who needs to be able to do what

You do not need a dedicated developer. You need three capabilities named against
real people, with a backup for each:

| Capability | What it covers | Skill needed |
| --- | --- | --- |
| **Product owner** | Owns what the system checks. Approves any change to the validation register. Answers "should this be a Fail or a Review?" | EPAR program knowledge. No technical skill required |
| **Maintainer** | Applies dependency updates, changes a threshold, fixes a parser when the export changes | Intermediate Python. Familiarity with Git and virtual environments |
| **Operator** | Keeps the service running, holds the certificates, restores the host | Standard NSWRA ICT server administration |

The product owner role is the one most often left unfilled, and it is the one
that matters most. A validation rule is policy expressed in code — someone at
NSWRA must own the policy.

---

## 4. The regression sample — your most important control

Keep one **known-good SmartyGrants PDF export** and its **matching pasted damage
table text**, together with a record of the expected result (criteria passed,
overall status, confidence score).

Store it in NSWRA's document management system, not in the Git repository — it
contains real applicant data and the repository has no controls for that.

**Run it whenever any of the following happens:**

- a new EPAR funding round opens
- SmartyGrants announces or you notice a change to the form or export
- dependencies are updated
- any code change is made
- a user reports something odd and you need a baseline

**What you are looking for:** the same criteria passing and failing as last time.
A sudden cluster of "Required field is missing or empty" details against fields
you know are populated is the signature of a broken parser, not a bad
application.

Record each run — date, sample used, criteria passed / total, overall status,
anything that changed. A one-line entry in a spreadsheet is enough. Without this
record you cannot tell a regression from a genuinely worse application.

---

## 5. Keeping dependencies current

Four dependencies, pinned exactly in `requirements.txt`. Pinning is correct for
a system like this — it means an install today behaves exactly like an install
last year.

**Quarterly update procedure:**

```bash
git checkout -b chore/dependency-update
source .venv/bin/activate

pip list --outdated              # see what moved
# edit requirements.txt to the new pinned versions
pip install -r requirements.txt

python -m pytest tests/ -q       # must stay at 26 passed
streamlit run app.py             # then run the regression sample end to end
```

Only merge once **both** the test suite and the regression sample pass.

**Risk ranking, so effort goes where it matters:**

- **Streamlit — highest risk.** Read the release notes before a major version
  bump. Watch specifically for changes to `st.switch_page`, `st.html`,
  `st.set_page_config`, `st.file_uploader`, `st.expander`, session state
  behaviour, and the `text_alignment` argument on `st.header`. Upgrade one major
  version at a time.
- **pdfplumber — medium.** Text extraction behaviour can shift subtly between
  versions. The regression sample is the only reliable detector.
- **reportlab — low.** Used only for the feedback report and the test PDFs. A
  visual check of one downloaded report is sufficient.
- **pytest — none.** Test tooling only.

**Security patches are different.** If a CVE is announced against any of the
four, patch on a short timeline rather than waiting for the quarter. The system
accepts arbitrary user-uploaded PDFs, so a `pdfplumber`/`pdfminer.six` parsing
vulnerability is genuinely relevant to this system rather than theoretical.

---

## 6. Diagnosing the problems you will actually get

### "It says my field is missing but I filled it in"

Almost always a parser anchor mismatch, not a user error.

1. Get the PDF export from the user.
2. Extract what the parser sees:

   ```bash
   python3 -c "
   from core.pdf_extract import clean_lines, extract_pages
   for line in clean_lines(extract_pages('their-export.pdf'))[:200]:
       print(repr(line))
   "
   ```

3. Compare against the label strings in `core/field_parser.py`
   (`parse_pre_table_fields` / `parse_post_table_fields`). The comparison is
   exact — `"Organisation Name *"` with a trailing space or a changed asterisk
   will not match.
4. Fix the anchor, add a test, update the register if behaviour changed.

### "The check is taking minutes"

The system skips the garbled damage-table pages by looking for the
`Damage Information` and `Number of Damage Items` headings
(`core/pdf_extract.py`). When a heading is missing it safely falls back to
reading **every** page — correct, but slow on a large export. If checks suddenly
get slow across the board, those headings have changed.

### "Every application fails Total Amount Requested Reconciles"

Either the PDF total is not being parsed (check `"Total Amount Requested"` in
`parse_post_table_fields`), or the item totals are not (check the five-amount
cost block in `core/damage_table_parser.py`). Compare against the regression
sample to see which side moved.

### "The page loads then freezes"

Not the application. The reverse proxy is not upgrading WebSocket connections —
see `docs/INSTALLATION.md` §3.3.

### "The page looks like plain HTML"

The vendored NSW Design System stylesheet is not being read. Confirm
`static/vendor/nsw-design-system-3.24.10.css` exists and is readable by the
service account.

### Reading the logs

The pipeline logs each stage, page counts, item counts and the final result
through Python's standard `logging`. Under systemd:

```bash
journalctl -u appchecker -f
journalctl -u appchecker --since "1 hour ago" | grep -i "check finished\|failed"
```

No applicant data is logged — only counts, the application ID, and status.

---

## 7. Changing the system safely

### Changing a threshold (the most common change)

Every tunable value sits at the top of `core/validators.py`. Changing the ITR
threshold, the word limits, the item cap or the coordinate bounds is a one-line
edit. Then: update the test, update `docs/VALIDATION-REGISTER.md`, run the
regression sample.

> **Recommended improvement:** move these constants into a small
> `config.toml` or `thresholds.py` that a non-developer can edit under change
> control. The ITR threshold in particular is a policy number that will change
> without the code needing to. Until then, every threshold change needs a
> developer.

### Adding a new validation

The pattern is consistent and easy to follow:

1. Add the field to `ApplicationData` or `DamageItem` in `core/models.py`.
2. Parse it in `core/field_parser.py` or `core/damage_table_parser.py`.
3. Add a `CriterionResult` in `core/validators.py`, inside the right
   `stamp_section(...)` block so it lands in the correct form section.
4. Choose severity deliberately: `critical` = must fix; `warning` = a human
   should look. This choice drives the red/amber colour and the FAIL/PARTIAL
   status.
5. Write the `detail` text as advice to an applicant, not as a developer
   message. It is read by the public and printed in the PDF report.
6. Add a test in `tests/test_validators.py`.
7. Update `docs/VALIDATION-REGISTER.md` **in the same commit**.

### The architectural rule worth preserving

`core/` contains no Streamlit imports. Every parsing, validation, filtering and
reporting module is plain Python that can be imported and tested directly — which
is why 26 tests run in a fifth of a second with no browser and no server.

**Keep it that way.** Streamlit belongs only in `app.py`, `pages/`, and
`utils/ui.py`. The moment validation logic starts reading `st.session_state`, it
stops being testable and this system gets materially harder to maintain.

### The no-regex convention

The parsers deliberately use anchor lines, ordered cursor walks and plain string
operations rather than regular expressions. New contributors often assume this is
an oversight. It is not — it keeps the parsing readable by someone who is not a
Python specialist, which is the right trade-off for a system NSWRA maintains
occasionally rather than continuously. Follow the convention.

---

## 8. Recommended improvements, in priority order

Not defects — the system works. These are the things that would most reduce
NSWRA's maintenance risk, ordered by value for effort.

1. **Correct the landing-page claims.** `static/html/cards.html` advertises a
   30% PM cost cap, postcode/council eligibility checking, and "10 criteria" —
   none of which the system does (it applies 34 + 7 per item). Either implement
   them or fix the text. This is a public-facing accuracy issue and the fastest
   fix on the list.
2. **Add continuous integration.** A GitHub Actions workflow running
   `pytest` on every push costs an hour to set up and permanently prevents
   merging a broken change.
3. **Externalise the thresholds** (§7) so policy numbers change without a
   developer.
4. **Split `requirements-dev.txt`** so `pytest` is not installed in production.
5. **Add a test using a real (redacted) export** to lock in the parser anchors.
   The current tests use synthetic text, which will not catch a SmartyGrants
   layout change — today's biggest blind spot.
6. **Enforce Asset Sub-Category**, currently commented out in
   `_item_required_fields`, or formally record the decision not to.
7. **Add a `Dockerfile`** (a working one is in `docs/INSTALLATION.md` §5) if
   NSWRA's platform is container-based.
8. **Decide on authentication** — see `docs/INSTALLATION.md` §3.4. Record the
   decision either way.

---

## 9. If maintenance stops

An honest assessment, because unmaintained systems are common and pretending
otherwise helps nobody.

If nobody touches this system, it will keep working — until the SmartyGrants
export layout changes. At that point it will not crash or display an error. It
will report that fields are missing when they are not, and applicants will act
on wrong advice. That is a reputational risk, not a technical one, and it is
invisible without §4.

**The minimum viable maintenance posture** is therefore one named product owner
and one regression run per funding round. That is a few hours a year, and it is
the difference between a system that quietly stays correct and one that quietly
stops being correct.

If NSWRA decides not to maintain the system, the right action is to take it
offline rather than leave it running unmonitored.
