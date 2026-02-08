# Test Repository

This repo contains sample automation demos in Python and GAS.

See `SAMPLES.md` for details.

## Browser demo (PDF upload)

`demo.html` is a browser-only demo that extracts invoice fields from a PDF
using PDF.js. It does not upload files to a server.

### GitHub Pages

1. Enable GitHub Pages (Deploy from branch / root).
2. Open `https://<user>.github.io/<repo>/demo.html`.

### If PDF.js is blocked

Some networks block external libraries. You can host PDF.js locally:

1. Download `pdf.min.js` and `pdf.worker.min.js` (UMD build).
2. Place them in `vendor/` at the repo root.
3. Access `demo.html` again.

Suggested source (works with this demo):
- https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js
- https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js
