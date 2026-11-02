# Assets and licenses

## Identity

The existing provisional identity uses a calm geometric wolf profile with a ridgeline cut into the neck, a restrained Fraunces wordmark, and a clear Source Sans 3 descriptor reading **Commercial Cleaning Service**. On November 2, 2026, the current native paths and two branding review PNGs were inspected. No separately identified exact approved original was available. The current logo and source geometry are preserved; no replacement or FFXI-inspired identity was introduced. An approved original file is still needed if it differs from this mark.

- `public/brand/mark.svg` and `mark-reversed.svg`: genuine SVG paths, with no embedded bitmap, emoji, rune, or badge.
- `public/favicon.svg`: matching compact pine/ivory wolf-profile favicon.
- `src/config/brand.ts`: canonical native path geometry; `src/components/Mark.astro` renders it. `scripts/build-brand.ts` generates the public variants and favicon consistently.
- `src/components/Header.astro`: live, scalable typeset wordmark and readable descriptor. Fonts are self-hosted. Mark geometry and typography can be used together for a future card or shirt; review the provisional identity before commissioning printed material.
- `src/components/Arrow.astro` and homepage pictograms: simple original SVG strokes. No emoji, stock icon font, embedded bitmap logo, or third-party icon package.

## Imagery

Both source images were generated for this project with the **built-in ImageGen tool**, not the API/CLI fallback. No real client, employee, owner, completed job, before/after result, business premises, or exact geographic location is depicted. Public captions identify the imagery as illustrative. No external photo attribution is required for the source images; retain this provenance record. No claim of exclusive copyright or real-world provenance is made.

| Project asset | Role | Origin |
|---|---|---|
| `src/assets/workplace.png` | Hero, warm small-office reception | Built-in ImageGen; original output `exec-4a8c21bf-6dd2-4987-8200-f9e3d6155c3b.png` |
| `src/assets/foothills.png` | Owner introduction/About landscape detail | Built-in ImageGen; original output `exec-6db258e1-faf4-4e11-b57d-1f7b1fc2a1bc.png` |
| `public/social-card.jpg` | Open Graph image when a real domain is configured | 1200 × 630 crop of the generated workplace image |

The project keeps copies of both full PNG originals inside `src/assets/`; it does not depend on the tool’s external output folder. Astro creates responsive, dimensioned WebP images at build time. Full PNGs are not copied to the public build.

### Final hero prompt

Use case: photorealistic-natural. Asset type: commercial cleaning website hero photograph, landscape 3:2. Create a believable small professional office reception in Colorado's pine foothills: tidy oak reception counter and low oak storage, two simple oatmeal fabric visitor chairs, a leafy plant, modest desk area, clean natural concrete or warm light floor, large black framed windows looking toward nearby ponderosa pines and low granite foothills. Warm late-afternoon natural light, calm welcoming lived-in workmanship, Scandinavian restraint, editorial architectural photography with realistic materials and straight verticals. Interior fills most of composition; not a luxury resort, home, mansion, corporate skyscraper or hotel lobby. No people, text, brand logos, cleaning equipment, sparkle effects or fantastical scenery. Eye-level wide interior composition, nicely balanced, inviting and practical. This is an illustrative space, not a real customer's workplace.

### Final landscape prompt

Use case: photorealistic-natural. Asset type: small supporting editorial landscape photo for a Bailey, Colorado commercial cleaning website, wide landscape 3:2. Close natural ponderosa pine trunks framing modest rolling pine-covered foothills, weathered warm granite outcrops, dry native grasses in the foreground, gentle late afternoon warm sunlight. Typical Colorado Front Range foothills at mid elevation, quiet practical small-town context. No dramatic snowy alpine peaks, no buildings, roads, people, animals, signage, text or logo. Photoreal editorial photograph with natural subtle color and tactile stone and pine textures. Not a claimed exact location or business property.

## Fonts

| Font | Use | Source and license |
|---|---|---|
| Fraunces | Headings and wordmark | `@fontsource-variable/fraunces` 5.3.0; SIL Open Font License 1.1; [Fraunces project](https://github.com/undercasetype/Fraunces) |
| Source Sans 3 | Body, navigation, forms, descriptor | `@fontsource-variable/source-sans-3` 5.3.1; SIL Open Font License 1.1; [Adobe Source Sans](https://github.com/adobe-fonts/source-sans) |

Full license/copyright notices are retained in `public/licenses/Fraunces-OFL.txt` and `public/licenses/Source-Sans-3-OFL.txt`. They are copied to `dist/licenses/` alongside the self-hosted font assets. No Google Fonts network request or third-party font widget is used.

## Color

Warm ivory #F5F1E8, off-white #FCFAF5, pine #293F35, moss #73806A, stone #D8D0C3, copper #A66F4B, charcoal #29312D. Body and muted text use darker tones; copper is restrained decoration. Primary action text is off-white on pine. Small numbered labels use darker copper #8B5B3A. Automated contrast checks cover the visible page and enabled form states.

## Nordic logo refinement

Built-in **ImageGen** created and refined a transparent logo study, saved as `review/branding/nordic-logo-study.png` (original output `exec-f3cef37f-4252-4d94-89b5-be380c91a7c6.png`). The selected study was simplified/redrawn into native SVG geometry for the website; the raster is an exploration record, not an embedded bitmap logo. The public mark, header mark, reversed mark and favicon all use the same paths. The earlier aggressive-looking study was discarded.

The warmer light layout and commercial-interior photography are preserved. Full variable Fraunces axes now provide restrained, less rounded headings/wordmark; corners use simple geometric cuts. No mythological, religious, military or aggressive decoration was introduced.

Initial built-in prompt:

Use case: logo-brand. Asset type: single brand-symbol exploration, transparent background. Primary request: a more Nordic, Fenrir-inspired logo symbol for Fenrir Commercial Cleaning Service, an approachable owner-operated local business in the Colorado foothills. One elegant calm wolf head in side profile looking to the right, with two restrained angular ears and a Colorado mountain ridgeline formed by a single negative-space cut across its neck. Distinctively Scandinavian geometric reduction, practical craftsmanship, strong silhouette, clean angular curves, welcoming and understated rather than fierce. One solid deep pine green #293F35 only, no gradients, no texture, no border, no container. Large centered symbol, generous transparent margin, no text; the wordmark will be typeset separately. Flat vector-like graphic suitable for tracing into genuine native SVG paths and legible at 48 pixels. Closed mouth, no exposed teeth, no glowing eyes, no aggressive expression. No runes, occult or religious symbols, ritual circle, valknut, compass, gods, Viking costume, shield, weapons, military insignia, fantasy game aesthetic, or alpine resort badge.

Refinement prompt (the preceding study was the local edit target):

Edit this logo exploration into a much simpler, friendlier contemporary Scandinavian mark for Fenrir Commercial Cleaning Service. Preserve only the idea of a wolf profile looking right with a mountain cutout in the neck. Remove the aggressive angular eye and all jagged spiky fur. Use a small relaxed round or short horizontal eye without an eyebrow, a broad closed soft muzzle without any visible mouth or teeth, just two clear ears, and a smooth geometric neck. Reduce to 3 or 4 large shapes with ample negative space, no fine details, so it reads as welcoming and calm at small header size. Keep the mountain to two simple peaks carved into the bottom. Single perfectly flat deep pine green #293F35, no gradient, shading or texture, no border, no shield, no ring, no text. Transparent background. Practical Nordic craft and clean architectural proportions, not sports mascot, military patch, fantasy emblem, or aggressive wolf.
