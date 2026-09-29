# DESIGN-EXPLANATION — PRELUXE DIGITALS / AI Video Production

## Concept
PRELUXE DIGITALS is a 100% AI video production studio: founder Adewoye Opeyemi Precious turns briefs into controlled, campaign-ready AI video — product films, campaign visuals, explainers and social cutdowns. Cinematic film frames, timecode and contact-sheet sequencing present it as a production desk.

## Audience
Primary: brand teams, creative agencies, art directors, campaign producers. Secondary: founders needing product films and explainers.
Core offer (AI video only): AI product films, AI campaign visuals, image-to-video, explainers, social cutdowns — treatment → generation → edit / sound / captions → 16:9 / 9:16 / 1:1.
Differentiator: AI video specialization — continuity-locked characters/products, packshot-true motion, captioned publish-ready delivery.

## Typography
- Display: Archivo Black — bold campaign statements, oversized hero marquee, section titles, film titles.
- Text: Work Sans — briefs, credits, navigation, case-study reading, forms.
- Loaded via Google Fonts with system fallbacks; one display + one text family only.

## Colour rationale
- Studio black `#121311`: cinematic viewing environment; page ground.
- Warm stock `#F0EDE5`: editorial contrast (production treatments/scripts); light bands.
- Signal red `#F04B32`: REC indicators, active controls, key phrases, ticker ground. On light bands links use deep red `#B93A26` for contrast while keeping the signal hue.
- Slate grey `#A8AAA4`: metadata, timecodes, borders, secondary info.
- Contrast: stock-on-black and black-on-stock exceed 7:1; red-on-black used for large/UI accents; red-on-stock avoided for body text.

## Reference differentiation
Borrowed only narrative rhythm (layered hero → capability strip → services → profile → workflow → selected work → proof → contact close). All palette, film-strip compositions, timecode details, prompt-to-picture interaction and copy are original to the film-desk concept.

## Interactions
1. Hero name marquee (oversized PRELUXE DIGITALS behind film frame): full-motion loop via html.motion-full, pauses on hover/focus, Pause-motion toggle provided.
2. Capabilities ticker: AI video capabilities, same full-motion behaviour.
3. Prompt-to-picture covers: production note resolves to final frame on hover/focus/tap; auto-cycles in full-motion mode; keyboard-operable.
4. Autoplay showreel frames (3.5s cycle, pauses on hover/focus) and muted looping previews; running 24fps timecode; all stop with Pause motion.
5. Staggered fade / side reveals via IntersectionObserver; Ken Burns on frames; active nav underline; film-frame float.

## Stack
Static multi-page site: `index.html`, `about.html`, `work.html`, `work/brand-product-film.html`, `work/campaign-visual-system.html`, `work/explainer-social-series.html`, `contact.html`, shared `styles.css` + `script.js`. No build step. Fonts + placeholder stills via CDN; all media slots marked for local replacement.

## Challenges / solutions
- No supplied contact/media specifics → every unknown is a visible `[REPLACE: …]` tag; no invented clients, testimonials, stats or outcomes.
- AI-video focus → about, services, timeline and tools matrix all describe AI video production only; stack lists Runway, Kling, Midjourney, CapCut, ElevenLabs as confirmable placeholders.
- Red-on-cream contrast → deep-red variant for light-band links, documented here.
- Case-study routes on static hosting → `work/*.html` files linked from home + work index; verified locally.
- Reduced-motion + touch → Pause-motion toggle + ?motion=off; html.motion-full is the explicit full-motion override for Preluxe Digitals.
