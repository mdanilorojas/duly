/* eslint-disable no-restricted-syntax -- los `glow` son colores de identidad
   por agente para el resplandor WebGL; no son tokens semánticos del tema. */
// Legal & Compliance Agents V001 — sector "Legal" de la galería por industria.
// Portado desde la referencia visual `galer_a_de_agentes_ia (1).html`
// (24 agentes / 4 sectores). Reutiliza el mismo AgentCore WebGL de Neural
// Cores — solo cambia la data. Los 6 de este sector son completamente
// nuevos (ninguno reusado de neural-agents.ts).

import type { NeuralAgent } from "./neural-agents.js";

export const LEGAL_AGENTS: NeuralAgent[] = [
  {
    id: "LX-11",
    name: "Lex Validator",
    role: "Auditoría de Smart Contracts. Sello de inmutabilidad y firmas.",
    glow: "rgba(255, 215, 0, 0.4)",
    glsl: `
      vec3 getColor(vec2 uv, float t, float act, float d) {
        t *= (1.0 + act * 3.0);
        float angle = atan(uv.y, uv.x);
        float ring = smoothstep(0.8, 0.82, d) * smoothstep(0.98, 0.96, d);
        float marks = step(0.5, sin(angle * 40.0));
        float scanner = smoothstep(0.95, 1.0, sin(uv.y * 15.0 - t * 4.0));
        vec3 bg = vec3(0.05, 0.04, 0.02);
        vec3 gold = vec3(0.9, 0.7, 0.1);
        vec3 whiteLaser = vec3(1.0, 0.95, 0.8);
        vec3 col = mix(bg, gold, ring * marks);
        col += whiteLaser * scanner * (0.4 + act) * smoothstep(1.0, 0.2, d);
        col += gold * smoothstep(0.4, 0.0, d) * (0.8 + act);
        return col;
      }
    `,
  },
  {
    id: "DS-12",
    name: "Docu-Specter",
    role: "Extracción OCR profunda. Rastreo de cláusulas y jurisprudencia.",
    glow: "rgba(0, 255, 180, 0.4)",
    glsl: `
      vec3 getColor(vec2 uv, float t, float act, float d) {
        t *= (1.0 + act * 2.5);
        vec2 grid = fract(uv * 12.0);
        float points = smoothstep(0.4, 0.2, length(grid - 0.5));
        float angle = atan(uv.y, uv.x);
        float radar = smoothstep(0.0, 0.15, fract(angle / 6.2831 - t * 0.3));
        vec3 bg = vec3(0.01, 0.04, 0.06);
        vec3 termGreen = vec3(0.1, 0.9, 0.4);
        vec3 highlight = vec3(0.8, 1.0, 0.9);
        vec3 col = mix(bg, termGreen, points * 0.3);
        col += highlight * radar * points * (1.0 + act * 2.0);
        col += termGreen * smoothstep(1.0, 0.98, d) * smoothstep(0.96, 0.98, d);
        return col;
      }
    `,
  },
  {
    id: "AC-13",
    name: "Aegis Compliance",
    role: "Escudo normativo. Bloquea inconsistencias y protege contra penalizaciones.",
    glow: "rgba(80, 120, 255, 0.5)",
    glsl: `
      vec3 getColor(vec2 uv, float t, float act, float d) {
        t *= (1.0 + act * 4.0);
        float s = sin(t * 0.2), c = cos(t * 0.2);
        vec2 p = mat2(c, -s, s, c) * uv;
        float shieldDist = abs(p.x) + abs(p.y);
        float pulse = sin(shieldDist * 20.0 - t * 2.0) * 0.5 + 0.5;
        float edges = smoothstep(0.1, 0.0, abs(fract(shieldDist * 6.0) - 0.5));
        vec3 bg = vec3(0.02, 0.05, 0.15);
        vec3 cobalt = vec3(0.2, 0.4, 1.0);
        vec3 silver = vec3(0.9, 0.95, 1.0);
        vec3 col = mix(bg, cobalt, pulse * 0.4);
        col += silver * edges * (0.3 + act * 0.8);
        col += silver * smoothstep(0.3, 0.0, shieldDist) * (0.7 + act);
        return col;
      }
    `,
  },
  {
    id: "VR-14",
    name: "Veritas Core",
    role: "Arbitraje imparcial algorítmico. Pondera evidencias en disputas.",
    glow: "rgba(200, 50, 255, 0.4)",
    glsl: `
      vec3 getColor(vec2 uv, float t, float act, float d) {
        t *= (0.8 + act * 1.5);
        float s = sin(t * 0.5), c = cos(t * 0.5);
        vec2 p = mat2(c, -s, s, c) * uv;
        float eq = smoothstep(-0.15, 0.15, p.x + fbm(p * 4.0 + t) * 0.3);
        vec3 darkSide = vec3(0.05, 0.0, 0.15);
        vec3 lightSide = vec3(0.8, 0.9, 1.0);
        vec3 col = mix(darkSide, lightSide, eq);
        float orb1 = smoothstep(0.25, 0.1, length(p - vec2(-0.4, 0.0)));
        float orb2 = smoothstep(0.25, 0.1, length(p - vec2(0.4, 0.0)));
        col = mix(col, lightSide, orb1);
        col = mix(col, darkSide, orb2);
        vec3 truthGlow = vec3(0.7, 0.2, 1.0);
        col += truthGlow * act * smoothstep(1.0, 0.4, d);
        return col;
      }
    `,
  },
  {
    id: "CA-15",
    name: "Chrono-Audit",
    role: "Análisis forense de versiones. Rastrea líneas temporales documentales.",
    glow: "rgba(210, 105, 30, 0.5)",
    glsl: `
      vec3 getColor(vec2 uv, float t, float act, float d) {
        t *= (0.6 + act * 2.5);
        float r = d * 25.0;
        float anomaly = fbm(uv * 4.0 - t * 0.5);
        float rings = sin(r + anomaly * 2.0) * 0.5 + 0.5;
        vec3 bg = vec3(0.08, 0.03, 0.01);
        vec3 bronze = vec3(0.7, 0.4, 0.1);
        vec3 amber = vec3(1.0, 0.7, 0.0);
        vec3 col = mix(bg, bronze, smoothstep(0.2, 0.8, rings));
        float sweep = smoothstep(0.98, 1.0, sin(atan(uv.y, uv.x) * 2.0 + t * 3.0));
        col += amber * sweep * rings * (0.8 + act * 1.5);
        col += amber * smoothstep(0.15, 0.0, d) * (0.5 + act);
        return col;
      }
    `,
  },
  {
    id: "EQ-16",
    name: "Equitas Node",
    role: "Alineación regulatoria matemática. Cuadre y cruce de datos fiscales.",
    glow: "rgba(255, 200, 50, 0.4)",
    glsl: `
      vec3 getColor(vec2 uv, float t, float act, float d) {
        t *= (0.5 + act * 2.0);
        vec2 p = mat2(cos(t * 0.2), -sin(t * 0.2), sin(t * 0.2), cos(t * 0.2)) * uv;
        vec2 grid = abs(fract(p * 8.0) - 0.5);
        float lines = smoothstep(0.1, 0.05, min(grid.x, grid.y));
        float inters = smoothstep(0.05, 0.0, length(grid));
        vec3 bg = vec3(0.05, 0.04, 0.02);
        vec3 gold = vec3(0.8, 0.6, 0.1);
        vec3 glow = vec3(1.0, 0.9, 0.5);
        vec3 col = mix(bg, gold, lines * 0.5);
        col += glow * inters * (1.0 + act * 2.0) * smoothstep(1.0, 0.2, d);
        return col;
      }
    `,
  },
];
