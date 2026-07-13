/* eslint-disable no-restricted-syntax -- los `glow` son colores de identidad
   por agente para el resplandor WebGL; no son tokens semánticos del tema. */
// Petróleo & Energía Agents V001 — sector "Petroleo" de la galería por
// industria. Portado desde `galer_a_de_agentes_ia (1).html`. 3 de los 6 son
// shaders reusados de neural-agents.ts, renombrados/re-roleados para este
// sector (glsl/glow sin cambios); 3 son completamente nuevos.

import type { NeuralAgent } from "./neural-agents.js";

export const PETROLEUM_AGENTS: NeuralAgent[] = [
  {
    // Reusado de neural-agents.ts (IG-02 "Ignis Prime") — mismo shader, rol actualizado.
    id: "IG-02",
    name: "Ignis Prime",
    role: "Control Termodinámico. Presión de pozos y control de purga.",
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
    // Reusado de neural-agents.ts (VD-05 "Void Walker") — mismo shader, renombrado para este sector.
    id: "VD-05",
    name: "Abyssal Extract",
    role: "Dinámica de fluidos densos. Perforación y presiones extremas.",
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
    // Reusado de neural-agents.ts (EC-10 "Echo Vanguard") — mismo shader, renombrado para este sector.
    id: "EC-10",
    name: "Seismic Resonator",
    role: "Análisis acústico del subsuelo. Resonancia sísmica de reservas.",
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
  {
    id: "LS-17",
    name: "Litho-Scanner",
    role: "Escaneo geológico de estratos. Identificación de vetas de hidrocarburos.",
    glow: "rgba(200, 100, 0, 0.4)",
    glsl: `
      vec3 getColor(vec2 uv, float t, float act, float d) {
        t *= (1.0 + act * 2.0);
        float shift = fbm(uv * 2.0 + t * 0.2);
        float layers = sin((uv.y + shift) * 20.0);
        layers = smoothstep(0.0, 0.2, abs(layers));
        vec3 darkOil = vec3(0.05, 0.02, 0.01);
        vec3 amber = vec3(0.8, 0.4, 0.0);
        vec3 col = mix(amber, darkOil, layers);
        col += amber * smoothstep(0.5, 0.0, d) * act;
        return col;
      }
    `,
  },
  {
    id: "FC-18",
    name: "Flow Catalyst",
    role: "Optimización de crudo viscoso. Control de refinamiento y mezclas.",
    glow: "rgba(255, 150, 0, 0.4)",
    glsl: `
      vec3 getColor(vec2 uv, float t, float act, float d) {
        t *= (1.5 + act * 3.0);
        vec2 p1 = vec2(sin(t * 0.8) * 0.4, cos(t * 0.5) * 0.4);
        vec2 p2 = vec2(cos(t * 1.1) * 0.3, sin(t * 0.9) * 0.3);
        float blob = (0.1 / length(uv - p1)) + (0.1 / length(uv - p2)) + (1.0 - d) * 0.5;
        float edge = smoothstep(0.8, 1.0, blob);
        vec3 bg = vec3(0.1, 0.05, 0.0);
        vec3 gold = vec3(1.0, 0.6, 0.1);
        vec3 col = mix(bg, gold, edge);
        col += vec3(1.0, 0.8, 0.3) * smoothstep(1.2, 1.5, blob) * (0.5 + act);
        return col;
      }
    `,
  },
  {
    id: "FS-19",
    name: "Flare Sentinel",
    role: "Monitor de mecheros de gas. Gestión de emisiones e ignición.",
    glow: "rgba(255, 50, 0, 0.5)",
    glsl: `
      vec3 getColor(vec2 uv, float t, float act, float d) {
        t *= (2.0 + act * 4.0);
        vec2 p = uv + vec2(0.0, t * 0.5);
        float fire = fbm(p * 4.0);
        float mask = smoothstep(0.8, 0.0, length(vec2(uv.x * 2.0, uv.y + 0.2)));
        fire *= mask;
        vec3 dark = vec3(0.0);
        vec3 red = vec3(0.8, 0.1, 0.0);
        vec3 yellow = vec3(1.0, 0.8, 0.1);
        vec3 col = mix(dark, red, smoothstep(0.1, 0.5, fire));
        col = mix(col, yellow, smoothstep(0.5, 0.9, fire) * (1.0 + act));
        col += vec3(0.1, 0.3, 0.8) * smoothstep(0.3, 0.0, length(uv + vec2(0.0, 0.5))) * (1.0 + act);
        return col;
      }
    `,
  },
];
