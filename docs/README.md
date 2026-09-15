# Documentation Bundle

A portable copy of this site's system documentation, gathered so it can be lifted into another company project as a starting template. **The copies here are snapshots — the root files are canonical.** If the root `DESIGN.md`, `PRODUCT.md`, or `README.md` change, refresh the copies in this folder.

## What's in the folder

| File | What it is | Source of truth |
|---|---|---|
| `SYSTEM.md` | How the system is designed and built: architecture, content patterns, asset pipeline, validation gates, SEO/AI discovery layer, hosting posture, and the porting checklist. **Start here.** | written for this bundle |
| `DESIGN.md` | The full visual-system contract ("The Site Dossier"): tokens, typography, bands, components, protected visuals with verify steps. | root `DESIGN.md` |
| `PRODUCT.md` | The product-truth schema: users, purpose, positioning, evidence on hand, principles, accessibility commitments — the "no invented facts" contract. | root `PRODUCT.md` |
| `INFRASTRUCTURE.md` | The operational manual: quick start, page map, configuration, build & validation commands, insights authoring flow, asset pipeline commands, hosting requirements, conventions & gotchas, pre-deploy checklist. | root `README.md` |
| `design-system.json` | Machine-readable design-system sidecar consumed by the design-review tooling. | `.impeccable/design.json` |

## Using it in another project

1. Copy this whole folder into the new project.
2. Follow the **Porting checklist** at the end of `SYSTEM.md` (§8) — replace brand truth and identity first, keep the machinery.
3. Two tool files are *not* included because they are project-local and gitignored as scratch artifacts — copy them manually if wanted:
   - `tools/validate.js` — the integrity validator (adjust its page list for the new inventory).
   - `tools/_gen-favicons.ps1` — the favicon generator (edit its geometry/colors for the new brand, then bump the `?v=` stamp).
4. After the port, keep the new project's root docs canonical and refresh its copies — same rule as here.
