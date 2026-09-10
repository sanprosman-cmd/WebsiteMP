# maharaniprima-site

Static marketing website for **PT Maharani Prima** — an Indonesian EPCC (Engineering, Procurement, Construction & Commissioning) contractor serving the power, oil & gas and mining sectors. Plain HTML/CSS/JS: no framework, no bundler, no runtime dependencies. Content edits are HTML edits.

See `PRODUCT.md` for product truth and `DESIGN.md` for the visual system ("The Site Dossier").

## Quick start

Open `index.html` directly, or serve the folder:

```powershell
npx.cmd --yes serve .
```

Pages reference the generated `css/styles.min.css` and `js/main.min.js`. Edit the sources (`css/styles.css`, `js/main.js`), then rebuild (below).

## Structure

```
├── index.html               Home (video hero, stats, products, footprint map, CTA)
├── company.html             Legality, certifications, vendor registrations, mission
├── capabilities.html        5 capability lines with scrollspy
├── products.html            Product index (6 cards)
├── product-*.html           microgrid · powerpod · datacenter · fusionsolar · cloudseeding
├── projects.html            Project record, awards, documentation disciplines
├── contact.html             Inquiry form (the single conversion path)
├── thank-you.html           Post-submit confirmation (noindex, not in sitemap)
├── privacy.html terms.html  Legal pages
├── 404.html                 Static-host 404 (full nav included)
├── css/styles.css           Design system source → styles.min.css (generated)
├── js/main.js               Behavior source → main.min.js (generated)
├── tools/validate.js        Static-site integrity validator
├── assets/img/photos/       Photography: .webp served, .jpg masters kept
├── assets/mahatrax/         Mahatrax sub-brand assets + brochure PDF
├── sitemap.xml robots.txt site.webmanifest
└── .impeccable/             Detector config + design-system sidecar
```

## Configuration (required before launch)

All runtime config lives in **one place**: the `MP_CONFIG` block at the top of `js/main.js`.

```js
var GA_MEASUREMENT_ID = "";   // e.g. "G-AB12CD34EF" — GA4, consent-gated
var FORM_ENDPOINT     = "";   // e.g. "https://formspree.io/f/xxxxxxx"
```

- **GA4** loads only after the visitor clicks *Accept All* on the cookie banner; with an empty ID no analytics code ever runs. The banner is injected by JS on every page; *Cookie Settings* (footer button, `data-cookie-settings`) clears the stored choice and re-opens it.
- **Contact form** POSTs to `FORM_ENDPOINT` (Formspree-style: `FormData` + `Accept: application/json`, `_subject` set from company/name). On success → `thank-you.html`; on failure → the button re-enables and an error status is shown. **With an empty endpoint the form does not pretend to send** — it explains the situation and opens a prepared `mailto:` draft instead.
- After editing `main.js`, rebuild `main.min.js` (pages load the min file).

## Build & validation

```powershell
# Minify (esbuild; on PowerShell with script execution disabled use npx.cmd)
npx.cmd --yes esbuild css/styles.css --minify --outfile=css/styles.min.css --legal-comments=none
npx.cmd --yes esbuild js/main.js --minify --outfile=js/main.min.js --legal-comments=none --target=es2018

# Integrity check: file refs, anchors, JSON-LD, tag balance, SEO meta,
# generated .min freshness, sitemap lastmod drift (warn)
node tools/validate.js        # → "ALL CHECKS PASSED"
```

**Gate: `node tools/validate.js` must pass before any page edit is reported complete.** If it fails, fix the cause and run it again — do not lower or edit the validator to make it pass, and do not hand back a change with a red validator. If a failure genuinely can't be fixed in this edit, report it together with the validator's output.

`*.min.css` / `*.min.js` are generated — never hand-edit them (`.impeccable/config.json` also excludes them from the design detector). The validator now fails when either min file is missing or older than its source, so "I edited `styles.css`" without a rebuild is caught, not shipped.

## Version control

This folder is a git repository. Commit after the validator passes: `node tools/validate.js` → `git add -A` → `git commit`. Never push to a remote without being asked. `.gitignore` excludes `.qoder/` and the `tools/_*.png` verification screenshots.

## Asset pipeline

Served images are WebP (quality 78) and the hero video is a 720p H.264 encode (~0.6 MB, no audio, `+faststart`); JPG masters and the 1080p source are kept in the same folder for future re-encodes.

```powershell
# Re-encode hero video
ffmpeg -y -i assets\img\photos\hero-towers-1080.mp4 -vf scale=1280:-2 -c:v libx264 -crf 27 -preset medium -an -movflags +faststart assets\img\photos\hero-towers-720.mp4

# Regenerate a WebP from its master
ffmpeg -y -i assets\img\photos\<name>.jpg -c:v libwebp -quality 78 -compression_level 6 assets\img\photos\<name>.webp
```

When adding a photo: drop the JPG in `assets/img/photos/`, generate the WebP, and reference the `.webp` in HTML (content images need descriptive `alt`; decorative hero art gets `aria-hidden="true"` and `alt=""`).

## Hosting requirements

Any static host works. To keep the site's promises true:

- Map **404.html** as the not-found page (it carries full navigation).
- Serve over **HTTPS** and set the security headers `privacy.html` §9 claims: **CSP**, **HSTS**, **X-Frame-Options** (e.g. `_headers` / host config). If the host cannot set them, update privacy §9 instead.
- Suggested cache: long-lived immutable caching for `assets/`, short/no caching for HTML.
- `sitemap.xml` lists indexable pages only (`thank-you.html` is `noindex` and deliberately absent). Bump `<lastmod>` when content changes — the validator prints a `SITEMAP DRIFT` warning for any page whose file is newer than its entry.

## Conventions & gotchas

- **Canonical header/footer are duplicated across all 15 pages** (no templating). Changing nav, mega-menu icons, footer links or the legal bar means changing every page — keep the blocks byte-identical.
- **All files must be valid UTF-8.** A past mixed-encoding save smuggled Windows-1252 bytes into em-dashes site-wide and broke tooling; re-check encoding after bulk edits.
- The mission headline in `company.html` ("To be the world-class EPCC") is **verbatim company wording** — it carries an `impeccable-disable marketing-buzzword` waiver comment and must not be "improved".
- Two awards in `projects.html` have no documented year; their year cells are intentionally empty. Do not invent years.
- Form consent checkbox, `aria-live` status region and focus-first-invalid behavior are part of the form contract — preserve them when touching `contact.html` or the form handler.
- Analytics and the cookie banner live in a separate IIFE at the end of `main.js`; the consent key is `localStorage.cookie_consent`.
- **Some visuals are off-limits by default.** See *Protected Visuals* in `DESIGN.md` (MP logo asset, products nav dropdown behavior, hero video). Touch one only when asked, and run its one-line verify step afterwards.

## Verification checklist (before deploy)

1. `node tools/validate.js` → ALL CHECKS PASSED
2. Browser pass: header inversion at 32px scroll; mobile overlay nav (≤860px); mega menu on hover **and** keyboard focus; cookie banner Accept/Reject + Cookie Settings reset; contact form submit → thank-you (or honest mailto fallback when unconfigured); reduced-motion honored
3. Lighthouse spot-check on `index.html` (mobile) — hero video and WebP plates should keep LCP within budget
