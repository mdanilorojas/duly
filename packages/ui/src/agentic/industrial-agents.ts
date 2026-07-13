/* eslint-disable no-restricted-syntax -- los `glow` son colores de identidad
   por agente para el resplandor WebGL; no son tokens semánticos del tema. */
// Industrial & Logística Agents V001 — sector "Industrial" de la galería
// por industria. Portado desde `galer_a_de_agentes_ia (1).html`. 3 de los 6
// son shaders reusados de neural-agents.ts, renombrados/re-roleados para
// este sector; 3 son completamente nuevos.

import type { NeuralAgent } from "./neural-agents.js";

export const INDUSTRIAL_AGENTS: NeuralAgent[] = [
  {
    // Reusado de neural-agents.ts (SY-06 "Synapse Architect") — mismo shader, renombrado para este sector.
    id: "SY-06",
    name: "Grid Optimizer",
    role: "Sistemas SCADA. Enrutamiento de redes eléctricas y distribución.",
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
    // Reusado de neural-agents.ts (GA-07 "Gaia Catalyst") — mismo shader, renombrado para este sector.
    id: "GA-07",
    name: "Bio-Synthesizer",
    role: "Ingeniería de materiales químicos. Monitorización de reactores.",
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
    // Reusado de neural-agents.ts (TH-08 "Thread Weaver") — mismo shader, renombrado para este sector.
    id: "TH-08",
    name: "Logistics Weaver",
    role: "Cadenas de suministro. IoT Industrial y túneles de transporte.",
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
    id: "AT-22",
    name: "Aero-Turbine",
    role: "Sistemas mecánicos y ventilación. Modelado aerodinámico.",
    glow: "rgba(255, 200, 0, 0.4)",
    glsl: `
      vec3 getColor(vec2 uv, float t, float act, float d) {
        t *= (2.0 + act * 5.0);
        float angle = atan(uv.y, uv.x);
        float blades = sin(angle * 6.0 - t);
        blades = smoothstep(0.0, 0.1, blades);
        float inner = smoothstep(0.15, 0.2, d);
        vec3 bg = vec3(0.05, 0.05, 0.0);
        vec3 steel = vec3(0.7, 0.7, 0.5);
        vec3 yellow = vec3(1.0, 0.8, 0.0);
        vec3 col = mix(bg, steel, blades * inner);
        col = mix(col, yellow, smoothstep(0.15, 0.1, d));
        col += yellow * smoothstep(0.9, 1.0, d) * (0.5 + act);
        return col;
      }
    `,
  },
  {
    id: "TF-23",
    name: "Thermo-Forge",
    role: "Fundición e Industria pesada. Mapas de calor en maquinaria.",
    glow: "rgba(255, 50, 0, 0.4)",
    glsl: `
      vec3 getColor(vec2 uv, float t, float act, float d) {
        t *= (1.0 + act * 3.0);
        float f = fbm(uv * 3.0 - t * 0.5);
        float pulse = sin(d * 10.0 - t * 3.0) * 0.5 + 0.5;
        f = f * 0.8 + pulse * 0.2;
        vec3 dark = vec3(0.1, 0.05, 0.0);
        vec3 red = vec3(0.8, 0.2, 0.0);
        vec3 yellow = vec3(1.0, 0.9, 0.2);
        vec3 col = mix(dark, red, smoothstep(0.2, 0.6, f));
        col = mix(col, yellow, smoothstep(0.6, 0.9, f) * (1.0 + act * 0.5));
        return col;
      }
    `,
  },
  {
    id: "KG-24",
    name: "Kinetic Gear",
    role: "Automatización y robótica. Cálculos geométricos de engranajes.",
    glow: "rgba(200, 150, 50, 0.4)",
    glsl: `
      vec3 getColor(vec2 uv, float t, float act, float d) {
        t *= (1.0 + act * 2.5);
        float angle = atan(uv.y, uv.x);
        float teeth = sin(angle * 12.0 + t);
        float radius = 0.7 + teeth * 0.05;
        float gearMask = smoothstep(radius, radius - 0.02, d) * smoothstep(0.4, 0.42, d);
        vec3 bg = vec3(0.05, 0.05, 0.02);
        vec3 metal = vec3(0.8, 0.7, 0.2);
        vec3 bright = vec3(1.0, 0.9, 0.4);
        vec3 col = mix(bg, metal, gearMask);
        float shine = smoothstep(0.9, 1.0, sin(uv.x * 5.0 + uv.y * 5.0));
        col += bright * shine * gearMask * (0.5 + act);
        return col;
      }
    `,
  },
];
