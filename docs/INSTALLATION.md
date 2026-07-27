# Installation and Deployment Guide

**System:** NSWRA Grant Application Quality Checker
**Audience:** whoever stands the system up — an NSWRA developer, an ICT support
officer, or a contractor.

Everything in this guide has been executed against the handed-over code. The
verification section at the end tells you exactly what a good install looks
like.

---

## 1. What you need before you start

| Requirement | Detail |
| --- | --- |
| **Python** | **3.10 or newer.** 3.11 is what the system was verified on. It will not run on 3.9 or earlier — the code uses `str \| None` union syntax that only parses from 3.10 |
| **Disk** | ~500 MB for the virtual environment (Streamlit pulls in pandas, pyarrow and numpy) |
| **Memory** | 1 GB is comfortable. A 100 MB PDF is held in memory during a check, so allow 2 GB if large exports are routine |
| **Network** | Only needed to install the packages. **Once installed the system makes no outbound calls** — the NSW Design System stylesheet and all images are vendored into the repository, so it runs inside a firewalled network |
| **Access** | Read access to the Git repository `cherry053/NSWRA-Application-Checker` |

No database, no message queue, no external API keys, no secrets. The system is
stateless: it holds one application in the user's browser session and stores
nothing on disk between checks.

---

## 2. Local installation (development or a single workstation)

```bash
# 1. Get the code
git clone <repository-url> NSWRA-Application-Checker
cd NSWRA-Application-Checker

# 2. Create an isolated environment (strongly recommended)
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate

# 3. Install the pinned dependencies
pip install --upgrade pip
pip install -r requirements.txt

# 4. Run it
streamlit run app.py
```

The app opens at `http://localhost:8501`.

`.venv/` is already in `.gitignore`, so the environment will never be committed.

### The four dependencies

`requirements.txt` pins exact versions. Do not loosen these without testing.

| Package | Version | Why it is there |
| --- | --- | --- |
| `streamlit` | 1.58.0 | The entire web interface. The code uses recent API surface (`st.switch_page`, `st.html`, `text_alignment=` on `st.header`), so **downgrading will break pages** |
| `pdfplumber` | 0.11.4 | Extracts text from the SmartyGrants PDF export |
| `reportlab` | 5.0.0 | Builds the downloadable PDF feedback report, and is also used by the test suite to generate real test PDFs |
| `pytest` | 8.3.4 | Test suite. Not needed at runtime — see the note below |

> **Recommendation:** split `pytest` out into a `requirements-dev.txt`. Shipping
> a test runner into production is harmless but untidy, and it is the kind of
> thing a security review will ask about.

---

## 3. Server installation (recommended for NSWRA-hosted deployment)

This is the deployment that keeps the system inside NSWRA's network. Instructions
assume a Linux host (Ubuntu/RHEL); adapt paths as needed.

### 3.1 Create a service account and install

```bash
sudo useradd --system --create-home --home-dir /opt/appchecker appchecker
sudo -u appchecker -i

git clone <repository-url> /opt/appchecker/app
cd /opt/appchecker/app
python3 -m venv .venv
.venv/bin/pip install --upgrade pip
.venv/bin/pip install -r requirements.txt
```

Running as a dedicated non-root account is important: the app accepts file
uploads from users, and `pdfplumber` parses them.

### 3.2 Run it as a managed service

Create `/etc/systemd/system/appchecker.service`:

```ini
[Unit]
Description=NSWRA Grant Application Quality Checker
After=network.target

[Service]
Type=simple
User=appchecker
WorkingDirectory=/opt/appchecker/app
Environment="PATH=/opt/appchecker/app/.venv/bin"
ExecStart=/opt/appchecker/app/.venv/bin/streamlit run app.py \
    --server.port=8501 \
    --server.address=127.0.0.1 \
    --server.headless=true \
    --browser.gatherUsageStats=false
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now appchecker
sudo systemctl status appchecker
```

`--server.address=127.0.0.1` binds to localhost only, so the app is reachable
solely through the reverse proxy in the next step. `--browser.gatherUsageStats=false`
stops Streamlit phoning home, which matters for a government deployment.

### 3.3 Put it behind a reverse proxy

Streamlit should not face users directly — it has no TLS and no authentication.
An `nginx` front end handles both:

```nginx
server {
    listen 443 ssl;
    server_name appchecker.internal.nsw.gov.au;

    ssl_certificate     /etc/ssl/certs/appchecker.crt;
    ssl_certificate_key /etc/ssl/private/appchecker.key;

    # Must be at least the 100MB upload limit, plus overhead
    client_max_body_size 120M;

    location / {
        proxy_pass         http://127.0.0.1:8501;
        proxy_http_version 1.1;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;

        # Streamlit needs WebSocket upgrade or the page will load and then hang
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection "upgrade";
        proxy_read_timeout 3600s;
    }
}
```

The two settings people forget, and the symptoms when they do:

- **`client_max_body_size`** below 100 MB → uploads of large PDFs fail with a
  413 before Streamlit ever sees them.
- **WebSocket upgrade headers** → the page renders once and then never updates;
  the progress checklist appears frozen.

### 3.4 Authentication

The system has **no built-in authentication**. Whoever can reach the URL can use
it. Decide deliberately:

