---
name: PT Maharani Prima
description: EPCC contractor — the site dossier: black canvas, hairline-ruled records, stamped D-DIN type, photographic evidence.
colors:
  night: "#000000"
  night-soft: "#0a0a0a"
  paper: "#ffffff"
  cool-paper: "#f0f0fa"
  hairline-dark: "#3a3a3f"
  hairline-light: "#e0e0e8"
  on-primary: "#ffffff"
  on-primary-mute: "#f0f0fa"
  ink: "#000000"
  ink-mute: "#5a5a5f"
  on-dark-mute: "#a8a29a"
  on-hero-mute: "#e6e2da"
  signal-red: "#ff6b6b"
typography:
  display:
    fontFamily: "D-DIN, Arial Narrow, Arial, Verdana, sans-serif"
    fontSize: "clamp(40px, 6.2vw, 80px)"
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: "1.6px"
  headline:
    fontFamily: "D-DIN, Arial Narrow, Arial, Verdana, sans-serif"
    fontSize: "clamp(34px, 4.8vw, 60px)"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "1.2px"
  title:
    fontFamily: "D-DIN, Arial Narrow, Arial, Verdana, sans-serif"
    fontSize: "clamp(28px, 3.6vw, 48px)"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "0.96px"
  body:
    fontFamily: "D-DIN, Arial Narrow, Arial, Verdana, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0.32px"
  lead:
    fontFamily: "D-DIN, Arial Narrow, Arial, Verdana, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: "D-DIN, Arial Narrow, Arial, Verdana, sans-serif"
    fontSize: "13px"
    fontWeight: 700
    lineHeight: 0.94
    letterSpacing: "1.17px"
  micro:
    fontFamily: "D-DIN, Arial Narrow, Arial, Verdana, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 2
    letterSpacing: "0.96px"
  scale:
    # Enumerated component & display steps beyond the seven text roles above.
    # Fluid component scales are listed by their fixed endpoints (min/max).
    legal-micro: "10px"
    tag-micro: "11px"
    ui-sm: "14px"
    ui-md: "15px"
    card-title: "17px"
    card-title-fluid-min: "19px"
    subhead: "20px"
    card-title-fluid-max: "26px"
    display-sm-min: "30px"
    stat-min: "44px"
    display-sm-max: "52px"
    stat-max: "88px"
    stat-giant-max: "120px"
rounded:
  xs: "4px"
  sm: "8px"
  md: "16px"
  pill: "32px"
spacing:
  xxs: "4px"
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "18px"
  xl: "24px"
  xxl: "32px"
  huge: "48px"
components:
  button-ghost-dark:
    backgroundColor: "transparent"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.pill}"
    padding: "18px 24px"
    height: "50px"
  button-ghost-dark-hover:
    backgroundColor: "{colors.on-primary}"
    textColor: "{colors.night}"
  button-ghost-light:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "18px 24px"
    height: "50px"
  button-ghost-light-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  button-fill:
    backgroundColor: "{colors.cool-paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "18px 24px"
    height: "50px"
  chip:
    backgroundColor: "transparent"
    textColor: "rgba(255,255,255,0.75)"
    rounded: "{rounded.pill}"
    padding: "8px 14px"
  card-dark:
    backgroundColor: "{colors.night-soft}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.sm}"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xs}"
    padding: "12px 16px"
    height: "44px"
  cookie-button-primary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "12px 24px"
    height: "44px"
---

# Design System: PT Maharani Prima

<!-- Provenance: scan-mode extraction from css/styles.css and the page markup. Qualitative language (North Star, named rules) was derived from the incumbent implementation, not chosen in a workshop — refine freely. -->

## Overview

**Creative North Star: "The Site Dossier"**

The website reads like a field dossier kept by an EPCC contractor: full-bleed photographic plates as evidence, hairline-ruled records for licenses, awards and scopes, and uppercase tracked D-DIN headings that land like stamps on a document. Nothing decorates. The canvas is black (`#000000`) and the type is white; the only warmth enters through photography, which is treated as evidence plates rather than decoration — dimmed behind scrims, desaturated slightly, always subordinate to the record being made.

Density is institutional: generous band padding (`clamp(64px, 10vw, 128px)`) holds sparse, deliberate content; tables and chip rows carry the facts. Depth is earned, never ambient: every surface is flat at rest and structured by 1px hairlines; shadow and lift appear only as a response to hover, and dark cards add a faint `rotateX` tilt, like a document being picked up off a desk. Motion is procedural — scroll reveals with per-item stagger, a fact ticker, parallax on photo plates, a cursor ring on fine pointers — and every bit of it bows to `prefers-reduced-motion`.

