# REPLACEMENT-NOTES — PRELUXE DIGITALS (Adewoye Opeyemi Precious, AI video production)

Every `[REPLACE: …]` tag in the HTML marks content or media you must supply. Nothing on the site invents clients, quotes, numbers or credentials.

## Global identity (all pages)
- `[REPLACE: studio email]` — home contact close, contact hero + direct lines + `data-mail` on `#enquiryForm` (add address to `data-mail` to enable the mailto prefill).
- `[REPLACE: studio phone]` — home + contact direct lines.
- `[REPLACE: LinkedIn URL]` — home + contact.
- `[REPLACE: working hours + timezone]` and `[REPLACE: response time]` — contact page.
- `[REPLACE: budget band 1/2/3]` — contact budget select; replace with real bands (e.g. “₦250k–₦500k”).

## About (`about.html`) — AI video focus
- `[REPLACE: years + brands / agencies]`, `[REPLACE: 1–2 direction credits]`, `[REPLACE: models / pipeline you use]`, `[REPLACE: edit / sound tools + turnaround]`, `[REPLACE: career history summary]`, `[REPLACE: founding year]`, `[REPLACE: training / starting year]`, `[REPLACE: roles + clients]`, `[REPLACE: workflow note]`.
- Tools matrix confirms: Runway, Kling, Midjourney, CapCut, ElevenLabs — `[REPLACE: confirm …]` tags mark each cell to verify.
- `[REPLACE: personal note from Opeyemi Precious]` and `[REPLACE: portrait / working portrait]` images (`portraits/opeyemi-portrait.webp`).

## Work + case studies
- Each card/case: `[REPLACE: project title + client name]`, `[REPLACE: client]`, `[REPLACE: year]`, `[REPLACE: tool list]`, `[REPLACE: live film / campaign / series URL]`.
- Outcomes: `[REPLACE: honest outcome + proof …]` — add qualitative result + proof link/screenshot; real numbers only with written permission.
- Testimonials (home): `[REPLACE: testimonial 1/2 …]` — real quote + name/role/brand.

## Media — exact files to supply
Place local files and update the `src`/`poster` paths currently pointing at Unsplash placeholders:
1. **Hero showreel** — `videos/showreel.mp4` + `posters/showreel-poster.webp` (≤30s, muted, 16:9). Stills: `posters/reel-01.webp`, `reel-02.webp`, `reel-03.webp` (1600px wide). See `<!-- REPLACE: videos/showreel… -->` in `index.html`.
2. **Case 01 hero** — `work/brand-product-film/hero.mp4` + `hero-poster.webp` (22s hero suggested) + 2 cutdowns. See REPLACE comment in `work/brand-product-film.html`.
3. **Case 02 key frames** — `work/campaign-visual-system/key-a.webp`, `key-b.webp`, `key-c.webp` (1600px) + `motion-pack.mp4`. See `work/campaign-visual-system.html`.
4. **Case 03 episodes** — `work/explainer-social-series/ep-01.webp`, `ep-02.webp`, `ep-03.webp` + `explainer-90s.mp4` + captioned 9:16 cuts. See `work/explainer-social-series.html`.

## Four required screenshots (proof slots)
1. Product-film proof — e.g. ad-manager or store screenshot → Case 01 Result slot.
2. Campaign proof — e.g. live campaign link + engagement screenshot → Case 02 Result slot.
3. Explainer proof — e.g. watch-time or client quote screenshot → Case 03 Result slot.
4. Producer proof — portrait of Opeyemi Precious (`portraits/opeyemi-portrait.webp`, 1200px) + optional 30s talking-head `videos/producer-note.mp4` → home profile + about page.

## How to replace
1. Drop the file in the path above (keep the filename or update the `src`).
2. Update the adjacent `alt` text to describe the real frame.
3. Delete the neighbouring `[REPLACE: …]` tag once filled.
4. Keep captions honest: duration, format (16:9/9:16/1:1), and client permission for any numbers.
