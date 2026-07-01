/* eslint-disable no-restricted-syntax -- los `glow` son colores de identidad
   por agente para el resplandor WebGL; no son tokens semánticos del tema. */
// Neural Agents V001 — "Neural Cores"
// 10 WebGL shader cores (FBM + SDF) que representan agentes de IA.
// Portado desde la referencia visual `galer_a_de_agentes_ia.html`.
// La data es reutilizable: cada agente aporta su fragmento GLSL `getColor`.

export interface NeuralAgent {
  /** ID técnico corto, ej. "AE-01". */
  id: string;
  /** Nombre del agente. */
  name: string;
  /** Rol / descripción funcional. */
  role: string;
  /** Color de glow (rgba) usado para el resplandor del core. */
  glow: string;
  /** Fragmento GLSL: debe definir `vec3 getColor(vec2 uv, float t, float act, float d)`. */
  glsl: string;
}

/** Preámbulo GLSL común: precision, uniforms y ruido/FBM orgánico. */
export const SHADER_PREAMBLE = `
  #ifdef GL_ES
  precision highp float;
  #endif

  uniform float u_time;
  uniform vec2 u_resolution;
  uniform float u_activity;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

  float noise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p); vec2 u = f*f*(3.0-2.0*f);
    return mix(mix(hash(i+vec2(0.0,0.0)), hash(i+vec2(1.0,0.0)), u.x),
               mix(hash(i+vec2(0.0,1.0)), hash(i+vec2(1.0,1.0)), u.x), u.y);
  }

  float fbm(vec2 p) {
    float v = 0.0; float a = 0.5; mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
    for (int i = 0; i < 5; i++) { v += a * noise(p); p = rot * p * 2.0 + vec2(100.0); a *= 0.5; }
    return v;
  }
`;

/** Envuelve el `getColor` de un agente en un fragment shader completo con recorte circular. */
export function buildFragmentShader(getColorGlsl: string): string {
  return `
    ${SHADER_PREAMBLE}

    ${getColorGlsl}

    void main() {
      vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
      float d = length(uv);

      if (d > 1.0) { gl_FragColor = vec4(0.0); return; }

      vec3 col = getColor(uv, u_time, u_activity, d);
      col *= smoothstep(1.0, 0.3, d) * 0.8 + 0.4;
      float alpha = smoothstep(1.0, 0.96, d);
      gl_FragColor = vec4(col * alpha, alpha);
    }
  `;
}

/** Vertex shader trivial (quad de pantalla completa). */
export const VERTEX_SHADER = `attribute vec2 position; void main() { gl_Position = vec4(position, 0.0, 1.0); }`;