**Key Characteristics:**
- Achromatic UI; photography carries all hue
- Hairline-ruled structure instead of resting shadows
- One typeface (D-DIN 400/700); hierarchy via weight, case, tracking and clamp() size
- Ghost pills that invert-fill on hover
- Flat at rest, lifted and slightly tilted on state
- Header inverts from transparent-white over the hero to cream paper + ink after 32px of scroll
- Full-bleed heroes with scrims; content anchored bottom-left

## Colors

A pure black-and-white record palette: the interface itself never carries hue — photography and one error red are the only chroma on the site.

### Primary
- **Site Night** (`#000000`, `--canvas-night`): the page canvas and the brand's ground color; body background, dark bands, footer.
- **Record Ink** (`#000000`, `--ink`): text and focus outlines on light surfaces — the same black, playing the opposite role.
- **Paper** (`#ffffff`, `--paper` / `--on-primary`): all text, icons and hairline highlights on dark grounds; form fields' background.

### Neutral
- **Night Soft** (`#0a0a0a`, `--canvas-night-soft`): raised dark surfaces (cards, mega menu, cookie banner sit at `rgba(0,0,0,.97)`–`rgba(10,10,10,.98)`).
- **Cool Paper** (`#f0f0fa`, `--canvas-cool`): light-band background and the filled button variant.
- **Hairline Dark** (`#3a3a3f`): 1px borders, table rules and dividers on dark grounds.
- **Hairline Light** (`#e0e0e8`): the same on light grounds; also input borders.
- **Ink Mute** (`#5a5a5f`): eyebrows, captions and card body copy on paper grounds only. It measures 2.8:1 against the dark bands and must never be set there.
- **On Dark Mute** (`#a8a29a`, `--on-dark-mute`): eyebrows and captions on every flat dark ground (night bands, footer) — 7.7:1, warm rather than neutral so it stays subordinate to the white headings above it.
- **On Hero Mute** (`#e6e2da`, `--on-hero-mute`): the same two roles over photography (`.hero--photo`), where the scrim absorbs part of the glyph.
- White at fixed opacities (`.75 / .66 / .65 / .6 / .58 / .55`) is the mute-scale on dark grounds for everything that is not an eyebrow or caption. `.5` is the floor over pure or near-black grounds; `.45` survives only on the breadcrumb separator, which is a glyph, not copy.

### Tertiary
- **Signal Red** (`#ff6b6b`): form error text only. The single chromatic exception in the UI.

### Named Rules
**The Achromatic Rule.** The interface carries no hue. Black, white, greys and white-at-opacity structure everything; color enters only through photography and the error red. If a component needs an accent, it needs a written reason.

**The Opacity Ladder Rule.** On dark grounds, emphasis is white at 100 → 75 → 66 → 58 → 55%. Reach for the ladder before reaching for a new color. Below `.5`, 12px type stops clearing 4.5:1 and the rung belongs to separators and icons, never to copy.

**The Ground Rule.** Muted text is chosen by the ground beneath it, not by the role alone. `--ink-mute` belongs to paper, `--on-dark-mute` to the flat dark bands, `--on-hero-mute` to photography. Every eyebrow and caption in the live document sits on a dark ground, so the dark values are the ones that actually ship — a role colour that is only ever correct on paper is a defect waiting to happen.

## Typography

**Display Font:** D-DIN (with Arial Narrow, Arial, Verdana fallbacks) — self-hosted woff2, weights 400/700, `font-display: swap`, both weights preloaded.
**Body Font:** D-DIN (same stack).
**Label/Mono Font:** none — D-DIN uppercase does label duty.

**Character:** An industrial DIN face used like document type: wide-tracked uppercase for institutional voice, plain sentence case for the human voice. Two weights, no italics — hierarchy is built from weight, case, tracking and fluid size, never from a second family.

