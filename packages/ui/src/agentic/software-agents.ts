/* eslint-disable no-restricted-syntax -- los `glow` son colores de identidad
   por agente para el resplandor WebGL; no son tokens semánticos del tema. */
// Software & Redes Agents V001 — sector "Software" de la galería por
// industria. Portado desde `galer_a_de_agentes_ia (1).html`. 4 de los 6 son
// shaders reusados de neural-agents.ts (mismo nombre, rol actualizado para
// este sector); 2 son completamente nuevos.

import type { NeuralAgent } from "./neural-agents.js";

export const SOFTWARE_AGENTS: NeuralAgent[] = [
  {
    // Reusado de neural-agents.ts (AE-01) — mismo shader, rol actualizado.
    id: "AE-01",
    name: "Aura Orchestrator",
    role: "Vórtice de Datos. Balanceador de flujos y microservicios.",
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
    // Reusado de neural-agents.ts (NX-03) — mismo shader, rol actualizado.
    id: "NX-03",
    name: "Nexus Node",
    role: "Modelos de Lenguaje (LLMs) y modulación de redes neuronales.",
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
    // Reusado de neural-agents.ts (CP-04) — mismo shader, rol actualizado.
    id: "CP-04",
    name: "Cipher Sentinel",
    role: "Ciberseguridad. Encriptación en tiempo real y protocolos Zero-Trust.",
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
    // Reusado de neural-agents.ts (AX-09) — mismo shader, rol actualizado.
    id: "AX-09",
    name: "Anomaly X",
    role: "QA Automático. Polimorfismo y detección de bugs en código.",
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
    id: "QM-20",
    name: "Quantum Mesh",
    role: "Red Neuronal de Nodos. Estabilizador de clústeres distribuidos.",
    glow: "rgba(0, 200, 255, 0.5)",
    glsl: `
      vec3 getColor(vec2 uv, float t, float act, float d) {
        t *= (1.0 + act * 3.0);
        vec2 p = uv * 6.0;
        vec2 id = floor(p);
        vec2 g = fract(p) - 0.5;
        vec2 move = vec2(sin(t + id.x), cos(t + id.y)) * 0.2;
        float point = smoothstep(0.1, 0.02, length(g - move));
        vec3 bg = vec3(0.02, 0.05, 0.1);
        vec3 cyan = vec3(0.0, 0.8, 1.0);
        vec3 col = mix(bg, cyan, point * (0.5 + act));
        float wave = sin(uv.x * 10.0 + t) * cos(uv.y * 10.0 - t);
        col += vec3(0.5, 0.0, 1.0) * smoothstep(0.8, 1.0, wave) * 0.2;
        return col;
      }
    `,
  },
  {
    id: "HW-21",
    name: "Hash Weaver",
    role: "Procesamiento criptográfico. Anillos de datos y bloqueos de seguridad.",
    glow: "rgba(0, 255, 200, 0.4)",
    glsl: `
      vec3 getColor(vec2 uv, float t, float act, float d) {
        t *= (1.5 + act * 4.0);
        float angle = atan(uv.y, uv.x);
        float r = length(uv);
        float ringIdx = floor(r * 5.0);
        float speed = (ringIdx + 1.0) * (mod(ringIdx, 2.0) < 0.5 ? 1.0 : -1.0);
        float segments = floor((angle + t * speed) * (10.0 + ringIdx * 2.0) / 6.2831);
        float hashVal = hash(vec2(segments, ringIdx));
        float on = step(0.5, hashVal);
        float ringMask = step(0.1, fract(r * 5.0));
        vec3 bg = vec3(0.0);
        vec3 cyan = vec3(0.0, 1.0, 0.8);
        vec3 col = mix(bg, cyan, on * ringMask * smoothstep(1.0, 0.8, r));
        col += vec3(1.0) * smoothstep(0.2, 0.0, r) * (0.5 + act);
        return col;
      }
    `,
  },
];