export const NEURAL_AGENTS: NeuralAgent[] = [
  {
    id: "AE-01",
    name: "Aura Orchestrator",
    role: "Vórtice cyan. Analizador de flujos de datos estructurados.",
    glow: "rgba(35, 210, 215, 0.4)",
    glsl: `
      vec3 getColor(vec2 uv, float t, float act, float d) {
        t *= (1.0 + act * 2.0);
        float angle = d * 2.0 - t * 0.5;
        float s = sin(angle), c = cos(angle);
        vec2 p = mat2(c, -s, s, c) * uv;
        float w = sin(p.x*6.+t)*cos(p.y*6.-t)*0.5 + sin(p.x*4.-t*1.5)*cos(p.y*4.+t*1.2)*0.5 + 0.5;
        vec3 base = mix(vec3(0.02, 0.08, 0.12), vec3(0.13, 0.82, 0.84), w);
        float core = smoothstep(0.7, 0.0, d);
        base = mix(base, vec3(0.9, 1.0, 1.0), pow(core, 2.0 - act) * (0.3 + act * 0.7));
        float rim = smoothstep(0.85, 0.98, d) * smoothstep(1.0, 0.95, d);
        return base + vec3(0.13, 0.82, 0.84) * rim * (1.0 + act * 1.5);
      }
    `,
  },
  {
    id: "IG-02",
    name: "Ignis Prime",
    role: "Plasma termodinámico. Procesos de alta latencia y purga.",
    glow: "rgba(255, 60, 0, 0.4)",
    glsl: `
      vec3 getColor(vec2 uv, float t, float act, float d) {
        t *= (1.5 + act * 3.0);
        vec2 p = uv * (3.0 - act);
        float q = fbm(p - t * 0.4);
        float r = fbm(p + q + t * 0.3);
        float f = fbm(p + r);
        vec3 dark = vec3(0.1, 0.0, 0.0);
        vec3 fire = vec3(1.0, 0.3, 0.0);
        vec3 coreC = vec3(1.0, 0.9, 0.2);
        vec3 col = mix(dark, fire, f * 1.5);
        float core = smoothstep(0.8, 0.0, d) * f;
        col = mix(col, coreC, core * (1.0 + act));
        return col;
      }
    `,
  },
  {
    id: "NX-03",
    name: "Nexus Node",
    role: "Anomalía Voronoi. Modulador de redes neuronales cuánticas.",
    glow: "rgba(180, 40, 255, 0.4)",
    glsl: `
      vec3 getColor(vec2 uv, float t, float act, float d) {
        t *= (0.5 + act * 1.5);
        vec2 p = uv * 5.0;
        float n = sin(p.x + t) * cos(p.y - t) + sin(p.x*1.5 - t*1.2) * cos(p.y*1.5 + t*0.8);
        n = smoothstep(0.0, 1.0, n * 0.5 + 0.5);
        vec3 dark = vec3(0.1, 0.0, 0.2);
        vec3 purple = vec3(0.7, 0.1, 1.0);
        vec3 pink = vec3(1.0, 0.2, 0.6);
        vec3 col = mix(dark, purple, n);
        col = mix(col, pink, smoothstep(0.8, 1.0, n) * (0.5 + act));
        float rim = smoothstep(0.7, 1.0, d);
        return col + pink * rim * (0.5 + act * 1.0);
      }
    `,
  },
  {
    id: "CP-04",
    name: "Cipher Sentinel",
    role: "Anillos topológicos. Encriptación en tiempo real y seguridad.",
    glow: "rgba(0, 255, 100, 0.4)",
    glsl: `
      vec3 getColor(vec2 uv, float t, float act, float d) {
        t *= (1.0 + act * 5.0);
        float r = d * 10.0;
        float rings = sin(r - t) * sin(r * 2.0 + t * 0.5);
        float glitch = step(0.9, hash(uv + t)) * act;
        rings += glitch * 2.0;
        vec3 bg = vec3(0.0, 0.1, 0.0);
        vec3 matrix = vec3(0.0, 1.0, 0.4);
        vec3 col = mix(bg, matrix, smoothstep(0.0, 0.2, rings));
        float core = smoothstep(0.3, 0.0, d);
        return mix(col, vec3(1.0), core * (0.5 + act));
      }
    `,
  },
  {
    id: "VD-05",
    name: "Void Walker",
    role: "Agujero negro y disco de acreción. Limpiador de memoria.",
    glow: "rgba(50, 0, 100, 0.6)",
    glsl: `
      vec3 getColor(vec2 uv, float t, float act, float d) {
        t *= (0.8 + act * 3.0);
        float angle = atan(uv.y, uv.x);
        float radius = d;
        float noiseVal = fbm(vec2(angle * 3.0 + t, radius * 10.0 - t));
        vec3 gold = vec3(0.9, 0.6, 0.1);
        vec3 violet = vec3(0.3, 0.0, 0.5);
        float eventHorizon = smoothstep(0.3, 0.35 - act*0.1, radius);
        vec3 col = mix(violet, gold, noiseVal);
        col *= eventHorizon;
        float rim = smoothstep(0.8, 1.0, radius);
        col += violet * rim * (1.0 + act);
        return col;
      }
    `,
  },
  {
    id: "SY-06",
    name: "Synapse Architect",
    role: "Tormenta eléctrica. Enrutador de decisiones de alta velocidad.",
    glow: "rgba(50, 150, 255, 0.5)",
    glsl: `
      vec3 getColor(vec2 uv, float t, float act, float d) {
        t *= (2.0 + act * 4.0);
        vec2 p = uv * 3.0;
        float f = fbm(p + fbm(p + t));
        float lightning = abs(sin(f * 10.0)) / (f * 5.0);
        lightning = clamp(lightning, 0.0, 1.0);
        vec3 bg = vec3(0.01, 0.02, 0.1);
        vec3 bolt = vec3(0.2, 0.6, 1.0);
        vec3 flash = vec3(1.0, 1.0, 1.0);
        vec3 col = mix(bg, bolt, lightning * 0.8);
        col = mix(col, flash, smoothstep(0.8, 1.0, lightning) * (0.5 + act));
        return col;
      }
    `,
  },
  {
    id: "GA-07",
    name: "Gaia Catalyst",
    role: "Bioluminiscencia suave. Regeneración y curación de código.",
    glow: "rgba(0, 255, 150, 0.3)",
    glsl: `
      vec3 getColor(vec2 uv, float t, float act, float d) {
        t *= (0.3 + act * 1.5);
        vec2 p = uv * 2.0;
        float q = fbm(p - t * 0.2);
        float r = fbm(p + q + t * 0.1);
        vec3 dark = vec3(0.0, 0.15, 0.1);
        vec3 bio = vec3(0.0, 0.9, 0.5);
        vec3 coreC = vec3(0.8, 1.0, 0.6);
        vec3 col = mix(dark, bio, r);
        float breath = sin(t * 2.0) * 0.5 + 0.5;
        float core = smoothstep(0.6 + breath*0.1, 0.0, d);
        col = mix(col, coreC, core * (0.4 + act * 0.6));
        return col;
      }
    `,
  },
  {
    id: "TH-08",
    name: "Thread Weaver",
    role: "Túnel hiperespacial synthwave. Transmisor a otras dimensiones.",
    glow: "rgba(255, 0, 255, 0.4)",
    glsl: `
      vec3 getColor(vec2 uv, float t, float act, float d) {
        t *= (1.5 + act * 4.0);
        float angle = atan(uv.y, uv.x);
        float radius = d;
        float stripes = sin(angle * 12.0 + sin(t)*2.0) * 0.5 + 0.5;
        float tunnel = fract(1.0 / (radius + 0.01) + t);
        vec3 bg = vec3(0.1, 0.0, 0.2);
        vec3 cyan = vec3(0.0, 1.0, 1.0);
        vec3 magenta = vec3(1.0, 0.0, 1.0);
        vec3 col = mix(bg, cyan, stripes * smoothstep(0.0, 0.5, tunnel));
        col = mix(col, magenta, (1.0-stripes) * smoothstep(0.5, 1.0, tunnel));
        col += vec3(1.0) * smoothstep(0.2, 0.0, d) * (1.0 + act);
        return col;
      }
    `,
  },
  {
    id: "AX-09",
    name: "Anomaly X",
    role: "Metabola cromática. Adaptabilidad pura y polimorfismo.",
    glow: "rgba(200, 200, 255, 0.4)",
    glsl: `
      vec3 getColor(vec2 uv, float t, float act, float d) {
        t *= (0.5 + act * 2.0);
        vec2 p = uv * 1.5;
        float r = fbm(p + t);
        float g = fbm(p + t * 1.1 + 0.1);
        float b = fbm(p + t * 1.2 + 0.2);
        vec3 base = vec3(r, g, b);
        vec3 silver = vec3(0.8, 0.85, 0.9);
        vec3 col = mix(vec3(0.1), silver, length(base) * 0.6);
        col += vec3(r*g, g*b, b*r) * 2.0 * (0.5 + act);
        return col;
      }
    `,
  },
  {
    id: "EC-10",
    name: "Echo Vanguard",
    role: "Resonancia armónica. Transforma ruido acústico en data estructurada.",
    glow: "rgba(255, 200, 50, 0.4)",
    glsl: `
      vec3 getColor(vec2 uv, float t, float act, float d) {
        t *= (2.0 + act * 4.0);
        float r = d * 15.0;
        float angle = atan(uv.y, uv.x);
        float wave = sin(r - t) * cos(angle * 6.0 + t);
        wave = abs(wave);
        vec3 bg = vec3(0.1, 0.05, 0.0);
        vec3 gold = vec3(1.0, 0.8, 0.2);
        vec3 white = vec3(1.0);
        vec3 col = mix(bg, gold, smoothstep(0.0, 0.2, wave));
        col = mix(col, white, smoothstep(0.8, 1.0, wave) * (0.5 + act));
        col += gold * smoothstep(0.3, 0.0, d) * (1.0 + act*2.0);
        return col;
      }
    `,
  },
];
