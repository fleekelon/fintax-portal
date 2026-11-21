export const TILE_VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  varying float vDepth;

  void main() {
    vUv = uv;
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vDepth = -mvPos.z;
    gl_Position = projectionMatrix * mvPos;
  }
`;

export const TILE_FRAGMENT_SHADER = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uOpacity;
  uniform float uRadius;
  uniform vec2 uImageAspect;
  uniform vec3 uBgColor;
  uniform float uFogNear;
  uniform float uFogFar;

  varying vec2 vUv;
  varying float vDepth;

  float sdRoundedBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
  }

  void main() {
    vec2 centered = vUv - 0.5;
    float d = sdRoundedBox(centered, vec2(0.5), clamp(uRadius, 0.0, 0.48));
    float edgeAlpha = 1.0 - smoothstep(-0.008, 0.008, d);
    if (edgeAlpha < 0.01) discard;

    vec2 uv = vUv;
    float aspect = uImageAspect.x / max(uImageAspect.y, 0.001);
    if (aspect > 1.0) {
      uv.x = (uv.x - 0.5) / aspect + 0.5;
    } else if (aspect < 1.0) {
      uv.y = (uv.y - 0.5) * aspect + 0.5;
    }

    vec4 tex = texture2D(uMap, uv);
    float fogT = smoothstep(uFogNear, uFogFar, vDepth);
    vec3 col = mix(tex.rgb, uBgColor, fogT * 0.78);

    gl_FragColor = vec4(col, edgeAlpha * uOpacity * (1.0 - fogT * 0.55));
  }
`;

export const LENS_VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

/**
 * High-FPS Optical Glass Lens Shader:
 * - Zero texture fetches inside the opaque frosted core (r < 0.60)
 * - 5-tap chromatic radial bezel refraction (down from 15 taps) for 120fps smoothness
 */
export const LENS_FRAGMENT_SHADER = /* glsl */ `
  uniform sampler2D uScene;
  uniform vec2 uResolution;
  uniform vec2 uLensCenter;
  uniform float uLensRadius;
  uniform float uLensOpacity;
  uniform vec3 uLensColor;
  uniform float uIsDark;
  uniform float uVignette;

  varying vec2 vUv;

  void main() {
    vec2 px = vUv * uResolution;
    vec2 centerPx = uLensCenter * uResolution;
    vec2 delta = px - centerPx;
    float dist = length(delta);
    float r = dist / max(uLensRadius, 1.0);

    // Fast path 1: Inside frosted core (zero texture reads!)
    if (uLensOpacity > 0.98 && r < 0.60) {
      gl_FragColor = vec4(uLensColor, 0.99);
      return;
    }

    vec4 base = texture2D(uScene, vUv);
    if (uVignette > 0.001) {
      vec2 e = abs(vUv - 0.5) * 2.0;
      float edgeFade = smoothstep(0.76, 1.05, max(e.x, e.y));
      base.a *= (1.0 - edgeFade * 0.42 * uVignette);
    }

    // Fast path 2: Outside lens
    if (uLensOpacity < 0.001 || uLensRadius < 1.0 || r > 1.03) {
      gl_FragColor = base;
      return;
    }

    float inside = (1.0 - smoothstep(0.99, 1.005, r)) * uLensOpacity;
    vec2 dir = delta / max(dist, 0.0001);

    // Convex radial refraction stretch along outer 38% glass bevel
    float rimCurve = smoothstep(0.62, 0.995, r);
    float stretch = pow(rimCurve, 1.85) * (uLensRadius * 0.27);
    vec2 offsetUv = (dir * stretch) / uResolution;
    vec2 perp = vec2(-dir.y, dir.x) * (3.5 / uResolution);

    vec2 uvG = clamp(vUv - offsetUv, 0.002, 0.998);
    vec2 uvR = clamp(vUv - offsetUv * 1.06 + perp * 0.5, 0.002, 0.998);
    vec2 uvB = clamp(vUv - offsetUv * 0.94 - perp * 0.5, 0.002, 0.998);
    vec2 uvBlur1 = clamp(uvG + perp * 1.4, 0.002, 0.998);
    vec2 uvBlur2 = clamp(uvG - perp * 1.4, 0.002, 0.998);

    vec4 sR = texture2D(uScene, uvR);
    vec4 sG = texture2D(uScene, uvG);
    vec4 sB = texture2D(uScene, uvB);
    vec4 sSoft = (texture2D(uScene, uvBlur1) + texture2D(uScene, uvBlur2)) * 0.5;

    vec3 refractedRgb = mix(vec3(sR.r, sG.g, sB.b), sSoft.rgb, 0.36 * (1.0 - rimCurve * 0.5));
    float refractedA = (sR.a + sG.a + sB.a + sSoft.a) * 0.25;
    vec3 behindGlass = mix(uLensColor, refractedRgb, refractedA);

    float coreFrost = mix(0.96, 0.24, smoothstep(0.60, 0.95, r));
    coreFrost = mix(coreFrost, 0.72, smoothstep(0.955, 1.0, r));
    vec3 lensBody = mix(behindGlass, uLensColor, coreFrost);

    // Top-lit specular glass bevel highlight
    float topLight = clamp(dot(dir, vec2(0.0, 1.0)) * 0.5 + 0.5, 0.0, 1.0);
    float bevelRing = smoothstep(0.94, 0.988, r) * (1.0 - smoothstep(0.992, 1.004, r));
    vec3 sheenColor = uIsDark > 0.5 ? vec3(0.42, 0.42, 0.46) : vec3(1.0);
    lensBody += sheenColor * (bevelRing * (0.16 + topLight * 0.26));

    float edgeShadow = smoothstep(0.985, 1.0, r) * (1.0 - smoothstep(1.0, 1.028, r));
    vec4 outColor = mix(base, vec4(lensBody, 0.99), inside);
    outColor.rgb = mix(
      outColor.rgb,
      uIsDark > 0.5 ? vec3(0.24) : vec3(0.76),
      edgeShadow * 0.22 * uLensOpacity
    );

    gl_FragColor = outColor;
  }
`;