### Hierarchy
- **Display** (700, `clamp(40px, 6.2vw, 80px)`, lh 0.95, +1.6px, uppercase): hero H1s only; max-width ~14ch.
- **Headline** (700, `clamp(34px, 4.8vw, 60px)`, lh 1.2, +1.2px, uppercase): section statements and CTA bands; max-width ~22ch.
- **Title** (700, `clamp(28px, 3.6vw, 48px)`, lh 1.25, +0.96px, uppercase): subsection headings.
- **Body** (400, 16px, lh 1.5, +0.32px): default text; measure capped at 62ch.
- **Lead** (400, 16px, lh 1.7): intros under headings, muted (`--on-primary-mute` on dark); max-width ~52–56ch.
- **Label** (700, 13px, lh 0.94, +1.17px, uppercase): buttons, nav, card actions.
- **Micro** (400, 12px, lh 2, +0.96px, uppercase): eyebrows, breadcrumbs, table headers, scroll cue. Ground-coloured — `--on-hero-mute` over photography, `--on-dark-mute` on the flat dark bands, `--ink-mute` on paper.

### Component & display scale
Beyond the seven text roles, the sheet uses a set of intentional component steps — enumerated in the frontmatter `typography.scale` so the ramp stays complete:
- **Stat display** — impact/stat numbers on fluid clamps: `clamp(44px, 6vw, 88px)` (`.impact-cell__value`) and `clamp(60px, 8vw, 120px)` for the largest single figure.
- **Display (small)** — `clamp(30px, 3.4vw, 52px)` for sub-hero and section statements that sit below the headline role.
- **Card title** — `clamp(19px, 2vw, 26px)` plus literal 17px / 20px for card and panel headings.
- **UI steps** — 15px nav and secondary body, 14px mega-menu and card meta, 11px tags, 10px the smallest legal/footnote caps.

These are real steps of the incumbent system, not drift: the stat numbers are deliberately dramatic against the 16px body, and the small caps are deliberately tight. They are documented rather than forced onto the text ramp.

### Named Rules
**The Stamp Rule.** Uppercase + positive tracking marks the institutional voice (headings, buttons, chips, eyebrows). Sentence case is the human voice (body, leads, table cells). Never mix the two inside one element.

**The One Family Rule.** D-DIN does everything. If a design seems to need another typeface, it needs a different weight, case or tracking instead.

## Layout

A band-stacked document: every section is a full-bleed `.band` (`--dark` `#0d0d11`/black, `--soft` night-soft, `--light` cool-paper) separated by 1px `hairline-t` rules, with content in a `.col` (max 1200px, 32px inline padding); header and hero content widen to 1440px. Vertical rhythm is `pad-y: clamp(64px, 10vw, 128px)`. The fixed header floats transparent over the hero and inverts to cream (`rgba(248,245,239,.95)`) + ink after 32px of scroll; its height is derived from the brand mark (`--header-h: calc(var(--brand-h) + 24px)`, so 80px on phones rising to 104px at ≥1143px) and the hero content's top padding is `calc(var(--header-h) + 24px)`, which keeps hero copy from ever sliding under the bar when a section grows past its `min-height`. Heroes are 100svh (home, with video) or 68svh sub-heroes (52svh `hero--short` on utility pages), content anchored bottom-left over a scrim graded `.66 → .34 → .72 → .94` top to bottom — heaviest where the header floats and where the copy sits, airiest in the middle so the photography still reads. Two-column `split` grids (often reversed) pair a statement column with an evidence column. Breakpoints: 860px (nav → full-screen overlay, grids → 2col), 760px (sub-hero art dims to 40%), 720px (impact grid → 1col), 640px (hero art repositions, cookie banner stacks), 600px (scroll cue hides), 480px (stat strip → 1col).

**The Hairline Rule.** Sections are separated by 1px hairlines and band backgrounds — not by whitespace alone, and never by heavy dividers or rules thicker than 1px.

## Elevation & Depth

Flat by default: at rest, no element casts a shadow — depth is conveyed by band tone (black → night-soft → cool-paper), hairlines, and photographic scrims. Shadow is a *state response*: hovering a card lifts it (`translateY(-4px)` light cards; `-6px`/`-8px` plus a 1–2° `rotateX` tilt on dark product/project cards, which carry `transform-style: preserve-3d`). The mega menu and cookie banner float on near-opaque black with a hairline border rather than a shadow.

### Shadow Vocabulary
- **Card hover (light)** (`box-shadow: 0 12px 32px rgba(10,10,20,.08)`): light-band cards, with `translateY(-4px)`.
- **Card hover (dark, product)** (`0 20px 40px rgba(0,0,0,.3), 0 0 0 1px rgba(255,255,255,.1)`): product cards, with `translateY(-8px) rotateX(2deg)`.
- **Card hover (dark, project)** (`0 16px 32px rgba(0,0,0,.25), 0 0 0 1px rgba(255,255,255,.08)`): project cards, with `translateY(-6px) rotateX(1deg)`.

