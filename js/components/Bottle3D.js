/* ============================================================================
 * Bottle3D — reusable 3D bottle component for AGUAVIDA.
 * ----------------------------------------------------------------------------
 * Production contract (stable when real assets arrive):
 *
 *   import { Bottle3D } from './components/Bottle3D.js';
 *   const bottle = new Bottle3D(canvas, { variant: 'blanco' });
 *   bottle.setScrollProgress(p);      // 0..1 — drives rotation / dolly
 *   bottle.setVariant('reposado');    // swap liquid + label, not geometry
 *   await bottle.loadModel('assets/glb/aguavida-blanco.glb'); // replaces mesh
 *
 * Placeholder mode (today): builds a correctly-proportioned procedural bottle
 * with THREE.LatheGeometry so composition, lighting and scroll choreography
 * can be art-directed now. GLB replacement reuses the same rig — no page
 * rebuild required. See README "3D SWAP".
 * ========================================================================== */
import * as THREE from 'three';

const VARIANTS = {
  blanco:   { name: 'BLANCO',      liquid: 0xE9E2CC, glass: 0xD8CFB6, label: 'BLANCO · Nº 01',        light: 0xFFF4DE },
  reposado: { name: 'REPOSADO',    liquid: 0xC07A2C, glass: 0xC9A86A, label: 'REPOSADO · Nº 02',      light: 0xFFD9A0 },
  anejo:    { name: 'AÑEJO',       liquid: 0x6E3418, glass: 0x8A5A30, label: 'AÑEJO · Nº 03',         light: 0xFF9C5A },
  extra:    { name: 'EXTRA AÑEJO', liquid: 0x4A3A18, glass: 0x5A4A2A, label: 'EXTRA AÑEJO · Nº 04',   light: 0xD8C39A },
};

