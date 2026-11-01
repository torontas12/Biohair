# BioHair X — cPanel file delivery

## Exact website directory

**`cpanel/website/`** contains all 76 files of the completed website: HTML routes, CSS, JavaScript, supplied/approved image assets, research data, the two distinct form pages and `robots.txt`.

This directory is byte-identical to `/workspace/biohair-v2/website/` at delivery. `WEBSITE_SHA256.json` records every website file's SHA-256. No implementation was rebuilt or redesigned for this transfer.

The branch also includes:

- `serve.py`: the existing Python local HTTP server and form handlers.
- `test_forms.py`: 11 local backend tests using mocked delivery destinations.
- `.env.example`: empty configuration placeholders; no real credentials.
- `.htaccess.example`: optional Apache directory-listing and noindex headers, outside the website directory.
- `review-reports/`: existing QA, change log, visual differences and configuration/citation exceptions. Those historical reports refer to the separate local screenshot bundle; the screenshots and old large review ZIP are not needed to install the website files.

No PHP handlers exist in the completed implementation. No PHP conversion or replacement backend has been created during this delivery task.

## Download from GitHub

Select branch **`cpanel-final-delivery`** in `torontas12/Biohair`, choose **Code → Download ZIP**, then extract it. The web files are inside the extracted repository's **`cpanel/website/`** directory, not at the archive root. The repository's older review archive can be ignored for this installation.

## cPanel placement — instructions only, no deployment performed

1. Preserve the existing production document root and make a backup through the host's normal process. Do not overwrite production during owner review.
2. Use an isolated, non-production document root for review. Upload the **contents** of `cpanel/website/` to that root; `index.html`, `assets/`, the CSS/JS files, `find-my-treatment/`, and `physician-inquiry/` must remain siblings. No npm install or asset compilation is required.
3. Preserve directories, case and filenames. Do not upload `.env.example`, server code, tests, or review reports into the public document root. Keep future real configuration outside public files.
4. Keep the supplied `robots.txt` and HTML noindex metadata. The optional `.htaccess.example` can be reviewed and adapted to the isolated review document root if the host supports it; do not overwrite an existing `.htaccess` blindly. Noindex is not authentication or a security boundary: use the host's access controls for private review.
5. Check Home, Physicians, Blog, Clinical Research, Patient Contact and Physician Inquiry at desktop/tablet/mobile widths. Check assets, navigation, nested form routes and the light-blue footer. The two form routes directly display forms.

The browser form APIs use root-relative `/api/form-session`, `/api/forms/patient`, and `/api/forms/physician` paths. A backend-enabled installation must route those paths on the same origin to the approved form backend. Merely placing the static files in `public_html` does not provide these endpoints.

## Existing backend hosting requirement

The included `serve.py` uses only Python's standard library (tested with Python 3.12). From `cpanel/`, `python3 serve.py` starts a **loopback-only** HTTP server on port 8001 serving `website/` and the existing APIs. It is suitable for reproducing the local review. It is not a PHP script or a WSGI application that can simply be registered in cPanel's Python App screen.

Operational cPanel hosting therefore needs a host-supported supervised Python HTTP process plus same-origin reverse proxy routing and HTTPS, or a separately approved adaptation to the host's supported backend. Shared hosting may not support the required process/proxy arrangement. Confirm this with the hosting provider before enabling contact delivery. No backend port, proxy, public endpoint or production host was configured here.

If the host requires PHP-only form handlers, that is an outstanding compatibility task. It has intentionally not been implemented because this request prohibits rebuilding/repeating implementation.

## Current configuration and release status

The website is complete enough for local review but is **not cleared for operational production release**. Existing, documented requirements remain:

- `CALENDAR_URL`: one real HTTPS Google Calendar booking URL used by both forms.
- `PATIENT_FORM_DESTINATION`: real patient HTTPS submission webhook.
- `PHYSICIAN_FORM_DESTINATION`: different real physician HTTPS submission webhook, verified to reach the separate recipient.
- Approved operational privacy wording installed in the site, then `PRIVACY_POLICY_APPROVED=true` in the backend process environment. Approved Terms are also still needed.
- The two real destination hosts permitted by the backend environment/network policy, with any required authentication configured securely.
- Real end-to-end receipt and booking tests. The 11 mocked backend tests do not establish actual recipient delivery.
- Visual approval of the two proposed form layouts; missing complete Blog article bodies/archive pages; unresolved primary citation and clinical-claim review. See `review-reports/`.

Current form behavior intentionally reports unavailable delivery instead of pretending success. Both destination URLs, the shared booking URL and the approved-policy flag must be present before the included backend will forward either contact request. No medical questionnaire has been added.

Do not remove noindex protections, modify analytics, or deploy to production without the owner's separate final approval. This GitHub branch is file delivery only.

## Validate the delivered files

From `cpanel/`, use Python to compare website bytes against the manifest:

```bash
python3 - <<'PY'
from pathlib import Path
import hashlib, json
expected = json.loads(Path('WEBSITE_SHA256.json').read_text())
for name, digest in expected.items():
    assert hashlib.sha256((Path('website') / name).read_bytes()).hexdigest() == digest, name
print(f'All {len(expected)} website files match the delivery manifest.')
PY
python3 test_forms.py
```

No website source was changed during delivery. Existing QA evidence is included for review; no production delivery or publication is claimed.