**The Flat-By-Default Rule.** Surfaces are flat at rest. A shadow may only appear as a response to state — and on dark cards it arrives with a slight tilt, like a document being lifted off a desk.

## Shapes

Near-square containers, pill actions. Radii: 4px (`--r-xs`) for inputs and small plates, 8px (`--r-sm`) for cards, tables wrappers and menus, 16px (`--r-md`) reserved for feature media, 32px (`--r-pill`) for every button, chip and tag. Borders are always 1px hairlines; buttons and ghost controls use `border: 1px solid currentColor` so they inherit their surface's voice. Photography is full-bleed or 8px-plated, never circular, never masked into shapes.

**The Pill / Plate Rule.** Things you act on are pills (32px). Things that hold records are plates (4–8px). Nothing sits in between except 16px feature media.

## Components

### Buttons
Ghost pills that invert on hover — confident, institutional, zero fill at rest.
- **Shape:** full pill (32px), `border: 1px solid currentColor`, min-height 50px, padding `18px 24px`.
- **Primary (dark ground, `btn--dark`):** transparent + white label (13px/700, +1.17px, uppercase); hover/focus fills white, text flips to night. Arrow glyph (`btn__arrow`) slides `translateX(4px)` on hover.
- **Light ground (`btn--light`):** transparent + ink; hover fills ink, text flips to paper. Filled variant (`btn--fill`): cool-paper background, ink text, hover inverts.
- **Hover / Focus:** `.25s` background/color transitions; magnetic `translate` pull on fine pointers; `:focus-visible` outline `2px solid currentColor`, offset 3px.

### Chips
Spec tags and footprint selectors — small pills of record.
- **Style:** transparent, 1px hairline-dark border, pill radius, `8px 14px`, 13px uppercase +0.96px, white at 75%; light-band variant swaps to hairline-light + ink-mute.
- **State:** interactive footprint chips (buttons) hover to white + brighter border; project filter chips gain `is-active`.

### Cards / Containers
- **Corner Style:** 8px (`--r-sm`).
- **Background:** night-soft on dark bands; paper/cool on light bands.
- **Border:** 1px hairline of the ground.
- **Shadow Strategy:** none at rest; hover lift + tilt per the Shadow Vocabulary.
- **Internal Padding:** 24px (`--sp-xl`); product cards split into a full-bleed media plate over a padded body.

### Inputs / Fields
The one place the dossier turns to white paper.
- **Style:** paper background, ink text, 1px hairline-light border, 4px radius, `12px 16px` padding, min-height 44px; labels are micro-caps at 65% white above the field; textareas min 120px, vertical resize.
- **Focus:** `outline: 2px solid var(--ink)`, offset 1px — never a glow, never a border-color-only change.
- **Error:** wrapper gains `is-invalid`, field `aria-invalid="true"`, message in Signal Red 13px; consent checkbox is a real 20px checkbox in a flex row.

### Navigation
- **Header:** fixed, transparent over hero with white currentColor controls; after 32px scroll adds cream background, hairline bottom border and flips to ink — logo inverts with it (CSS `filter: brightness(0) invert(1)` → `none`). The bar is sized *from* the mark: `--brand-h: clamp(56px, 7vw, 80px)` and `--header-h: calc(var(--brand-h) + 24px)`, so the wordmark is 80px tall at ≥1143px with 12px of clearance above and below, and it can never overflow the bar. The mark itself is a transparent, padding-cropped wordmark (`logo-transparent.png`) so it blends into either ground instead of reading as a boxed stamp.
- **Row spacing:** `.site-header__inner` holds `clamp(40px, 4vw, 72px)` between mark and nav, and `.brand` is `flex: 0 0 auto` so the mark never squashes to make room. Measured headroom at the tightest point (861px, just above the overlay breakpoint) is ~146px even with the enlarged mark, so the row needs no intermediate tightening and its spacing stays continuous from 861px upward.
- **Nav row height:** at ≥861px the inner, nav, list and `.mega-trigger` all stretch to the bar's full height. The Capabilities trigger is therefore as tall as the header, which drops its panel from the bar's bottom edge rather than from the middle of it, at any logo height.
- **Links:** 13px/700 uppercase +1.17px, `padding-block: 14px` for tap height, hover/`aria-current` underline sweeps left→right via a 1px `currentColor` pseudo-element.
- **Mega menu:** Capabilities hover/focus-within drops a near-opaque black panel (8px radius, hairline border) of five items, each with a distinct 24×24 stroke icon in a 40px tinted tile.
- **Mobile (≤860px):** 48px hamburger (three 2px currentColor bars, animates to X), full-screen `rgba(0,0,0,.97)` overlay nav, body scroll locked, Escape closes.

