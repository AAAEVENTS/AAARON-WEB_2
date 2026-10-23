# AAARON Commercial Services LLC: website redesign, October 2026

## Start
Open `public/index.html` in Chrome, Edge, Firefox or Safari (works straight from disk). For the Arabic-first version open
`public/Arabic_Default.html`. With the Node server: `npm install`, copy `.env.example` to `.env`, then `npm start`.

## What changed in this redesign
- **New look (2026 trends):** bento grids, kinetic headline, liquid-glass navigation and panels, a scroll-built waterproofing
  system diagram, tactile material imagery. Navy + amber brand palette retained.
- **New imagery:** all photographs/stock/promo art replaced with original renders and diagrams (see `references/IMAGE_SOURCES.md`).
  Partner logos, Geobit packshots and three manufacturer application photos remain, labelled with their source.
- **Self-hosted fonts** (Bricolage Grotesque, Instrument Sans, Readex Pro): no Google Fonts or Unsplash dependency.
- **Application finder:** choose a surface (roof, basement, tank, floor, concrete repair, steel) and see matching catalogue references.
- Split into `index.html`, `assets/site.css`, `assets/app.js`, `assets/data.js` (products, services, blog, Arabic dictionary).

## Brand websites, videos and chat (latest)
- **No links to the brand companies' websites** (Seal Coatings, Geobit, Elephant Shield, Silikal) anywhere on the site: the product pop-up
  "Manufacturer website" button, the photo credits (brand name only) and the website addresses stored in `data.js` were removed, and the Sara
  chat prompt in `server.js` tells the assistant not to share them. Internal documents (`references/`) are outside the public folder, so they are not served.
- **Blog videos:** the blog page opens with two animated explainers (how a waterproofing system is built; why basements leak), in English and
  Arabic, self-hosted in `public/assets/video/` (MP4 + poster). They autoplay muted while on screen and have normal controls.
  The first also appears inside the roof-waterproofing article. They are illustrations made by AAARON, not footage of real applications.
  To add your own clips, put the MP4 and a poster image in that folder and add an entry to `VIDEOS` in `assets/app.js`.
- **Chat widget** now always fits the window, hides its greeting bubble when opened (and can be dismissed for the session), and keeps its language in sync.

## Logo and parent company (updated)
- The supplied AAARON wordmark is now used in the navigation, footer, Group page and favicon (`public/assets/AAARON_Wordmark*.webp`,
  `favicon.png`; lossless master in `AAARON_Wordmark_master.png`). `AAARON_Wordmark_light.webp` is the same artwork with "RON" recoloured
  white for the dark footer; use the original on light backgrounds.
- **The parent company's website is not linked anywhere** (pages, contact page or chat assistant). The Sara chat prompt in `server.js`
  was updated so it will not share the address either. AAA Group is presented only on the internal `#/group` page.
- The Group page now describes AAA Services Trading LLC: its 2013 origin, Middle East and India network, supplied product areas,
  the four named divisions (Industrial Supplies, Overhead Cranes, Engineering, Human Resources) plus AAARON, mission, and approved-supplier
  status. Content was summarised from the parent company's own public site, so re-check it whenever that site changes.

## Seal Coatings catalogue (updated)
All 14 existing Seal Coatings entries now show their product pack image, and 5 entries were added from the supplied images:
Elegantex Vintage, Elegantin Plus, Thermal-Plast NT, Thermal-Plast XT and Stucco Plast (catalogue is now 43 references).
Their one-line descriptions use only wording printed on the packs; check them against the current TDS.
To change an image, replace the file in `public/assets/seal/` (1000x800 WebP) or edit the `img` field in `assets/data.js`.

## Kept from the previous version
Bilingual EN/AR with RTL, hash routes (`#/home`, `#/solutions/<id>`, `#/products/<brand>`, `#/blog/<slug>`, `#/contact` ...),
43-reference product catalogue with brand/category filters and search, nine services, four blog articles, RFQ form
(WhatsApp, email or server submission), floating WhatsApp button and Sara chat (local answers, optional AI via `/api/chat`),
`server.js` unchanged.

## Editing content
- Products, services, blog articles: `public/assets/data.js` (JSON at the top of the file).
- Arabic text: the `AAARON_AR` dictionary at the bottom of `data.js` (English string -> Arabic). Add a pair for any new copy.
- Page copy: `public/index.html`. Colours/type: variables at the top of `assets/site.css`.
- Re-render images: `references/image-generation/`.

## Hosting and configuration
1. Configure `.env` (SMTP for RFQ emails; optional `OPENAI_API_KEY` for live chat). Never put keys in browser code.
2. Set the live domain, HTTPS and retention policy for uploaded RFQ files.
3. Review product TDS availability, permission to publish supplied brand artwork and current distribution rights before launch.

## Accuracy notes
- Scene images are illustrative renders, not AAARON project photos. Add verified project records and permissions before publishing case studies.
- Finder matches come from catalogue descriptions only; they are not a specification. Always confirm against the current manufacturer TDS.
- Some product descriptions are general and require TDS validation. Live AI replies, email sending and file upload need the server configured.
- The scroll-built diagram is illustrative; real layers and thicknesses follow the manufacturer data sheet.
