# BioHair X — cPanel delivery branch

The completed local website files are in **[`cpanel/website/`](cpanel/website/)**. Start with **[`cpanel/DEPLOYMENT.md`](cpanel/DEPLOYMENT.md)** for cPanel file placement and current release requirements.

This branch delivers the existing implementation without rebuilding or redesigning it. The website directory is byte-identical to the completed local working copy. Existing production/review branches are not changed. No production deployment is performed.

The existing forms use the included Python handlers in `cpanel/serve.py`; there are **no PHP handlers**. Plain cPanel/Apache file upload serves the pages but does not run the form API. Real booking/delivery configuration, approved privacy wording and appropriate backend hosting are still required. Noindex protections remain in place pending owner approval.

## Original source archive

This repository branch transfers a review archive. It does not deploy the website.

[Download the complete website review ZIP](https://github.com/torontas12/Biohair/raw/refs/heads/website-review/BioHairX-Complete-Website-Review.zip)

The ZIP contains one integrated website: homepage, For Physicians, Research & Clinical Evidence, supporting pages and assets. It also includes full-page desktop/mobile screenshots, approved references, original research materials, bibliography audit and review notes. Extract it and start with `START_HERE.md`. The actual site starts at `website/index.html`.

The inquiry form is a disabled preview. Bibliography verification is partial and recorded per reference. A three-versus-four ingredient discrepancy between the supplied label and carton is documented. Nothing has been deployed; publication still requires explicit sign-off.

The adjacent `.sha256` file records the archive checksum.
