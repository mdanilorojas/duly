/* eslint-disable no-restricted-syntax -- los `glow` son colores de identidad
   por agente para el resplandor WebGL; no son tokens semánticos del tema. */
// Real Estate Agents V001 — "Property Intelligence"
// Roster de 6 agentes de IA para operaciones inmobiliarias / catastrales.
// Portado desde la referencia visual `predios-quito-arquitectura.html`
// (pipeline de consulta catastral: parse → fetch → geo bridge → color → render → revisión humana).
// Reutiliza el mismo AgentCore WebGL de V001 Neural Cores — solo cambia la data.

import type { NeuralAgent } from "./neural-agents.js";

export const REAL_ESTATE_AGENTS: NeuralAgent[] = [
  {
    id: "RE-01",
    name: "Cadastral Parser",
    role: "Normaliza IDs de predios y deduplica lotes de un batch en segundos.",
    glow: "rgba(35, 210, 215, 0.4)",
    glsl: `
      vec3 getColor(vec2 uv, float t, float act, float d) {
        t *= (1.0 + act * 2.0);
        vec2 grid = fract(uv * 6.0 + vec2(t * 0.1, 0.0)) - 0.5;
        float lines = smoothstep(0.46, 0.5, max(abs(grid.x), abs(grid.y)));
        vec3 dark = vec3(0.02, 0.08, 0.09);
        vec3 teal = vec3(0.13, 0.82, 0.84);
        vec3 col = mix(dark, teal, lines * (0.5 + act * 0.5));
        float core = smoothstep(0.6, 0.0, d);
        col = mix(col, vec3(0.85, 1.0, 1.0), core * (0.3 + act * 0.6));
        return col;
      }
    `,
  },
  {
    id: "RE-02",
    name: "Query Broker",
    role: "Orquesta la consulta en vivo al servidor catastral público.",
    glow: "rgba(108, 184, 255, 0.4)",
    glsl: `
      vec3 getColor(vec2 uv, float t, float act, float d) {
        t *= (1.2 + act * 3.0);
        float angle = atan(uv.y, uv.x);
        float pulse = fract(1.0 - d * 2.0 + t * 0.6);
        float ring = smoothstep(0.08, 0.0, abs(pulse - 0.5));
        vec3 dark = vec3(0.02, 0.05, 0.12);
        vec3 sky = vec3(0.27, 0.53, 1.0);
        vec3 col = mix(dark, sky, ring * (0.6 + act * 0.4));
        float core = smoothstep(0.5, 0.0, d);
        col = mix(col, vec3(0.85, 0.92, 1.0), core * (0.3 + act * 0.7));
        return col + sky * 0.15 * sin(angle * 4.0 + t);
      }
    `,
  },
  {
    id: "RE-03",
    name: "GeoBridge",
    role: "Traduce la respuesta ArcGIS a polígonos GeoJSON validados.",
    glow: "rgba(57, 224, 160, 0.4)",
    glsl: `
      vec3 getColor(vec2 uv, float t, float act, float d) {
        t *= (0.8 + act * 2.0);
        vec2 p = uv * 2.5;
        float q = fbm(p - t * 0.25);
        float r = fbm(p + q + t * 0.15);
        vec3 dark = vec3(0.01, 0.1, 0.08);
        vec3 jade = vec3(0.22, 0.88, 0.63);
        vec3 col = mix(dark, jade, r);
        float core = smoothstep(0.55, 0.0, d);
        col = mix(col, vec3(0.85, 1.0, 0.92), core * (0.4 + act * 0.6));
        return col;
      }
    `,
  },
  {
    id: "RE-04",
    name: "Status Colorizer",
    role: "Aplica el color de estatus legal a cada predio del lote.",
    glow: "rgba(232, 150, 26, 0.45)",
    glsl: `
      vec3 getColor(vec2 uv, float t, float act, float d) {
        t *= (1.5 + act * 3.5);
        float angle = atan(uv.y, uv.x);
        float wedge = fract(angle / 6.2831853 * 6.0 + t * 0.2);
        float band = step(0.5, wedge);
        vec3 dark = vec3(0.12, 0.06, 0.0);
        vec3 amber = vec3(0.91, 0.59, 0.1);
        vec3 col = mix(dark, amber, band * smoothstep(1.0, 0.2, d));
        float core = smoothstep(0.4, 0.0, d);
        col = mix(col, vec3(1.0, 0.95, 0.75), core * (0.4 + act * 0.6));
        return col;
      }
    `,
  },
  {
    id: "RE-05",
    name: "Map Renderer",
    role: "Pinta los predios sobre la imagen satelital y ajusta el viewport.",
    glow: "rgba(124, 140, 255, 0.4)",
    glsl: `
      vec3 getColor(vec2 uv, float t, float act, float d) {
        t *= (0.6 + act * 2.0);
        vec2 p = uv * 3.0;
        float f = sin(p.x + t) * cos(p.y - t * 0.8) * 0.5 + 0.5;
        vec3 dark = vec3(0.02, 0.02, 0.1);
        vec3 indigo = vec3(0.49, 0.55, 1.0);
        vec3 col = mix(dark, indigo, f);
        float core = smoothstep(0.6, 0.0, d);
        col = mix(col, vec3(0.9, 0.92, 1.0), core * (0.3 + act * 0.7));
        float rim = smoothstep(0.85, 0.98, d) * smoothstep(1.0, 0.95, d);
        return col + indigo * rim * (1.0 + act);
      }
    `,
  },
  {
    id: "RE-06",
    name: "Compliance Reviewer",
    role: "Marca nudos críticos y hereditarios para revisión humana.",
    glow: "rgba(199, 125, 255, 0.4)",
    glsl: `
      vec3 getColor(vec2 uv, float t, float act, float d) {
        t *= (1.0 + act * 2.5);
        float n = fbm(uv * 4.0 + t * 0.3);
        float veins = smoothstep(0.45, 0.55, n);
        vec3 dark = vec3(0.08, 0.02, 0.12);
        vec3 violet = vec3(0.78, 0.49, 1.0);
        vec3 col = mix(dark, violet, veins * (0.6 + act * 0.4));
        float core = smoothstep(0.35, 0.0, d);
        col = mix(col, vec3(0.95, 0.88, 1.0), core * (0.4 + act * 0.6));
        return col;
      }
    `,
  },
];
