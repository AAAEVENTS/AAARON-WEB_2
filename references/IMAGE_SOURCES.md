# Image sources and licensing

## Original renders (this redesign)
All files in `assets/img/` are **original procedural renders** created for AAARON (scripts in
`references/image-generation/`). They are illustrative materials/scenes, **not photographs of AAARON projects**, and the
website says so wherever they appear.

| File | Depicts |
|---|---|
| hero-water-beading(.webp, -sm.webp), og-cover.jpg | Water beading on sealed concrete |
| scene-roof.webp | Bare roof slab vs. white liquid coating, reinforcement tape over an expansion joint |
| scene-tank.webp | Light caustics over a coated tank floor |
| scene-floor.webp | Glossy resin floor with amber safety lane |
| scene-repair.webp | Cracked concrete beside a repaired patch |
| scene-steel.webp | Steel plate, weld bead and amber protective coating |
| scene-metallic.webp | Metallic epoxy floor finish |

The system cross-section diagram and the basement section illustration are original inline SVG in `index.html`.

## Design references (not copied)
Layout ideas were studied from public waterproofing-industry sites (application-led navigation, layered system
cross-sections, application selector tables, challenge/solution project structure). **No images, text or artwork were
copied from Sika, Mapei, Fosroc, Xypex or any other company.**

## Manufacturer material (kept, with source labels on the site)
- Brand logos: Seal Coatings, Geobit, Elephant Shield, Silikal (supplied by AAARON).
- Product packshots `geobit-*.webp`: extracted from the supplied Geobit catalogue (`references/Geobit_Catalogue_Original.pdf`).
- Application photographs: `seal-acroprime.webp` (seal-coatings.com), `elephant-roof-wide.webp` and
  `elephant-liquid-rubber.webp` (elephantshield.in), `silikal-carpark.webp` (silikal.com, overlay icon cropped out).
  
**Before public launch**, secure written permission/approved assets from each manufacturer for logos and photographs,
and confirm current distribution rights. Do not imply authorised distribution where it has not been verified.

## AAARON wordmark
Supplied by AAARON (`AAARON_Wordmark.webp`). Trimmed and resized for the web; a white-"RON" variant and a favicon (first "A") were derived from it.
The previous wordmark (with tagline) is in `assets/archive/`.

## Seal Coatings product images (`assets/seal/`)
19 product images supplied by AAARON (`SEAL_COATINGS.zip`), normalised to a uniform 1000x800 tile by
`references/image-generation/process_seal_images.py`: re-cropped, placed on a neutral background where the original was
transparent/white, and the small corner "SEAL COATINGS" badge removed. Pack artwork itself is unmodified, except the
Water Guard PU-XTRM file, where black cut-out smears and the messy reflection were cleaned.
Not used: `SEAL ELEGANTIN TEXTURE.png` and `SEAL ELEGANTIN TIMELESS.png` (byte-identical files whose label matches the base Elegantin).
Confirm with Seal Coatings that all pack artwork is current, approved, and licensed for publication.

## Archive
`assets/archive/` holds the previous version's imagery (promo hero slides, stock-style photos, unused packshots and logos).
Nothing in it is referenced by the site; delete it when no longer needed.

## Fonts
Self-hosted variable fonts under the SIL Open Font License: Bricolage Grotesque, Instrument Sans, Readex Pro.
