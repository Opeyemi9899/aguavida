/* AGUAVIDA — scroll choreography. Lenis + GSAP ScrollTrigger + Bottle3D. */
import { Bottle3D } from './components/Bottle3D.js';

gsap.registerPlugin(ScrollTrigger);

/* ---------------- smooth scroll ---------------- */
const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);

/* anchor links via lenis */
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const el = document.querySelector(a.getAttribute('href'));
    if (el) { e.preventDefault(); lenis.scrollTo(el, { duration: 1.6 }); document.getElementById('mobile-menu').classList.remove('open'); }
  });
});
document.getElementById('menu-btn').addEventListener('click', () =>
  document.getElementById('mobile-menu').classList.toggle('open'));

/* ---------------- loader ---------------- */
const pct = document.getElementById('loader-pct');
const fill = document.getElementById('loader-bar-fill');
const loadState = { p: 0 };
document.body.style.overflow = 'hidden';
gsap.to(loadState, {
  p: 100, duration: 1.6, ease: 'power2.inOut',
  onUpdate: () => { pct.textContent = String(Math.round(loadState.p)).padStart(2, '0'); fill.style.width = loadState.p + '%'; },
  onComplete: () => {
    gsap.to('#loader', { yPercent: -100, duration: 1, ease: 'power4.inOut',
      onComplete: () => { document.getElementById('loader').remove(); document.body.style.overflow = ''; ScrollTrigger.refresh(); } });
    gsap.from('#opening-title .line > span', { yPercent: 110, duration: 1.4, stagger: 0.12, ease: 'power4.out', delay: 0.35 });
    gsap.from('.opening-top-row, .opening-sub, .opening-meta', { opacity: 0, y: 24, duration: 1, stagger: 0.08, ease: 'power3.out', delay: 0.7 });
  },
});

/* ---------------- 3D protagonist ---------------- */
let bottle = null;
try {
  bottle = new Bottle3D(document.getElementById('bottle-canvas'), { variant: 'blanco' });
} catch (err) {
  document.getElementById('bottle-canvas').hidden = true;
  document.getElementById('canvas-fallback').hidden = false;
  console.warn('WebGL unavailable, CSS fallback shown.', err);
}

/* Global journey progress drives the 3D rig every frame */
const journey = { p: 0 };
function applyBottleState() {
  if (!bottle) return;
  const p = journey.p;
  // scale + dolly: hero large → study slightly smaller → hidden in variants → returns for finale
  let scale = 1.05, y = 0, x = 0, warm = 0, exposure = 1.0, visible = true;
  if (p < 0.22) { const k = p / 0.22; scale = 1.0 - k * 0.1; x = k * 0.9; }
  else if (p < 0.42) { const k = (p - 0.22) / 0.2; scale = 0.9 + k * 0.1; x = 0.9 - k * 0.9; warm = k * 1.2; }
  else if (p < 0.72) { visible = false; }                    // variants / origin / making own the frame
  else if (p < 0.86) { visible = p > 0.78; scale = 0.9; }    // collection: brief re-entry
  else { const k = (p - 0.86) / 0.14; scale = 0.9 + k * 0.3; y = -k * 0.35; warm = 2.2; exposure = 1.0 + k * 0.25; }
  bottle.setVisible(visible);
  bottle.setScrollProgress(p, { scale, yOffset: y, xOffset: x, warmLight: warm, exposure });
}
gsap.ticker.add(applyBottleState);

/* Map whole-page scroll to journey 0..1 */
ScrollTrigger.create({ trigger: document.body, start: 0, end: 'max',
  onUpdate: (s) => { journey.p = s.progress; document.getElementById('scroll-progress-fill').style.transform = `scaleX(${s.progress})`; } });

/* ---------------- theme / nav colour per scene ---------------- */
document.querySelectorAll('.scene').forEach((sec) => {
  ScrollTrigger.create({ trigger: sec, start: 'top 55%', end: 'bottom 55%',
    onToggle: (s) => { if (s.isActive) {
      const nav = sec.dataset.nav || 'light';
      document.body.dataset.theme = nav === 'dark' ? 'charcoal' : 'ivory';
    }}});
});

/* ---------------- 01 opening: type drifts, bottle rotates in ---------------- */
gsap.to('#opening-title', { yPercent: -34, opacity: 0.15, ease: 'none',
  scrollTrigger: { trigger: '#opening', start: 'top top', end: 'bottom 40%', scrub: 1 } });
gsap.to('.opening-sub', { yPercent: -120, opacity: 0, ease: 'none',
  scrollTrigger: { trigger: '#opening', start: 'top top', end: '60% top', scrub: 1 } });

/* ---------------- 02 bottle study: readout 0→100% ---------------- */
const angleEl = document.getElementById('rr-angle'), faceEl = document.getElementById('rr-face'), rrFill = document.getElementById('rr-fill');
ScrollTrigger.create({ trigger: '#bottle-study', start: 'top top', end: 'bottom bottom', scrub: 1,
  onUpdate: (s) => {
    const deg = Math.round(s.progress * 270);
    angleEl.textContent = String(deg).padStart(3, '0') + '°';
    faceEl.textContent = s.progress < 0.2 ? 'FRONT' : s.progress < 0.45 ? 'TURNING' : s.progress < 0.7 ? 'THREE-QUARTER' : s.progress < 0.9 ? 'SIDE / BACK' : 'PASSING';
    rrFill.style.transform = `scaleX(${s.progress})`;
  }});
gsap.fromTo('.bottle-copy-front', { y: 60, opacity: 0 }, { y: 0, opacity: 1, ease: 'none',
  scrollTrigger: { trigger: '#bottle-study', start: 'top 80%', end: 'top 20%', scrub: 1 } });
