import * as THREE from 'three';
import { FormationId, HeroMode, MediaItem, Theme, assetUrl } from '../config/fintaxConfig';
import {
  LensLayout,
  TILE_COUNT,
  blendTransform,
  computeLensLayout,
  formationByTemplate,
  formationCtaArc,
  formationDeliveryCloud,
  formationHero,
} from './formations';
import {
  LENS_FRAGMENT_SHADER,
  LENS_VERTEX_SHADER,
  TILE_FRAGMENT_SHADER,
  TILE_VERTEX_SHADER,
} from './shaders';

export interface StageSyncState {
  scrollProgress: number;
  theme: Theme;
  heroMode: HeroMode;
  lensExpanded: boolean;
  engineFormation: FormationId;
  policyScrub: number;
  mouseNormX: number;
  mouseNormY: number;
  hMult: number;
  vMult: number;
}

export interface FrameSyncPayload {
  layout: LensLayout;
  cyPx: number;
  diameterPx: number;
  lensOpacity: number;
  mouseNormX: number;
  mouseNormY: number;
}

interface TileEntry {
  mesh: THREE.Mesh;
  mat: THREE.ShaderMaterial;
  curX: number;
  curY: number;
  curZ: number;
  curRx: number;
  curRy: number;
  curRz: number;
  curScale: number;
  curOpacity: number;
}

const LIGHT_BG = new THREE.Color('#f3f2ee');
const DARK_BG = new THREE.Color('#0b0b0c');
const LIGHT_LENS = new THREE.Color('#f8f7f4');
const DARK_LENS = new THREE.Color('#0e0e10');

export class SpatialStageEngine {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private rt: THREE.WebGLRenderTarget;
  private postScene: THREE.Scene;
  private postCam: THREE.OrthographicCamera;
  private postMat: THREE.ShaderMaterial;
  private tiles: TileEntry[] = [];
  private loader = new THREE.TextureLoader();
  private rafId = 0;
  private clock = new THREE.Clock();
  private disposed = false;
  private vw = window.innerWidth;
  private vh = window.innerHeight;
  private dpr = Math.min(window.devicePixelRatio || 1, 1.5);

  private state: StageSyncState = {
    scrollProgress: 0,
    theme: 'light',
    heroMode: 'breathe',
    lensExpanded: false,
    engineFormation: 'ring',
    policyScrub: 0,
    mouseNormX: 0,
    mouseNormY: 0,
    hMult: 1.5,
    vMult: 1.4,
  };

  private curLensCy = 0.82;
  private curLensRadius = 224;
  private curLensOpacity = 1;
  private curBg = LIGHT_BG.clone();
  private curLensCol = LIGHT_LENS.clone();
  private curDark = 0;

