# V2 QA report

The separate local staging copy passes the implemented functional and layout checks. Visual approval, operational form delivery and complete citation verification remain outstanding. This is not an approved production release.

| Check | Result / evidence |
| --- | --- |
| Approved references | All seven PNGs decoded and visually reviewed; complete ZIP extracted. Controlling instructions match the original attachment byte for byte. |
| Full-page screenshots | 18 before and 18 after: Home, Physicians, Blog, Clinical Research, Patient Form and Physician Form at 1440, 768 and 375 pixels. See `screenshots/index.html`. |
| Primary page rendering | All 18 revised viewport/page combinations return HTTP 200; no horizontal document overflow, broken HTML images or JavaScript runtime errors. |
| Universal footer | All 22 HTML routes use identical footer markup. Background is `rgb(232, 243, 249)` (`#E8F3F9`); paragraph text is dark `rgb(49, 93, 122)`. Both form pages, Privacy, Terms, bibliography and legacy routes are included. |
| Links and assets | Static link/asset scan across all 22 HTML routes reports zero missing local targets. Shared navigation/footer paths resolve from both nested form directories. External publication URLs remain unverified because of network denials. |
| CTA routing | Header/footer and body Find My Treatment links reach the patient form directly. `order.html` is a direct patient form alias. Physician inquiry links reach the separate physician page. Legacy Science redirects to the research library; Journal redirects to Blog. |
| Mobile Home | Hero artwork hidden; editable top copy/CTA visible; requested science/process/contact/results/experts order present. The separate pill block was not present in the original source. |
| Mobile Physicians | Hero artwork and research sidebar hidden; Clinical Considerations retained; three colored cards each expose a complete introductory paragraph; independent Read More/Read Less state and visibility pass; patient CTA follows Tofacitinib and precedes opportunity section. |
| Library pagination | All 180 candidate IDs visited exactly once over 36 pages; five cards per page. Last-page, category counts, category-to-page-1 resets, verified-only filter and empty-search state pass. Category candidate counts: 4 / 81 / 19 / 76. |
| Accessible interactions | Explicit form labels, required fields, native email/phone validation, visible focus styles, live status feedback, independent toggle button semantics, keyboard Escape menu closure and current-page navigation are implemented. This is basic functional accessibility QA, not a comprehensive WCAG certification. |
| Form configuration behavior | Actual local browser submissions return HTTP 503 and an explicit “Nothing was sent” message while unconfigured. Patient has three basic contact fields plus acknowledgment; physician has exactly four fields. No questionnaire or health uploads. |
| Backend tests | 11 tests pass: input/schema validation, separate patient/physician adapters, origin/CSRF checks, expired/reused token rejection, rate limiting, payload limits, unsafe URL rejection, policy/configuration gates, delivery-failure feedback, noindex/security headers. Forwarding acceptance is tested using mocked recipients only. |
| Indexing / isolation | Every HTML route has noindex metadata and the local server sends `X-Robots-Tag: noindex, nofollow, noarchive`; robots disallows all crawling. Server binds only to loopback. No production deployment, push, publish, indexing enablement, or analytics changes occurred. |
| Original preservation | Repository status remains clean. Every original extracted archive file matches its original ZIP bytes. Original approved assets and raw citation files remain intact. |

Machine-readable evidence: `browser-qa.json`, `static-link-qa.json`, `pdf-citation-checks.json`, `backend-tests.txt`, and `website/research-data/v2-merge-audit.json`.

Issues found and corrected during QA: the research stylesheet had overridden footer paragraph contrast; legacy redirect and bibliography pages lacked shared chrome; inherited category-button layout wrapped counts incorrectly; earlier generic thumbnails did not match the approved reference artwork. The final captures include the corrections.

Unresolved requirements:

- Real calendar link, two real submission destinations, approved operational privacy wording, endpoint access/authentication and real end-to-end receipt/booking tests. None is claimed to work without those inputs.
- Visual approval of both form proposals. No definitive approved contact-form mockups were supplied.
- Full Blog article bodies/additional archive pages. The five supplied previews are retained with explicit staging notices; missing text is not invented.
- Live DOI/publication identity, evidence labels, OCR cleanup/deduplication and clinical-claim review. Five DOI strings were checked against the supplied PDFs, while primary web checks were proxy-denied. Candidate totals are not verified publication totals.
- Reference differences itemized in `VISUAL_COMPARISON.md`, including retained scientific/source copy, added source review notices and responsive typography. Pixel-perfect equivalence is not claimed.

Review the concrete screenshots and changes before authorizing any next release step. No external action is pending or scheduled.
