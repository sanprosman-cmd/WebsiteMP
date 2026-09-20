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
├── insights.html            Insights index (numbered record rows; blog layer)
├── insight-*.html           Insight articles — template: insight-template.html
├── contact.html             Inquiry form (the single conversion path)
├── thank-you.html           Post-submit confirmation (noindex, not in sitemap)
├── privacy.html terms.html  Legal pages
├── 404.html                 Static-host 404 (full nav included)
├── css/styles.css           Design system source → styles.min.css (generated)
├── js/main.js               Behavior source → main.min.js (generated)
├── tools/validate.js        Static-site integrity validator
├── assets/img/photos/       Photography: .webp served, .jpg masters kept
├── assets/geo/              Natural Earth 1:50m coastlines + borders for the footprints globe
├── assets/mahatrax/         Mahatrax sub-brand assets + brochure PDF
├── sitemap.xml robots.txt feed.xml llms.txt site.webmanifest
├── vercel.json .vercelignore  Host headers + upload exclusions
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

## Insights articles (blog)

Insights is the SEO/AI-discovery layer: indexable long-form pages in the same dossier language, wired into every discovery channel a crawler or answer engine reads.

**The five files involved**

- `insights.html` — the index: one `.row-item` record per article (index number, date tag, title, one-line description).
- `insight-*.html` — articles. `insight-template.html` is the canonical starting point and carries the full step-by-step checklist in its header comment (it is deliberately absent from `sitemap.xml`).
- `feed.xml` — Atom feed, one `<entry>` per article; bump the feed-level `<updated>` too.
- `llms.txt` — plain-text site map for AI crawlers; add new articles to its *Pages* list.
- `sitemap.xml` — every indexable page.

**Adding an article (short version — the template header has the authoritative list)**

1. Copy `insight-template.html` → `insight-{slug}.html` and run the find/replace tokens at the top of the file (title, slug, category, dates, read time, summary, hero image).
2. Write the body inside `article.post-body`. Facts must trace to `PRODUCT.md` — no invented statistics, clients or testimonials.
3. Mirror any FAQ questions 1:1 in the `FAQPage` JSON-LD block.
4. Add the `.row-item` entry to `insights.html` (bump the index number, tag = publish date).
5. Add the `<entry>` to `feed.xml` and bump the feed `<updated>`.
6. Add the `<url>` block to `sitemap.xml` (`lastmod` = publish date).
7. Add the article to `llms.txt` *Pages*.
8. `node tools/validate.js` → ALL CHECKS PASSED.

**How discovery works**

- *Search engines:* semantic HTML (one `h1`, `<time>` elements, breadcrumbs), `BlogPosting` + `BreadcrumbList` + `FAQPage` JSON-LD, and the sitemap entry.
- *AI answer engines:* most never execute JavaScript, so the fully static pages are read as-is; `llms.txt` hands them a factual site map with the load-bearing stats, the Atom feed gives machine-readable updates, and the visible FAQ blocks make answers directly extractable.
- Keep `lastmod` truthful — the validator warns on sitemap drift.

## Version control

This folder is a git repository. Commit after the validator passes: `node tools/validate.js` → `git add -A` → `git commit`. Never push to a remote without being asked. `.gitignore` excludes `.qoder/` and the `tools/_*` scratch artifacts (verification screenshots, probes).

## Asset pipeline

Served images are WebP (quality 78) and the hero video is a 720p H.264 encode (~0.6 MB, no audio, `+faststart`); JPG masters and the 1080p source are kept in the same folder for future re-encodes.

```powershell
# Re-encode hero video
ffmpeg -y -i assets\img\photos\hero-towers-1080.mp4 -vf scale=1280:-2 -c:v libx264 -crf 27 -preset medium -an -movflags +faststart assets\img\photos\hero-towers-720.mp4

# Regenerate a WebP from its master
ffmpeg -y -i assets\img\photos\<name>.jpg -c:v libwebp -quality 78 -compression_level 6 assets\img\photos\<name>.webp
```

When adding a photo: drop the JPG in `assets/img/photos/`, generate the WebP, and reference the `.webp` in HTML (content images need descriptive `alt`; decorative hero art gets `aria-hidden="true"` and `alt=""`).

### Globe geometry

`assets/geo/earth-50m.js` is **Natural Earth 1:50m land and admin-0 boundaries (public domain)**, reduced offline by `tools/_geo/build-earth.js` from the `world-atlas` TopoJSON and lazy-injected by the footprints plate on `index.html` as a classic script assigning `window.EARTH_50M` — a script tag loads served *and* straight from disk (`file://`), where a `fetch()` of the payload is blocked by the browser. One-time offline conversion (`world-atlas` + `topojson-client` in a scratch folder, never a runtime dependency); re-run it only to change the vertex budget, the precision or the focus region.