  constructor(
    canvas: HTMLCanvasElement,
    private onFrame?: (payload: FrameSyncPayload) => void
  ) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: true,
      powerPreference: 'high-performance',
      stencil: false,
    });
    this.renderer.setPixelRatio(this.dpr);
    this.renderer.setSize(this.vw, this.vh, false);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.setClearColor(0x000000, 0);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(46, this.vw / this.vh, 0.1, 100);
    this.camera.position.set(0, 0, 12.2);

    // Lightweight UnsignedByte RT (no expensive 4x MSAA HalfFloat resolve!)
    this.rt = new THREE.WebGLRenderTarget(
      Math.max(1, Math.floor(this.vw * this.dpr)),
      Math.max(1, Math.floor(this.vh * this.dpr)),
      {
        type: THREE.UnsignedByteType,
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        depthBuffer: true,
        stencilBuffer: false,
      }
    );

    this.postScene = new THREE.Scene();
    this.postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.postMat = new THREE.ShaderMaterial({
      vertexShader: LENS_VERTEX_SHADER,
      fragmentShader: LENS_FRAGMENT_SHADER,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uScene: { value: this.rt.texture },
        uResolution: { value: new THREE.Vector2(this.vw * this.dpr, this.vh * this.dpr) },
        uLensCenter: { value: new THREE.Vector2(0.5, 0.18) },
        uLensRadius: { value: 224 * this.dpr },
        uLensOpacity: { value: 1.0 },
        uLensColor: { value: LIGHT_LENS.clone() },
        uIsDark: { value: 0.0 },
        uVignette: { value: 1.0 },
      },
    });
    this.postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.postMat));

    this.buildTiles();
    window.addEventListener('resize', this.handleResize, { passive: true });
    this.loop();
  }

  private createFallbackTexture(seed: number): THREE.DataTexture {
    const c = 48 + ((seed * 31) % 165);
    const data = new Uint8Array([c, c, c, 255]);
    const tex = new THREE.DataTexture(data, 1, 1, THREE.RGBAFormat);
    tex.needsUpdate = true;
    return tex;
  }

  private buildTiles() {
    const geom = new THREE.PlaneGeometry(1, 1);
    for (let i = 0; i < TILE_COUNT; i++) {
      const init = formationHero(i, 0, 'breathe', 1.5, 1.4, 0, 0);
      const mat = new THREE.ShaderMaterial({
        vertexShader: TILE_VERTEX_SHADER,
        fragmentShader: TILE_FRAGMENT_SHADER,
        transparent: true,
        depthWrite: true,
        uniforms: {
          uMap: { value: this.createFallbackTexture(i) },
          uOpacity: { value: 1.0 },
          uRadius: { value: 0.028 },
          uImageAspect: { value: new THREE.Vector2(1, 1) },
          uBgColor: { value: this.curBg },
          uFogNear: { value: 12.2 },
          uFogFar: { value: 21.5 },
        },
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(init.x, init.y, init.z);
      mesh.scale.setScalar(init.scale);
      this.scene.add(mesh);

      this.tiles.push({
        mesh,
        mat,
        curX: init.x,
        curY: init.y,
        curZ: init.z,
        curRx: 0,
        curRy: 0,
        curRz: 0,
        curScale: init.scale,
        curOpacity: 1,
      });
    }
  }

  public loadMediaItems(items: MediaItem[]) {
    if (!items.length) return;
    const maxAniso = Math.min(4, this.renderer.capabilities.getMaxAnisotropy());
    const cache = new Map<string, THREE.Texture>();

    this.tiles.forEach((entry, idx) => {
      const item = items[idx % items.length];
      const resolvedSrc = assetUrl(item.src);
      const existing = cache.get(resolvedSrc);
      if (existing) {
        entry.mat.uniforms.uMap.value = existing;
        const img = existing.image as HTMLImageElement | undefined;
        if (img && img.width && img.height) {
          entry.mat.uniforms.uImageAspect.value.set(img.width, img.height);
        }
        return;
      }
      const tex = this.loader.load(resolvedSrc, (loaded) => {
        if (this.disposed) {
          loaded.dispose();
          return;
        }
        const img = loaded.image as HTMLImageElement | undefined;
        if (img && img.width && img.height) {
          this.tiles.forEach((tile) => {
            if (tile.mat.uniforms.uMap.value === loaded) {
              tile.mat.uniforms.uImageAspect.value.set(img.width, img.height);
            }
          });
        }
      });
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = maxAniso;
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      cache.set(resolvedSrc, tex);
      entry.mat.uniforms.uMap.value = tex;
    });
  }

  public sync(partial: Partial<StageSyncState>) {
    Object.assign(this.state, partial);
  }

  private handleResize = () => {
    this.dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    this.vw = window.innerWidth;
    this.vh = window.innerHeight;
    this.renderer.setPixelRatio(this.dpr);
    this.renderer.setSize(this.vw, this.vh, false);
    this.camera.aspect = this.vw / this.vh;
    this.camera.updateProjectionMatrix();
    this.rt.setSize(
      Math.max(1, Math.floor(this.vw * this.dpr)),
      Math.max(1, Math.floor(this.vh * this.dpr))
    );
    this.postMat.uniforms.uResolution.value.set(this.vw * this.dpr, this.vh * this.dpr);
  };

  private computeTarget(i: number, t: number) {
    const {
      scrollProgress: p,
      heroMode,
      hMult,
      vMult,
      mouseNormX,
      mouseNormY,
      engineFormation,
      policyScrub,
    } = this.state;

    if (p <= 0.03) return formationHero(i, t, heroMode, hMult, vMult, mouseNormX, mouseNormY);
    if (p < 0.14) {
      return blendTransform(
        formationHero(i, t, heroMode, hMult, vMult, mouseNormX, mouseNormY),
        formationByTemplate('ring', i, t * 0.75),
        (p - 0.03) / 0.11
      );
    }
    if (p <= 0.18) return formationByTemplate('ring', i, t * 0.75);
    if (p < 0.30) {
      return blendTransform(
        formationByTemplate('ring', i, t * 0.75),
        formationByTemplate(engineFormation, i, t * 0.85),
        (p - 0.18) / 0.12
      );
    }
    if (p <= 0.36) return formationByTemplate(engineFormation, i, t * 0.85);
    if (p < 0.48) {
      return blendTransform(
        formationByTemplate(engineFormation, i, t * 0.85),
        formationByTemplate('helix', i, t * 0.88, policyScrub),
        (p - 0.36) / 0.12
      );
    }
    if (p <= 0.54) return formationByTemplate('helix', i, t * 0.88, policyScrub);
    if (p < 0.66) {
      return blendTransform(
        formationByTemplate('helix', i, t * 0.88, policyScrub),
        formationDeliveryCloud(i, t),
        (p - 0.54) / 0.12
      );
    }
    if (p < 0.86) {
      const share = formationDeliveryCloud(i, t);
      const fadeOut = Math.min(1, Math.max(0, (p - 0.72) / 0.08));
      return blendTransform(share, { ...share, z: share.z - 5.5, opacity: 0.1 }, fadeOut);
    }
    const share = formationDeliveryCloud(i, t);
    const toCta = Math.min(1, Math.max(0, (p - 0.86) / 0.08));
    return blendTransform({ ...share, z: share.z - 5.5, opacity: 0.1 }, formationCtaArc(i, t), toCta);
  }

  private loop = () => {
    if (this.disposed) return;
    this.rafId = requestAnimationFrame(this.loop);

    const dt = Math.min(this.clock.getDelta(), 0.05);
    const elapsed = this.clock.getElapsedTime();
    const damp = 1 - Math.exp(-9.0 * dt);
    const lensDamp = 1 - Math.exp(-13.5 * dt);

    const isDark = this.state.theme === 'dark';
    this.curBg.lerp(isDark ? DARK_BG : LIGHT_BG, damp);
    this.curLensCol.lerp(isDark ? DARK_LENS : LIGHT_LENS, damp);
    this.curDark += ((isDark ? 1 : 0) - this.curDark) * damp;

    const camDamp = 1 - Math.exp(-5.0 * dt);
    this.camera.position.x += (this.state.mouseNormX * 0.45 - this.camera.position.x) * camDamp;
    this.camera.position.y += (this.state.mouseNormY * 0.3 - this.camera.position.y) * camDamp;
    this.camera.lookAt(0, 0, 0);

    for (let i = 0; i < this.tiles.length; i++) {
      const entry = this.tiles[i];
      const tgt = this.computeTarget(i, elapsed);
      entry.curX += (tgt.x - entry.curX) * damp;
      entry.curY += (tgt.y - entry.curY) * damp;
      entry.curZ += (tgt.z - entry.curZ) * damp;
      entry.curRx += (tgt.rx - entry.curRx) * damp;
      entry.curRy += (tgt.ry - entry.curRy) * damp;
      entry.curRz += (tgt.rz - entry.curRz) * damp;
      entry.curScale += (tgt.scale - entry.curScale) * damp;
      entry.curOpacity += (tgt.opacity - entry.curOpacity) * damp;

      entry.mesh.position.set(entry.curX, entry.curY, entry.curZ);
      entry.mesh.rotation.set(entry.curRx, entry.curRy, entry.curRz);
      entry.mesh.scale.setScalar(entry.curScale);
      entry.mat.uniforms.uOpacity.value = entry.curOpacity;
    }

    const layout = computeLensLayout(
      this.state.scrollProgress,
      this.vw,
      this.vh,
      this.state.lensExpanded
    );
    this.curLensCy += (layout.cy - this.curLensCy) * lensDamp;
    this.curLensRadius += (layout.diameter * 0.5 - this.curLensRadius) * lensDamp;
    this.curLensOpacity += (layout.opacity - this.curLensOpacity) * lensDamp;

    this.postMat.uniforms.uLensCenter.value.set(layout.cx, 1.0 - this.curLensCy);
    this.postMat.uniforms.uLensRadius.value = this.curLensRadius * this.dpr;
    this.postMat.uniforms.uLensOpacity.value = this.curLensOpacity;
    this.postMat.uniforms.uLensColor.value.copy(this.curLensCol);
    this.postMat.uniforms.uIsDark.value = this.curDark;
    this.postMat.uniforms.uVignette.value = layout.heroAlpha;

    // Frame-locked DOM sync (exact same RAF tick, 0 React re-renders!)
    this.onFrame?.({
      layout,
      cyPx: this.curLensCy * this.vh,
      diameterPx: this.curLensRadius * 2,
      lensOpacity: this.curLensOpacity,
      mouseNormX: this.state.mouseNormX,
      mouseNormY: this.state.mouseNormY,
    });

    this.renderer.setRenderTarget(this.rt);
    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);

    this.renderer.setRenderTarget(null);
    this.renderer.clear();
    this.renderer.render(this.postScene, this.postCam);
  };

  public dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.rafId);
    window.removeEventListener('resize', this.handleResize);
    this.rt.dispose();
    this.renderer.dispose();
  }
}
