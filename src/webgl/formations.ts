import { FormationId, HeroMode } from '../config/fintaxConfig';

export interface TileTransform {
  x: number;
  y: number;
  z: number;
  rx: number;
  ry: number;
  rz: number;
  scale: number;
  opacity: number;
}

export interface LensLayout {
  cx: number;
  cy: number;
  diameter: number;
  opacity: number;
  stage: 'hero' | 'chapter' | 'workbench' | 'cta';
  chapterIndex: number;
  dialProgress: number;
  heroAlpha: number;
  workbenchAlpha: number;
  ctaAlpha: number;
}

export const TILE_COUNT = 64;

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function smoothstep(e0: number, e1: number, x: number): number {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function computeLensLayout(
  p: number,
  vw: number,
  vh: number,
  expanded: boolean
): LensLayout {
  const baseDiam = Math.min(448, Math.min(vw, vh) * 0.52);
  const expDiam = Math.min(690, Math.min(vw * 0.9, vh * 0.8));

  const enterCenter = smoothstep(0.03, 0.14, p);
  const enterWorkbench = smoothstep(0.73, 0.8, p);
  const enterCta = smoothstep(0.87, 0.95, p);

  const heroCy = 0.82;
  const centerCy = 0.5;
  const ctaCy = 0.8;

  let cy = lerp(heroCy, centerCy, enterCenter);
  cy = lerp(cy, ctaCy, enterCta);

  const wbDim = enterWorkbench * (1 - enterCta);
  const opacity = clamp(1 - wbDim * 0.96, 0, 1);

  const chapterActive = enterCenter > 0.55 && enterWorkbench < 0.45;
  const targetDiam = chapterActive && expanded ? expDiam : baseDiam;

  const dialProgress = clamp((p - 0.12) / (0.74 - 0.12), 0, 1);
  const chapterIndex = clamp(Math.floor(dialProgress * 4), 0, 3);

  const stage: LensLayout['stage'] =
    enterCta > 0.5
      ? 'cta'
      : enterWorkbench > 0.45
        ? 'workbench'
        : enterCenter > 0.48
          ? 'chapter'
          : 'hero';

  return {
    cx: 0.5,
    cy,
    diameter: targetDiam,
    opacity,
    stage,
    chapterIndex,
    dialProgress,
    heroAlpha: 1 - smoothstep(0.02, 0.11, p),
    workbenchAlpha: enterWorkbench * (1 - smoothstep(0.88, 0.94, p)),
    ctaAlpha: enterCta,
  };
}

export function formationHero(
  i: number,
  time: number,
  mode: HeroMode,
  hMult: number,
  vMult: number,
  mx: number,
  my: number
): TileTransform {
  const cols = 8;
  const rows = 8;
  const col = i % cols;
  const row = Math.floor(i / cols);
  const nx = col - (cols - 1) / 2;
  const ny = (rows - 1) / 2 - row;

  if (mode === 'breathe') {
    const tH = clamp((hMult - 0.25) / 2.55, 0, 1);
    const tV = clamp((vMult - 0.25) / 2.55, 0, 1);
    const baseScale = lerp(0.84, 1.12, (tH + tV) * 0.5);
    const minGap = baseScale + 0.22;
    const gapX = Math.max(minGap, lerp(1.18, 2.08, tH));
    const gapY = Math.max(minGap, lerp(1.18, 2.02, tV));
    const x = nx * gapX;
    const y = ny * gapY;

    const px = mx * 6.0;
    const py = my * 3.8;
    const dist = Math.hypot(x - px, y - py);
    const wave = Math.exp(-dist * dist * 0.14);
    const z = wave * 0.72 + Math.sin(time * 0.9 + i * 0.37) * 0.06;

    return {
      x: x + (x - px) * wave * 0.08,
      y: y + (y - py) * wave * 0.08,
      z,
      rx: -my * 0.045,
      ry: mx * 0.045,
      rz: 0,
      scale: baseScale + wave * 0.11,
      opacity: 1,
    };
  }

  const phase = col * 0.55 + row * 0.42;
  return {
    x: nx * 1.98 + Math.sin(time * 0.55 + phase) * 0.16,
    y: ny * 1.88 + Math.cos(time * 0.48 + phase * 1.1) * 0.16,
    z: -0.6 + Math.sin(time * 0.8 + phase) * 0.95,
    rx: Math.sin(time * 0.45 + phase) * 0.08,
    ry: Math.cos(time * 0.4 + phase) * 0.08,
    rz: Math.sin(time * 0.3 + i) * 0.03,
    scale: 1.02 + Math.sin(time * 0.7 + phase) * 0.07,
    opacity: 0.96,
  };
}

export function formationByTemplate(
  id: FormationId,
  i: number,
  time: number,
  scrubOffset = 0
): TileTransform {
  const n = TILE_COUNT;
  const u = i / n;
  const t = time * 0.26 + scrubOffset * Math.PI * 2;

  switch (id) {
    case 'grid': {
      const cols = 8;
      const col = i % cols;
      const row = Math.floor(i / cols);
      return {
        x: (col - 3.5) * 1.56,
        y: (3.5 - row) * 1.56,
        z: -0.8 + Math.sin(t * 2 + col * 0.5 + row * 0.5) * 0.35,
        rx: 0,
        ry: 0,
        rz: 0,
        scale: 1.06,
        opacity: 0.96,
      };
    }
    case 'ring': {
      const layer = i % 3;
      const idx = Math.floor(i / 3);
      const countInLayer = Math.ceil(n / 3);
      const radius = 3.25 + layer * 1.18;
      const angle = (idx / countInLayer) * Math.PI * 2 + t * (layer === 1 ? -0.42 : 0.34) + layer * 0.4;
      const z = (layer - 1) * -1.8 + Math.sin(angle * 2 + t) * 0.65;
      return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius * 0.94,
        z,
        rx: Math.sin(angle) * 0.08,
        ry: -Math.cos(angle) * 0.08,
        rz: 0,
        scale: 1.08 - layer * 0.07,
        opacity: 0.98,
      };
    }
    case 'helix': {
      const s = u * 2 - 1;
      const turns = 2.6;
      const ang = s * Math.PI * turns + t * 0.9;
      const rad = 2.25 + Math.sin(u * Math.PI) * 1.1;
      return {
        x: s * 7.8 + Math.cos(ang) * rad * 0.48,
        y: s * 4.4 + Math.sin(ang) * rad * 0.85,
        z: Math.cos(ang) * 2.9 - 1.0,
        rx: Math.sin(ang) * 0.16,
        ry: Math.cos(ang) * 0.22,
        rz: 0,
        scale: 1.12,
        opacity: 0.98,
      };
    }
    case 'sphere': {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / n);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i + t * 0.6;
      const r = 4.65;
      return {
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.cos(phi),
        z: r * Math.sin(phi) * Math.sin(theta) - 1.2,
        rx: 0,
        ry: 0,
        rz: 0,
        scale: 1.04,
        opacity: 0.96,
      };
    }
    case 'cylinder': {
      const rings = 4;
      const perRing = n / rings;
      const rIdx = Math.floor(i / perRing);
      const aIdx = i % perRing;
      const ang = (aIdx / perRing) * Math.PI * 2 + t * 0.5 + rIdx * 0.22;
      const rad = 4.7;
      return {
        x: Math.cos(ang) * rad,
        y: (rIdx - 1.5) * 1.75,
        z: Math.sin(ang) * rad - 2.2,
        rx: 0,
        ry: -ang + Math.PI / 2,
        rz: 0,
        scale: 1.08,
        opacity: 0.96,
      };
    }
    case 'stack': {
      const offset = i - n * 0.5;
      const wave = ((i * 0.17 + t * 0.5) % 1) * 2 - 1;
      return {
        x: Math.sin(i * 0.45 + t) * 3.8,
        y: Math.cos(i * 0.35 + t * 0.7) * 2.2,
        z: offset * 0.14 - 2.4 + wave * 0.4,
        rx: 0,
        ry: Math.sin(t + i * 0.1) * 0.18,
        rz: 0,
        scale: 1.15,
        opacity: 0.94,
      };
    }
  }
}