Shape: `{ land, idn, border }`, each an array of `[cap, rings]`. `rings` is `[ring][lng, lat]` at 2-decimal precision; `cap` is `[sinLat0, cosLat0, lng0, -sin(rho)]`, the bounding sphere the renderer tests before projecting a polygon; the build audits that cull at 60 view centres across the reachable globe and refuses to write if any of them would visibly drop a polygon — rotation is free, so any view can be parked. `idn` is Indonesia (ISO 3166-1 numeric 360) split out so it can be drawn brighter than its neighbours; `border` is the *interior* mesh only, so a shared edge appears once and coastlines are not traced twice.

Why not 110m, which is what shipped first: at 125 polygons the archipelago this whole section is about collapses into blobs, and a marker on a blob tells nobody where the project is. Why not raw 50m either: 60,629 vertices cost 8.92 ms of projection trig per frame, over half a 16.7 ms budget before anything is rasterised, and land is traced twice. So the coastline is Douglas–Peucker simplified against a vertex budget (19,000 land, 11,000 borders) with three times the fidelity inside a focus box around the archipelago, and polygons over the horizon are culled by their bounding cap — audited at 60 view centres spanning every pose free rotation can reach, where the worst centre still keeps 25% of its land polygons to trace, a smaller saving than it sounds because a bounding cap has to stay conservative. Net ~176 KB gzipped, injected once the plate scrolls into view, against a hero video of 1.5 MB. `build-earth.js` checks at every one of those centres that culling never drops a polygon with a vertex on the near side, and refuses to write the file if it does. It also reads the `SITES` markers straight out of `js/main.js` — never a second copy, which would go stale and keep passing — and asserts that simplification has not moved a coastline under any of them by more than a quarter of a rendered pixel (worst case today: 0.059 px). Two points with known answers guard the containment test itself, in both directions.

Judge marker placement in rendered pixels, not decimal degrees. The plate draws roughly 28 km per pixel, so Surabaya at 1.3 km off Java's north coast in the source is a thirtieth of a pixel from the drawn coastline and looks exactly on it. An exact point-in-polygon test reports five markers "in open water" — Surabaya, Gresik, Tidore and two that really are offshore, Karimun Jawa 88 km into the Java Sea and Matindok 29 km out — and three of those five are invisible at the rendered scale. Two markers sitting visibly clear of the coast is correct: some of the work is offshore.

If the script fails the plate still draws its graticule, island names and site markers — the names are copy in `js/main.js`, not geometry, so they never depend on it.

## Hosting requirements

Any static host works. To keep the site's promises true:

- Map **404.html** as the not-found page (it carries full navigation). Vercel does this automatically for static projects.
- Serve over **HTTPS** and set the security headers `privacy.html` §9 claims: **CSP**, **HSTS**, **X-Frame-Options**. On the current host these come from the committed **`vercel.json`** (HSTS is Vercel's default on production domains). If a host cannot set them, update privacy §9 instead of leaving the claim unbacked.
- Do not add long-lived `immutable` caching for `assets/` — favicons and photographs are replaced *in place* (behind the `?v=` stamp or the same filename), so revalidation beats a stale immutable copy.
- `.vercelignore` keeps `tools/`, `.qoder/` and `.impeccable/` out of every upload — tooling and scratch artifacts must never be publicly served.
- `sitemap.xml` lists indexable pages only (`thank-you.html` is `noindex` and deliberately absent, as is `insight-template.html` — the authoring template). Bump `<lastmod>` when content changes — the validator prints a `SITEMAP DRIFT` warning for any page whose file is newer than its entry.

### Deploy (Vercel)

Production is the Vercel project **website-mp** (account scope `mp-916e`); `maharaniprima.com` is the custom domain and `website-mp-rho.vercel.app` the project URL. First deploy from a fresh clone:

```powershell
npx.cmd --yes vercel link --yes --project website-mp
npx.cmd --yes vercel --prod
```

`vercel.json` and the deployed files are read from the working directory, so deploy after the validator passes and the commit is in. Then confirm the headers actually shipped:

```powershell
curl.exe -sI https://maharaniprima.com/ | Select-String -Pattern "content-security|x-frame"
```

## Conventions & gotchas

- **Canonical header/footer are duplicated across all 23 pages** (no templating). Changing nav, mega-menu icons, footer links or the legal bar means changing every page — keep the blocks byte-identical.
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