gsap.fromTo('.bottle-copy-back', { y: 80, opacity: 0 }, { y: 0, opacity: 1, ease: 'none',
  scrollTrigger: { trigger: '#bottle-study', start: '60% bottom', end: 'bottom 70%', scrub: 1 } });

/* ---------------- 03 variants: pinned horizontal, world changes ---------------- */
const track = document.getElementById('htrack');
const chapters = gsap.utils.toArray('.chapter');
function hScroll() { return Math.max(0, track.scrollWidth - innerWidth); }
const hTween = gsap.to(track, { x: () => -hScroll(), ease: 'none',
  scrollTrigger: { trigger: '#variants', start: 'top top', end: () => '+=' + (hScroll() * 1.4), pin: true, scrub: 1, invalidateOnRefresh: true,
    onUpdate: (s) => {
      // chapter index drives 3D variant tint + body theme subtly
      const i = Math.min(chapters.length - 1, Math.floor(s.progress * chapters.length));
      const ch = chapters[i];
      const v = ch?.dataset.variant;
      if (v && bottle) bottle.setVariant(v);
    }}});
chapters.forEach((ch) => {
  const title = ch.querySelector('h3'), word = ch.querySelector('.ch-bg-word'), bot = ch.querySelector('.ch-bottle');
  if (title) gsap.fromTo(title, { xPercent: 6 }, { xPercent: -6, ease: 'none',
    scrollTrigger: { trigger: ch, containerAnimation: hTween, start: 'left right', end: 'right left', scrub: true } });
  if (word) gsap.fromTo(word, { xPercent: -10 }, { xPercent: 10, ease: 'none',
    scrollTrigger: { trigger: ch, containerAnimation: hTween, start: 'left right', end: 'right left', scrub: true } });
  if (bot) gsap.fromTo(bot, { y: 90, rotate: -4 }, { y: 0, rotate: 0, ease: 'none',
    scrollTrigger: { trigger: ch, containerAnimation: hTween, start: 'left 85%', end: 'left 25%', scrub: true } });
});

/* ---------------- 04 origin: parallax + masked type ---------------- */
document.querySelectorAll('.om').forEach((f) => {
  const sp = parseFloat(f.dataset.speed || '0.1');
  gsap.to(f, { y: () => -sp * 600, ease: 'none',
    scrollTrigger: { trigger: '#origin', start: 'top bottom', end: 'bottom top', scrub: 1 } });
});
gsap.from('.origin-title span', { yPercent: 110, duration: 1.2, stagger: 0.12, ease: 'power4.out',
  scrollTrigger: { trigger: '.origin-type', start: 'top 78%' } });
gsap.from('.origin-story p', { y: 40, opacity: 0, duration: 1, stagger: 0.15, ease: 'power3.out',
  scrollTrigger: { trigger: '.origin-story', start: 'top 85%' } });

/* ---------------- 05 making: continuous timeline ---------------- */
const stageEls = gsap.utils.toArray('.stage');
const stageNames = ['CRAFTSMANSHIP — IMAGE PLACEHOLDER · I / AGAVE', 'HARVEST — IMAGE PLACEHOLDER · II', 'COOK — IMAGE PLACEHOLDER · III',
  'DISTIL — IMAGE PLACEHOLDER · IV', 'REST — IMAGE PLACEHOLDER · V / OAK', 'BOTTLE — IMAGE PLACEHOLDER · VI'];
ScrollTrigger.create({ trigger: '#making', start: 'top top', end: '+=260%', pin: '.making-pin', scrub: 1,
  onUpdate: (s) => {
    const idx = Math.min(stageEls.length - 1, Math.floor(s.progress * stageEls.length));
    stageEls.forEach((el, i) => el.classList.toggle('is-active', i === idx));
    document.getElementById('making-ph-label').textContent = stageNames[idx];
    document.getElementById('making-fill').style.transform = `scaleX(${s.progress})`;
    // environment subtly warms toward oak as stages advance
    if (bottle) bottle.setVariant(idx >= 4 ? 'anejo' : idx >= 2 ? 'reposado' : 'blanco');
  }});

/* ---------------- 06 collection: still-life drift ---------------- */
gsap.to('.still.s1', { y: -70, ease: 'none', scrollTrigger: { trigger: '#collection', start: 'top bottom', end: 'bottom top', scrub: 1 } });
gsap.to('.still.s2', { y: -140, ease: 'none', scrollTrigger: { trigger: '#collection', start: 'top bottom', end: 'bottom top', scrub: 1 } });
gsap.to('.still.s3', { y: -100, rotate: 2, ease: 'none', scrollTrigger: { trigger: '#collection', start: 'top bottom', end: 'bottom top', scrub: 1 } });
gsap.to('.still.s4', { y: -60, ease: 'none', scrollTrigger: { trigger: '#collection', start: 'top bottom', end: 'bottom top', scrub: 1 } });
gsap.from('.collection-title', { y: 80, opacity: 0, duration: 1.2, ease: 'power3.out',
  scrollTrigger: { trigger: '#collection', start: 'top 70%' } });

/* ---------------- 07 statement: word choreography ---------------- */
const st = document.getElementById('statement-text');
st.innerHTML = st.textContent.trim().split(' ').map((w) => `<span class="w"><span>${w}</span></span>`).join(' ');
gsap.from('#statement-text .w > span', { yPercent: 110, duration: 1, stagger: 0.06, ease: 'power4.out',
  scrollTrigger: { trigger: '#statement', start: 'top 65%' } });

/* ---------------- 08 final: type rises as bottle dollies ---------------- */
gsap.from('.final-copy h2', { y: 100, opacity: 0, duration: 1.3, ease: 'power3.out',
  scrollTrigger: { trigger: '#final', start: 'top 60%' } });

addEventListener('load', () => ScrollTrigger.refresh());
