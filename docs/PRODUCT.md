# Product

<!-- impeccable:product-schema 1 -->
<!-- Provenance: derived from repository evidence (site copy, license tables, project records, award list) — no product interview was run. Items marked [inferred] need owner confirmation. -->

## Platform

web

## Users

Primary: procurement leads, project managers and engineering counterparts at Indonesian energy, oil & gas and mining operators (PLN, Pertamina group, PGN/PGAS, SKK Migas-registered operators, IPPs, mining owners) who must **qualify an EPCC contractor** before inviting tenders — checking licenses, ISO certifications, sector track record and safety history, then starting a conversation.

Secondary: partners and vendors evaluating delivery capability; job-seekers and auditors reading credentials. [inferred]

## Product Purpose

The website is the company's qualification packet and inquiry channel: it proves PT Maharani Prima is a fully licensed, ISO-certified EPCC contractor with delivered projects across power, oil & gas and mining, and converts that proof into inquiries (Get a Quote → contact form → team inbox). Success = a evaluator finds verifiable proof fast and submits an inquiry with confidence.

## Positioning

A fully licensed Indonesian EPCC contractor that delivers **partner technology as a working plant** — Huawei and Selerys hardware wrapped in the civil, electrical, commissioning and O&M scope that makes it produce, single-source. Proof a neighboring contractor could not truthfully copy: 220 wellpads in the Rokan Block, 550 km of HV/MV transmission energized, 9 power plants commissioned, 130 km of pipelines, 5,402,696 safe man-hours without lost injury, 3.6M m³ of earth moved, and vendor registrations with PLN, Indonesia Power, PJB, Pertamina, PGAS Solution, SKK Migas, Wijaya Karya and Brantas Abipraya.

## Operating Context

- Company: PT Maharani Prima, established 6 February 2012. HQ: CIBIS Nine Business Park, 11th Floor, Jl. TB Simatupang No.2, Cilandak Timur, Jakarta Selatan 12560. admin@maharaniprima.com · +62 812 2247 0240.
- Mission (verbatim, do not rewrite): "To be the world-class EPCC — delivering world-class standards of project planning, management and execution for our clients."
- Tagline: "On Schedule. On Budget. On Quality. On Safety."
- Capability lines: Mining & Hauling · Wellpad & Earth Works · Surface Facility · HV & MV Transmission · Power Plant.
- Product lines: Huawei Microgrid Solution, Huawei Power POD Truck, Huawei Data Center Facility (prefabricated modules), Huawei Fusion Solar (smart PV), Selerys LAICO™ SOBLI cloud seeding, and the company's own Mahatrax mining intelligence platform (mahatrax.com).
- Licenses: SBUJK, SBUJPTL, SKUP Migas, EBTKE. Certifications: ISO 9001, 14001, 45001, 37001.
- Project footprint spans Sumatra, Java, Kalimantan, Sulawesi, Maluku, Nusa Tenggara and Bali (29 documented site locations).
- Awards: CSM Awards PMO 2018 & 2019 (PT Perusahaan Gas Negara Tbk), Kontraktor Terbaik 2018 high-risk EPC (PT PGAS Solution), HSSE Achievement 5,402,696 safe man-hours (PT Pertamina Gas), SIFO 200 Days (PT Perta Drilling Contractor). Two awards have no documented year — displayed without one rather than guessed.
- As-built documentation maintained across four disciplines: Power Plant; HV & MV Transmission Line; Earthwork & Civil; Mechanical Electrical Piping & Instrument.

## Capabilities and Constraints

- Static site: plain HTML/CSS/JS, no framework, no build step required to edit content. `css/styles.min.css` and `js/main.min.js` are generated (esbuild) and must never be hand-edited.
- Single configuration point `MP_CONFIG` at the top of `js/main.js`: `GA_MEASUREMENT_ID` (GA4, consent-gated — loads only after explicit Accept) and `FORM_ENDPOINT` (Formspree-style hosted form). **Both are intentionally empty until the owner supplies real values** — open decision. With no endpoint the form honestly falls back to a prepared mailto draft instead of pretending to send.
- All copy must be factual: no invented statistics, clients, testimonials or project claims. Indonesian-language award and certificate names are preserved verbatim.
- Canonical header/footer markup is duplicated across all 23 HTML files by design (no templating — 21 served pages plus the two authoring templates) — changes must be applied to every file.
- Files must stay valid UTF-8 (a past mixed-encoding save corrupted em-dashes site-wide).

## Brand Commitments

- Name: PT Maharani Prima. Logo: `assets/img/logo-transparent.png` (navy wordmark with red/green slashes on a transparent, padding-cropped canvas; rendered white over the dark hero via CSS filter, natural when the header inverts). The white-background master is kept at `assets/img/New logo.png`.
- Typeface: D-DIN (400/700), self-hosted woff2 — the only family in use.
- Voice: institutional, evidence-led, understated; uppercase tracked headings as stamps, sentence-case body as the human voice. Em-dashes are part of the established copy rhythm.
- Own sub-brand: Mahatrax (mining Fleet Management System, separate site + brochure PDF in `assets/mahatrax/`).
- Partner marks: Huawei, Selerys — referenced as technology partners, never as endorsers.

## Evidence on Hand

- Real project list with clients, locations and scopes (`projects.html` + site notes in `js/main.js`).
- License/certification tables and vendor registrations (`company.html`).
- Award records with issuers (`projects.html`); two without years (left blank).
- Photography library in `assets/img/photos/` (WebP served, JPG masters kept): 18 named plates plus the nine-plate numbered project deck (1–3, 5–10 — plate 4 was a byte-duplicate of 5 and is deleted), hero poster frames and the hero video encodes. Mahatrax brochure PDF and SVG hero art.
- **Absences future work must not fabricate:** client testimonials, named case-study write-ups beyond the project list, pricing/rate cards, team bios or photos, office imagery, and years for the two undated awards.

## Product Principles

1. **Proof before prose.** Every claim traces to a license, certificate, award, client, project or photograph on hand.
2. **One conversion path.** Every page funnels toward Contact / Get a Quote; the form never pretends to send.
3. **Technology delivered, not dropped.** Partner hardware is always sold with its EPCC wrap — scope tables belong to every product story.
4. **The safety record is the headline credential.** Safe man-hours and HSSE awards are evidence, not decoration.
5. **Static, fast, dependency-free.** Content edits are HTML edits; generated assets stay generated.

## Accessibility & Inclusion

WCAG 2.2 AA-oriented implementation: skip link, visible `:focus-visible` outlines (currentColor, 2px), 44px+ tap targets on interactive controls, `aria-expanded`/`aria-haspopup` navigation states, `aria-live` form status with `aria-invalid` fields and focus-first-invalid, decorative hero art marked `aria-hidden` with empty alt while content images carry descriptive alts, full `prefers-reduced-motion` honoring (reveals, parallax, ticker, cursor ring, magnetic buttons all gated), and analytics strictly behind an explicit consent banner with a persistent "Cookie Settings" control. Audience is bilingual (English site, Indonesian legal/award terms preserved).
