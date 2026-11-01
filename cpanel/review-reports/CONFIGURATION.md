# Missing configuration and release requirements

The following names were checked in the running environment; none were set. No credentials or personal data were printed or copied into this handoff.

| Setting | Required value / behavior |
| --- | --- |
| `CALENDAR_URL` | The same real Google Calendar booking URL for both forms. The server accepts HTTPS links on `calendar.google.com` or `calendar.app.google`. No URL has been invented. |
| `PATIENT_FORM_DESTINATION` | An actual HTTPS POST webhook for patient contacts, independently routed to the patient recipient. |
| `PHYSICIAN_FORM_DESTINATION` | A different actual HTTPS POST webhook for physician inquiries, independently routed to the physician recipient. Identical endpoint strings are rejected. |
| `PRIVACY_POLICY_APPROVED` | Leave unset/false until the responsible entity approves and installs an operational privacy policy, handling, retention, recipients and relevant consent/disclosure. Only then set `true`. The currently supplied policy explicitly says it is pending review. |

`.env.example` declares empty placeholders. The server does **not** automatically load this file. Supply values securely in the process/environment settings, without committing credentials. Restart `python3 serve.py` afterward. Webhook URLs may contain credentials: do not put real values in screenshots, logs, reports, or chat.

Both real destination URLs, a valid shared calendar URL and the approved-policy flag are required before either form can send. These configuration changes do not authorize a deployment. The current instance remains local, noindex and unconfigured.

Each webhook must accept `Content-Type: application/json` and a body of the form `{"kind":"patient|physician","contact":{...}}`, return a 2xx only when it actually accepts the request, and handle routing, storage, retention and delivery securely. Patient fields are `full_name`, `email`, `phone`, `privacy_acknowledgment`; physician fields are `physician_name`, `clinic`, `email`, `phone`. Redirects are rejected. TLS verification stays enabled. If only recipient email addresses are available, an approved mail delivery transport is still needed; an email address is not a webhook endpoint.

Add the actual destination hostnames to the environment's HTTPS allowlist, and provision any needed endpoint authentication through the approved secure environment configuration. No production domain or webhook domain has been guessed. The two endpoints must be verified to reach different actual recipients; different URL strings alone do not prove this.

Before any later release, perform real end-to-end tests of patient receipt, physician receipt, error handling, spam controls and the shared booking link. Local mocked adapter tests are not delivery tests. The server currently binds to loopback HTTP for local review; HTTPS hosting, distributed abuse controls and a deployment-specific session strategy require a separate approved release task.

Other outstanding inputs:

- Visual approval of the two form proposals. Reference 07 is historical and is not an approved contact-form mockup; no definitive physician form mockup was supplied.
- Complete approved Blog article bodies and additional archive pages. Only five preview titles, dates and excerpts are present in reference 05.
- Approved operational Privacy Policy and Terms, source contact/business-entity confirmation, and required physician/photo/testimonial permissions.
- Clinical review of the label/carton discrepancies and unresolved citations in `CITATION_EXCEPTIONS.md`.
- Read-only primary publication verification currently needs allowlist access to `doi.org`, `api.crossref.org`, and `pubmed.ncbi.nlm.nih.gov`. Actual requests received proxy `403 Forbidden` tunnel denials. Publisher redirect destinations may need additional authorization after they are identified. No network policy was broadened or bypassed.

Do not push, publish, deploy, enable indexing, change analytics, or touch production while these items are under review. Owner approval remains required.
