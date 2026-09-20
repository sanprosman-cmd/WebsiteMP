# System Design & Infrastructure

The reusable architecture of this site, distilled for porting to another company project. The full contracts live in `DESIGN.md` (visual system), `PRODUCT.md` (product truth), and `INFRASTRUCTURE.md` (operational manual); this file explains *how the system is put together* and *what transfers*.

## 1. Architecture principles

- **Flat static HTML.** No framework, no CMS, no runtime dependencies, no client-side routing. Every page is a self-contained `.html` file a crawler or answer engine can read as-is.
- **Content edits are HTML edits.** Anyone can maintain the site with a text editor. This constraint is a feature: it forces honest, inspectable markup and keeps hosting trivial.
- **One configuration point.** All runtime config lives in a single `MP_CONFIG` block at the top of `js/main.js` (analytics ID + form endpoint). Nothing else to configure.
- **Duplicated chrome by design.** Header and footer markup are copied byte-identically into every page (no templating). A validator enforces integrity; a search-and-replace across files applies chrome changes.
- **Honest behavior.** The contact form never pretends to send: with no endpoint configured it explains the situation and opens a prepared `mailto:` draft. Analytics run only after an explicit cookie-consent click, and a persistent "Cookie Settings" control can revoke it.
- **Valid UTF-8 everywhere.** Mixed-encoding saves have corrupted copy site-wide before; re-check encoding after any bulk edit.

## 2. Content architecture

Listing → detail pattern everywhere; new sections copy an existing one rather than inventing a new pattern:

| Layer | Listing | Detail pages | Authoring template |
|---|---|---|---|
| Products | `products.html` | `product-*.html` | — |
| Careers | `careers.html` | `career-*.html` | `career-template.html` |
| Insights (blog/SEO) | `insights.html` | `insight-*.html` | `insight-template.html` |

- `404.html` carries full navigation (works on any static host).
- `thank-you.html` is `noindex` and deliberately absent from `sitemap.xml`; both authoring templates are too.
- The photo deck, filter bar and globe are data-driven from arrays in `js/main.js` / markup attributes — content changes don't require JS changes.

## 3. Design system (summary)

- **One typeface**, self-hosted woff2 (D-DIN 400/700). Two weights, one voice.
- **Achromatic interface.** The UI carries no hue: black canvas `#000000`, cream inversion for the header, hairline rules. Color enters only through photography and the error red.
- **Alternating bands** (`band--dark` / light) with `.on-dark` scoped styling; every hero is dark.
- **Reduced-motion honored** everywhere: reveals, parallax, tickers and cursor effects are all gated behind `prefers-reduced-motion`.
- Full contract, tokens, components and the protected-visuals list: see `DESIGN.md`. Machine-readable sidecar: `design-system.json`.

## 4. Asset pipeline

- **Images:** WebP quality 78, 1600px on the long edge, served to `<picture>`/`img`; JPG masters kept alongside for future re-encodes.
  `ffmpeg -y -i <name>.jpg -c:v libwebp -quality 78 -compression_level 6 <name>.webp`
- **Video:** hero is 720p H.264 (~0.6 MB, no audio, `+faststart`); the 1080p master is kept in the same folder.
  `ffmpeg -y -i hero-1080.mp4 -vf scale=1280:-2 -c:v libx264 -crf 27 -preset medium -an -movflags +faststart hero-720.mp4`
- **Map/globe geometry:** a one-time offline conversion (Natural Earth 1:50m TopoJSON → reduced payload via `tools/_geo/build-earth.js`) produces a lazily-injected classic script (`window.EARTH_50M`) that works from both http and `file://`. Culling is audited at 60 view centers before the file is allowed to be written. Never a runtime dependency.
- **Favicons:** two PNGs behind a `?v=` cache-bust — 64px `favicon.png` and 180px `apple-touch-icon.png` — regenerated from one geometry by a small GDI+ script; `favicon.svg` is kept on disk as the unreferenced vector master. **Any favicon file change must bump the `?v=` stamp across every page and the manifest**, or browsers keep serving the cached old icon.

## 5. Build & validation gates

```powershell
# Minify (esbuild; never hand-edit the .min outputs)
esbuild css/styles.css --minify --legal-comments=none --outfile css/styles.min.css
esbuild js/main.js --bundle --minify --legal-comments=none --target=es2018 --format=iife --outfile js/main.min.js

# Integrity gate — must pass before any edit is reported done
node tools/validate.js
```

The validator checks: internal file references (after stripping `?query` and `#fragment`), anchors, JSON-LD validity, tag balance, SEO meta presence, **min-file freshness** (fails when a `.min` output is missing or older than its source), and warns on **sitemap `lastmod` drift**. It reads raw markup including comments — template placeholders inside comments can produce false positives; verify before "fixing".

## 6. SEO & AI-engine discovery layer

Every page: unique `<title>`, meta description, canonical URL, OpenGraph tags, JSON-LD. Discovery channels maintained by hand:

- `sitemap.xml` — indexable pages only; `<lastmod>` kept truthful (validator warns on drift).
- `robots.txt` — allows all except the `*-template.html` authoring scaffolds, points at the sitemap.
- `feed.xml` — Atom feed; feed-level `<updated>` bumped with each article.
- `llms.txt` — plain-text factual site map for AI answer engines (which mostly don't execute JS): the pages, the load-bearing stats, the contact facts.
- Insights articles carry `BlogPosting` + `BreadcrumbList` + `FAQPage` JSON-LD, and any FAQ question is mirrored 1:1 between the visible block and the JSON-LD.

## 7. Security & hosting posture

- Headers are the **host's job** (CSP, HSTS, X-Frame-Options) — the privacy page's §9 promises them; if a host can't set them, the privacy page must change, not the promise.
- HTTPS required; `404.html` mapped as the not-found page; long-lived immutable caching for `assets/`, short/no caching for HTML.
- No cookies beyond the consent record (`localStorage.cookie_consent`); GA4 loads strictly behind the Accept click.

## 8. Porting checklist (to another company project)

1. **Replace brand truth:** new `PRODUCT.md` written from the new company's real evidence (licenses, certifications, projects, absences-that-must-not-be-fabricated). No copy exists until it traces to evidence.
2. **Replace visual identity:** logo assets, favicon set (regenerate + bump `?v=`), brand colors/tokens in `css/styles.css`, typeface if it differs.
3. **Rewrite page copy** against the new `PRODUCT.md`; keep the band/hairline/uppercase-stamp language or deliberately redesign it.
4. **Rebuild the page inventory** from the templates; update `sitemap.xml`, `llms.txt`, `feed.xml`, `robots.txt` and the footer legal bar.
5. **Keep the machinery as-is:** validator, esbuild pipeline, asset conventions, discovery layer, consent-gated analytics. Update `MP_CONFIG` with the new analytics ID and form endpoint.
6. **Re-verify:** `node tools/validate.js` → ALL CHECKS PASSED, then the manual browser checklist in `INFRASTRUCTURE.md`.