function makeLabelTexture(variant, sub) {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 640;
  const g = c.getContext('2d');
  g.fillStyle = '#F5EFE0'; g.fillRect(0, 0, 512, 640);
  g.strokeStyle = '#141210'; g.lineWidth = 6; g.strokeRect(26, 26, 460, 588);
  g.fillStyle = '#141210'; g.textAlign = 'center';
  g.font = '40px Georgia'; g.fillText('A G U A V I D A', 256, 190);
  g.font = '300 54px Georgia';
  g.fillText(variant, 256, 320);
  g.font = '22px sans-serif'; g.globalAlpha = 0.7;
  g.fillText(sub, 256, 390);
  g.globalAlpha = 1; g.font = '20px sans-serif';
  g.fillText('100% AGAVE AZUL — JALISCO', 256, 490);
  g.fillText('PLACEHOLDER LABEL', 256, 535);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

export class Bottle3D {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.opts = Object.assign({ variant: 'blanco', model: null, exposure: 1.0 }, opts);
    this.scrollProgress = 0;      // 0..1 across whole page journey
    this.targetRotY = 0;
    this.rotY = 0;
    this.variant = this.opts.variant;
    this.gltf = null;             // holds real GLB once loaded
    this.ready = false;
    this._init();
    if (this.opts.model) this.loadModel(this.opts.model);
  }

  _init() {
    const canvas = this.canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = this.opts.exposure;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50);
    this.camera.position.set(0, 0.3, 9.6);

    // --- lighting rig (stable for GLB too) ---
    this.ambient = new THREE.HemisphereLight(0xfff6e6, 0x1a1a1a, 0.85);
    this.key = new THREE.DirectionalLight(0xfff1d8, 2.2);
    this.key.position.set(3.2, 4, 4);
    this.rim = new THREE.DirectionalLight(0x9db89a, 1.1);
    this.rim.position.set(-4, 2, -3);
    this.warm = new THREE.PointLight(0xff9c5a, 0, 20);
    this.warm.position.set(0, -1, 3);
    this.scene.add(this.ambient, this.key, this.rim, this.warm);

    // --- rig group: GLB or placeholder both mount here ---
    this.rig = new THREE.Group();
    this.scene.add(this.rig);
    this._buildPlaceholder();

    this.ground = new THREE.Mesh(
      new THREE.CircleGeometry(2.4, 48),
      new THREE.ShadowMaterial({ opacity: 0.22 })
    );
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.position.y = -1.9;
    this.scene.add(this.ground);

    this._resize();
    addEventListener('resize', () => this._resize());
    this._clock = new THREE.Clock();
    this._tick();
    this.ready = true;
  }

  _buildPlaceholder() {
    // Correct tequila-bottle proportions: tall body, sloped shoulder, long neck.
    const pts = [];
    const profile = [
      [0.0, -1.85], [0.52, -1.85], [0.57, -1.7], [0.57, -0.1],
      [0.54, 0.25], [0.35, 0.72], [0.20, 0.95], [0.185, 1.55],
      [0.22, 1.62], [0.22, 1.78], [0.0, 1.78],
    ];
    profile.forEach(([x, y]) => pts.push(new THREE.Vector2(x, y)));
    const geo = new THREE.LatheGeometry(pts, 64);
    const v = VARIANTS[this.variant];

    this.glassMat = new THREE.MeshPhysicalMaterial({
      color: v.glass, roughness: 0.12, metalness: 0.05,
      transparent: true, opacity: 0.55,
    });
    this.placeholder = new THREE.Group();
    this.glass = new THREE.Mesh(geo, this.glassMat);
    this.placeholder.add(this.glass);

    const liquidGeo = new THREE.LatheGeometry(
      profile.filter(([, y]) => y < 0.5).map(([x, y]) => new THREE.Vector2(x * 0.9, y)), 48
    );
    this.liquidMat = new THREE.MeshStandardMaterial({ color: v.liquid, roughness: 0.35 });
    this.liquid = new THREE.Mesh(liquidGeo, this.liquidMat);
    this.placeholder.add(this.liquid);

    this.labelMat = new THREE.MeshStandardMaterial({
      map: makeLabelTexture('BLANCO', VARIANTS[this.variant].label), roughness: 0.8,
    });
    const label = new THREE.Mesh(new THREE.CylinderGeometry(0.585, 0.585, 0.85, 48, 1, true, -0.9, 1.8), this.labelMat);
    label.position.y = -0.75;
    this.placeholder.add(label);

    const capMat = new THREE.MeshStandardMaterial({ color: 0x1c1712, roughness: 0.5 });
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.20, 0.3, 32), capMat);
    cap.position.y = 1.93;
    this.placeholder.add(cap);

    this.rig.add(this.placeholder);
  }

  /** Swap placeholder for a real GLB. Keeps rig, lighting, scroll wiring. */
  async loadModel(url) {
    const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
    const loader = new GLTFLoader();
    // NOTE: enable Draco/KTX2 here when compressed assets arrive:
    // const draco = new DRACOLoader(); draco.setDecoderPath('/draco/'); loader.setDRACOLoader(draco);
    const gltf = await loader.loadAsync(url);
    if (this.placeholder) { this.rig.remove(this.placeholder); this.placeholder = null; }
    if (this.gltf) this.rig.remove(this.gltf);
    this.gltf = gltf.scene;
    this.gltf.scale.setScalar(1.0);
    this.rig.add(this.gltf);
    return this.gltf;
  }

  setVariant(name) {
    if (!VARIANTS[name]) return;
    this.variant = name;
    const v = VARIANTS[name];
    if (this.liquidMat) this.liquidMat.color.setHex(v.liquid);
    if (this.glassMat) this.glassMat.color.setHex(v.glass);
    if (this.labelMat) { this.labelMat.map = makeLabelTexture(v.name || name.toUpperCase(), v.label); this.labelMat.needsUpdate = true; }
    this.key.color.setHex(v.light);
  }

  /** Scroll-driven state. Called every frame by the page choreography. */
  setScrollProgress(p, env = {}) {
    this.scrollProgress = THREE.MathUtils.clamp(p, 0, 1);
    // Full journey: ~2.2 turns with eased physical feel (set in tick via damping)
    this.targetRotY = this.scrollProgress * Math.PI * 4.4;
    if (env.exposure) this.renderer.toneMappingExposure = env.exposure;
    if (env.warmLight !== undefined) this.warm.intensity = env.warmLight;
    if (env.scale) this.rig.scale.setScalar(env.scale);
    if (env.yOffset !== undefined) this.rig.position.y = env.yOffset;
    if (env.xOffset !== undefined) this.rig.position.x = env.xOffset;
  }

  setVisible(v) { this.canvas.style.opacity = v ? '1' : '0'; }

  _resize() {
    const w = innerWidth, h = innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  _tick = () => {
    requestAnimationFrame(this._tick);
    const t = this._clock.getElapsedTime();
    // inertia: critically-damped approach to scroll target (physical, no spin)
    this.rotY += (this.targetRotY - this.rotY) * 0.075;
    this.rig.rotation.y = this.rotY + Math.sin(t * 0.4) * 0.03; // faint idle breath
    this.rig.position.y += Math.sin(t * 0.8) * 0.0006;
    this.renderer.render(this.scene, this.camera);
  };
}