export function formationDeliveryCloud(i: number, time: number): TileTransform {
  const angle = i * 2.39996 + time * 0.1;
  const band = (i % 7) / 6;
  const r = 3.2 + band * 4.4;
  const zCycle = ((i * 0.137 + time * 0.045) % 1) * 2 - 1;
  return {
    x: Math.cos(angle) * r * 1.25,
    y: Math.sin(angle) * r * 0.88,
    z: zCycle * 4.2 - 1.8,
    rx: 0,
    ry: 0,
    rz: 0,
    scale: 1.1 + (1 - Math.abs(zCycle)) * 0.2,
    opacity: 0.92,
  };
}

export function formationCtaArc(i: number, time: number): TileTransform {
  const span = 18;
  const active = i < span;
  const u = (i % span) / (span - 1);
  const ang = lerp(Math.PI * 0.1, Math.PI * 0.9, u) + Math.sin(time * 0.35) * 0.04;
  const r = 4.7 + (i % 2) * 1.15;
  return {
    x: Math.cos(ang) * r * 1.48,
    y: Math.sin(ang) * r * 0.72 - 0.45,
    z: active ? -1.4 + Math.sin(time * 0.6 + i) * 0.4 : -10,
    rx: 0,
    ry: 0,
    rz: 0,
    scale: active ? 0.92 : 0.2,
    opacity: active ? 0.68 : 0.0,
  };
}

export function blendTransform(a: TileTransform, b: TileTransform, t: number): TileTransform {
  const k = clamp(t, 0, 1);
  return {
    x: lerp(a.x, b.x, k),
    y: lerp(a.y, b.y, k),
    z: lerp(a.z, b.z, k),
    rx: lerp(a.rx, b.rx, k),
    ry: lerp(a.ry, b.ry, k),
    rz: lerp(a.rz, b.rz, k),
    scale: lerp(a.scale, b.scale, k),
    opacity: lerp(a.opacity, b.opacity, k),
  };
}