### Signature: The Interactive Layer
Fine-pointer, motion-permitting desktops get a 34px cursor ring (1px 55%-white circle) that follows with lerp easing and grows to `scale: 1.53` over interactive elements; buttons magnetically pull toward the cursor; the hero cycles a fact ticker every 3.2s; scroll reveals stagger group children at 60ms (`--stagger`); stat values count up once on view; a 2px scroll-progress bar tracks the page. All of it is gated behind `(hover: hover) and (pointer: fine)` and `prefers-reduced-motion`, and animates only transform/opacity/scale.

**The Light Island Rule.** Forms flip to white paper with black ink — the only inversion of the canvas — because data entry demands maximum legibility. Focus is a 2px ink outline, never a glow.

**The Inversion Rule.** The header belongs to the hero at the top of the page (transparent, white) and to the document once you scroll (cream, ink). The 32px threshold and the logo filter flip together, or not at all.

## Do's and Don'ts

### Do:
- **Do** keep hero imagery decorative (`aria-hidden="true"`, empty alt) behind a scrim, and give content images descriptive alts.
- **Do** use ghost pills (`btn--dark` on dark, `btn--light`/`btn--fill` on light) for every action.
- **Do** structure with hairlines and band tones; let shadow appear only on hover.
- **Do** keep display type uppercase with positive tracking; keep body sentence case at 16px, lh 1.5–1.7, ≤62ch.
- **Do** gate every animation behind `prefers-reduced-motion` and animate only transform/opacity/scale.
- **Do** keep interactive controls ≥44px tall (nav links use 14px block padding to get there).
- **Do** edit `css/styles.css` / `js/main.js` and regenerate the `.min` files with esbuild.

### Don't:
- **Don't** introduce a chromatic accent, gradient text or colored UI surfaces — photography is the only color (Signal Red is reserved for form errors).
- **Don't** put box-shadow on any resting state.
- **Don't** add a second typeface, italics, or weights other than 400/700.
- **Don't** animate width, height, padding or margin — use transform/opacity/scale. Position and growth belong on separate elements: the cursor ring is a 0×0 outer that JS only `translate`s, holding an inner dot that CSS only `scale`s, because `scale` on the same element would multiply the JS `translate` and throw the ring off the cursor.
- **Don't** set `--ink-mute` text on a dark ground, and don't drop a dark-ground opacity rung below `.5` for copy: both read as text dissolving into the background.
- **Don't** hand-edit `styles.min.css` or `main.min.js`; they are generated and detector-ignored.
- **Don't** round record containers past 8px or use pill radii on anything that isn't an action or tag.
- **Don't** let the header stay white-on-cream or ink-on-black: the inversion flips background, text and logo filter together.

## Protected Visuals

These five are load-bearing brand assets and behaviors. They are **off-limits by default**: do not restyle, replace, re-encode, crop, animate or swap them as a side effect of other work. Change one only on an explicit request, and run its verify step before reporting the edit done. Nothing here forbids *adding* new sections — it forbids collateral damage to these.

1. **The MP logo asset** — `assets/img/logo-transparent.png` (rendered mark), `assets/img/MP Logo.svg`, `assets/img/New logo.png`, `assets/img/favicon.svg`. It is a transparent, padding-cropped wordmark sized *from* `--brand-h`; its color comes from the header's `currentColor` inversion, not from an edited file. The favicon is that wordmark composed onto the cream header ground in a rounded tile — `logo-transparent.png` fitted to 90% of a 512 square, embedded as a data URI in `favicon.svg`, which every page and the web manifest already reference — so the tab icon matches the bar the visitor reads the mark in; never redraw the wordmark by hand or swap in a placeholder mark.
   *Verify:* scroll `index.html` slowly past 32px — the mark must be white over the hero and unfiltered ink on the cream bar, never a boxed stamp, never missing on either ground; the tab icon must show the wordmark on its cream plate over both light and dark tab strips.
2. **The products nav dropdown behavior** — the Capabilities mega menu: hover **and** `:focus-within` drop a near-opaque black panel holding five items, each with its distinct 24×24 stroke icon in a 40px tinted tile, opening from the bar's bottom edge.
   *Verify:* on `index.html`, hover the trigger, then Tab to it and open it with the keyboard alone — both must reveal all five items with their icons, and Escape/blur must close it.
