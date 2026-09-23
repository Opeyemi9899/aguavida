# AGUAVIDA — Tequila, Reimagined

Cinematic, scroll-driven brand experience. No build step — open `index.html`
directly or serve the folder statically.

## Stack (CDN, no install)
- Three.js 0.160 (importmap) — `js/components/Bottle3D.js`
- GSAP 3.12 + ScrollTrigger — `js/main.js`
- Lenis 1.1 smooth scroll

## Structure (mirrors the requested component architecture)
- `index.html` — 8 scenes: Opening / Bottle study / Variants (horizontal) /
  Origin / Making / Collection / Statement / Final + CTA
- `styles/main.css` — editorial system (ivory/charcoal/agave/amber/clay/gold)
- `js/components/Bottle3D.js` — reusable 3D bottle (`model, rotation, scale,
  position, lighting, environment, scrollProgress`)
- `js/main.js` — ProductScene / ScrollScene / reveals / navigation choreography

## 3D swap: placeholder → GLB (no page rebuild)
1. Drop files in `assets/glb/` e.g. `aguavida-blanco.glb`
   (use Draco/KTX2 compression for production).
2. In `js/main.js`, after constructing the bottle:
   ```js
   await bottle.loadModel('assets/glb/aguavida-blanco.glb');
   ```
   The rig, lighting, scroll rotation and variant tints are preserved —
   `loadModel()` only replaces the mesh inside the existing rig.
3. Per-variant models: call `bottle.loadModel(url)` when the variant chapter
   becomes active (hook already exists in the horizontal-scroll `onUpdate`).
4. Lazy-load: models load on demand, never all four up front.

## Asset swap list (all placeholders clearly tagged in-UI)
- 4× bottle GLB slots (`GLB SLOT 01–04` tags)
- agave fields / landscape / harvest / distillation imagery (`.img-ph` blocks)
- background video slot: add `<video>` inside `.origin-media`, lazy + muted + playsinline

## Migrate to Next.js later
- `Bottle3D.js` → `components/Bottle3D.tsx` (same API; swap importmap for
  `three` npm + `@react-three/fiber` Canvas wrapper, keep `setScrollProgress`).
- Scenes in `index.html` → `app/page.tsx` sections; `main.js` ScrollTriggers →
  per-section hooks. Choreography values transfer 1:1.

## Performant by design
- One fixed WebGL canvas; CSS bottles elsewhere (no duplicate contexts).
- Pixel ratio capped at 2; damped scroll rotation (GPU-friendly transforms).
- Pinned + scrubbed ScrollTriggers; `prefers-reduced-motion` respected.