- **Internal-only** (simplest): keep it on the internal network, no public DNS.
- **Front it with SSO**: put the reverse proxy behind NSWRA's existing identity
  provider (e.g. an OAuth2 proxy or Entra ID application proxy).

Given the application data involved is submitted by the applicant themselves and
nothing is retained, internal-only access is a defensible starting position — but
it should be a recorded decision, not an accident.

---

## 4. Streamlit Community Cloud deployment

This is how the system has been demonstrated to date, and the reason several
design decisions exist (all CSS and images are inlined rather than served from
Streamlit's static route, which is unreliable on that host).

1. Push the branch you want to deploy to GitHub.
2. At <https://share.streamlit.io>, sign in and choose **New app**.
3. Select the repository, the branch, and `app.py` as the entry point.
4. Deploy. The platform reads `requirements.txt` automatically.

**Understand the trade-off before choosing this route.** Community Cloud is a
public, third-party-hosted service. Uploaded PDFs are processed on infrastructure
NSWRA does not control, and the app is reachable from the public internet. It is
fine for demonstration and user testing; it is **not** an appropriate permanent
home for real applicant data. Plan to migrate to section 3 before business use.

---

## 5. Container deployment (optional)

No `Dockerfile` ships with the repository. If NSWRA's platform is
container-based, this is a known-good starting point — add it as `Dockerfile` at
the repository root:

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN useradd --create-home appuser && chown -R appuser /app
USER appuser

EXPOSE 8501
HEALTHCHECK CMD curl --fail http://localhost:8501/_stcore/health || exit 1

CMD ["streamlit", "run", "app.py", \
     "--server.port=8501", "--server.address=0.0.0.0", \
     "--server.headless=true", "--browser.gatherUsageStats=false"]
```

```bash
docker build -t nswra/appchecker:1.0.0 .
docker run -p 8501:8501 nswra/appchecker:1.0.0
```

`/_stcore/health` is Streamlit's built-in health endpoint — use it for
container, load balancer, and uptime-monitor health checks.

---

## 6. Configuration

All configuration is in `.streamlit/config.toml`, which **is** committed:

```toml
[server]
maxUploadSize = 100      # MB — matches the "up to 100MB" promise on the form

[theme]
base = "light"
```

`maxUploadSize` must stay aligned with three other things, or users get
inconsistent messages:

- the help text on the upload form (`app.py`)
- `MAX_UPLOAD_BYTES` in `core/validators.py` (the per-evidence-file criterion)
- `client_max_body_size` in the reverse proxy

If you raise one, raise all four.

There are **no environment variables and no secrets**. `.streamlit/secrets.toml`
is git-ignored as a precaution, but nothing reads it today.

---

## 7. Verifying the installation

Run all four checks. This is what a correct install looks like.

**1. Dependencies resolve**

```bash
pip check
```

**2. The test suite passes — 26 tests**

```bash
python -m pytest tests/ -q
# expected: 26 passed
```

**3. The app boots and serves**

```bash
streamlit run app.py --server.headless true --server.port 8501
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8501/
# expected: 200
```

**4. An end-to-end check works** — the only test that proves the whole thing:

- Open the app. The NSW-branded splash and masthead should render (if the page
  looks like unstyled HTML, the vendored stylesheet is not being read — check
  `static/vendor/`).
- Upload a real SmartyGrants EPAR PDF export.
- Paste a real Damage Information table into the text box.
- Press **Check application**. The Processing page should show the five-step
  checklist playing through, then land on the results page.
- Confirm the results page shows criteria grouped into six sections, the flag
  cards on the right, and that **Download feedback (PDF)** produces a readable
  report.

Keep a known-good PDF export and its matching table text as a **regression
sample**. It is the single most valuable operational asset for this system, and
it is not in the repository (correctly — it contains real applicant data). Store
it in NSWRA's own document management, and see `docs/MAINTENANCE.md` §4.

---

## 8. Troubleshooting installation

| Symptom | Cause | Fix |
| --- | --- | --- |
| `SyntaxError` mentioning `\|` on startup | Python 3.9 or older | Install Python 3.10+ and rebuild the virtual environment |
| Page loads unstyled, logos look wrong | `static/vendor/nsw-design-system-3.24.10.css` missing or unreadable | Confirm the file exists and the service account can read `static/` |
| Page loads then never updates; progress bar frozen | Reverse proxy is not upgrading WebSocket connections | Add the `Upgrade`/`Connection` headers from §3.3 |
| Upload fails on large PDFs with a 413 | `client_max_body_size` too small | Set it to at least 120M |
| Upload rejected by the app itself | Over `maxUploadSize` | Raise it in `.streamlit/config.toml` (and everything in §6) |
| Check takes minutes on a large application | The `Damage Information` / `Number of Damage Items` markers were not found, so the page-skipping optimisation fell back to reading every page | Confirm the export still uses those headings; see `core/pdf_extract.py` |
| `ModuleNotFoundError: core` when running tests | Running pytest from outside the repository root | `cd` to the repository root first |
| Tests fail with a `cryptography`/`cffi` error | Broken system Python packaging, not this project | Use a clean virtual environment, or `pip install --upgrade cffi` |