3. **The hero video** — `assets/img/photos/hero-towers-720.mp4` (served) over `hero-towers-1080.mp4` (master) and `hero-poster.webp`, inside `.hero--photo` on `index.html` with its scrim graded `.66 → .34 → .72 → .94`.
   *Verify:* the hero autoplays muted/looping with the poster showing first, the scrim still holds headline contrast, and with `prefers-reduced-motion: reduce` the video does not play.
4. **The site record deck** — the slide-deck portfolio on `projects.html`: ten plates `assets/img/photos/1…10.webp` (jpg masters alongside), stacked right-to-left on a desk. Position is a `data-pos` slot from `-1` to `5` that JS recomputes as the shortest wrapped path, and every state is a CSS transition on **transform and opacity only** — no keyframes, no layout property. Travel is `--deck-move: 460ms` on `--ease-in-out`, the leave mirrors the arrival path, and the caption cross-fades in the same grid cell so the block never reflows. Controls are 52px arrows **mounted on the plate itself** — vertically centred, `left: 14px` for prev and `right: calc(--deck-peek + 14px)` for next so neither lands on the fanned stack corners — over a `.62` black scrim, plus a numbered rail with `aria-current`. They sit at `z-index: 20`, above the leaving plate's deliberate `z-index: 12`, and are driven by the same delegated `[data-deck-prev]`/`[data-deck-next]` click path, so moving them onto the plate needed no JS. There is exactly one pair: a second copy would put two "Next photograph" buttons in the tab order.
   *Verify:* on `projects.html`, hold the right arrow down to hammer the deck — plates must retarget mid-flight rather than queue or jump; the front plate must leave to the **left** the way it arrived; Tab must reach both on-plate arrows and the rail, and each label must appear once in the accessibility tree; with `prefers-reduced-motion: reduce` nothing travels and it cross-fades in place.
5. **The footprints globe** — the canvas sphere in *Our Footprints* on `index.html`. Hand-rolled 2D orthographic projection, **no globe library and no WebGL**: land, borders, place names and markers all pass through the same `project()`, which is the only reason they cannot drift apart. Geometry is `assets/geo/earth-50m.json` (Natural Earth 1:50m land plus admin-0 boundaries, public domain), simplified offline against a vertex budget and fetched at runtime; each polygon carries a bounding cap so the far side is culled with one cosine, and the archipelago gets three times the fidelity of the rest of the world. Three layers: land, interior country borders, and Indonesia lifted brighter than its neighbours — the sites are Indonesian, and a coastline alone does not say so. Place names (`INDONESIA`, `SUMATRA`, `JAVA`, `SULAWESI`, `PAPUA`, plus neighbours and continents) are projected onto the sphere, fade in past a per-tier `minV` so nothing crowds the limb, and sit under the limb shading and under the markers. It is achromatic — land `#2f2f34`, Indonesia `#4e4e57`, borders at `.26` white, against a `#17171b → #08080a` body, white markers dominant — and the drag gain is `1/R` radians per pointer pixel so the surface tracks the finger 1:1. Loop freezes off-screen; with reduced motion it parks at its pose and repaints only on pointer, resize, settled fonts or late geometry; if the fetch fails the graticule, names and markers still draw.
   *Verify:* on `index.html`, scroll to the plate — Sumatra through Halmahera must be recognisable, and every white site dot must read as sitting on land or on its coast. Judged in rendered pixels, not decimal degrees: the plate draws ~28 km per pixel, so Surabaya at 1.3 km off Java's north coast in the source is a thirtieth of a pixel from the drawn coastline and *looks* on it, while Karimun Jawa (88 km into the Java Sea, 3.1 px) and Matindok (29 km, 1.0 px) are offshore work and sit visibly clear of the coast — that is correct, not a defect. `tools/_geo/build-earth.js` measures all 25 markers against the raw Natural Earth source and the shipped payload and refuses to write if any coast has moved under one by more than a quarter pixel, so this cannot regress silently; do not replace that check with an exact point-in-polygon test, which reports five failures that cannot be seen. The Indonesia/Malaysia border on Borneo and the Indonesia/PNG border on New Guinea must read as hairlines *inside* those islands, not only around them; `INDONESIA` must sit on the sphere and turn away with the surface when dragged; drag horizontally and the surface must move exactly as far as the pointer; the palette must stay black/white/grey with no blue anywhere.

**The No-Collateral-Edits Rule.** A task that does not name one of these five may not touch it. If work nearby appears to require a change, stop and ask instead of editing.
