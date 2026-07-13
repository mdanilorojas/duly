# Agent Gallery por industria Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Portar los 24 agentes del HTML de referencia del usuario (4 sectores: Legal, Petróleo, Software, Industrial, 6 c/u) a `@duly/ui`, con una story de Storybook por sector, retirando la vista plana de 10 agentes sin clasificar, y arreglando el techo de ~16 contextos WebGL simultáneos del navegador en `agent-core.tsx` con un renderer compartido a nivel de módulo.

**Architecture:** 4 archivos de datos nuevos (`NeuralAgent[]` por sector, mismo patrón que `real-estate-agents.ts`) + 4 stories nuevas en `agent-gallery.stories.tsx` (reemplazan la story plana) + refactor de `agent-core.tsx` a un singleton de renderer compartido (un solo WebGL context maestro offscreen, cada instancia proyecta a su propio canvas 2D vía `drawImage`) + `AgentGalleryProps.agents` pasa de opcional-con-default a requerida.

**Tech Stack:** React, TypeScript, WebGL1 (GLSL ES 1.00), Vitest + Testing Library + jest-axe, Storybook 8.

## Global Constraints

- Cero dependencias runtime nuevas.
- `AgentCoreProps` (API pública de `AgentCore`) no cambia — ningún consumidor existente se entera del refactor interno.
- `NEURAL_AGENTS` en `neural-agents.ts` no se reordena ni se le quitan/agregan entradas — `agent-consent-card.stories.tsx` lo consume por índice (`NEURAL_AGENTS[1]`, `[5]`, `[6]`, `[7]`).
- `real-estate-agents.ts` / `property-intelligence-console.tsx`: sin cambios.
- Los 4 archivos de datos de sector siguen el patrón exacto de `real-estate-agents.ts`: comentario de cabecera + `/* eslint-disable no-restricted-syntax */` para los `glow` literales + export `const SECTOR_AGENTS: NeuralAgent[]` plano.
- `name`/`role` de cada agente son contenido de instancia (igual que en `real-estate-agents.ts`) — se portan tal cual del HTML de referencia, en español, sin pasar por el sistema de copy/i18n (ese gobierna chrome del DS, no datos de consumidor).
- Ningún shader se re-diseña: los reusados copian el `glsl`/`glow` original byte a byte, solo cambia `name`/`role` donde el HTML de referencia lo hizo.

---

### Task 1: `legal-agents.ts` — 6 agentes nuevos (Legal & Compliance)

**Files:**
- Create: `packages/ui/src/agentic/legal-agents.ts`
- Create: `packages/ui/src/agentic/legal-agents.test.ts`

**Interfaces:**
- Consumes: `type NeuralAgent` desde `packages/ui/src/agentic/neural-agents.js`; `buildFragmentShader`, `SHADER_PREAMBLE` (solo en el test).
- Produces: `export const LEGAL_AGENTS: NeuralAgent[]` (6 elementos) — consumido por Task 5.

- [ ] **Step 1: Escribir `legal-agents.ts`**

```ts
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
```

- [ ] **Step 2: Escribir `legal-agents.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { LEGAL_AGENTS } from "./legal-agents.js";
import { buildFragmentShader, SHADER_PREAMBLE } from "./neural-agents.js";

describe("legal-agents data", () => {
  it("has 6 agents", () => {
    expect(LEGAL_AGENTS).toHaveLength(6);
  });

  it("all ids are unique", () => {
    const ids = LEGAL_AGENTS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every agent defines getColor and non-empty name/role/glow", () => {
    for (const a of LEGAL_AGENTS) {
      expect(a.glsl).toContain("vec3 getColor(");
      expect(a.name.length).toBeGreaterThan(0);
      expect(a.role.length).toBeGreaterThan(0);
      expect(a.glow).toMatch(/^rgba\(/);
    }
  });

  it("shaders compile against the shared preamble wrapper", () => {
    const src = buildFragmentShader(LEGAL_AGENTS[0].glsl);
    expect(src).toContain(SHADER_PREAMBLE.trim().slice(0, 20));
    expect(src).toContain("void main()");
  });
});
```

- [ ] **Step 3: Correr los tests**

Run: `cd "C:\dev\Duly DS" && pnpm --filter @duly/ui exec vitest run src/agentic/legal-agents.test.ts`
Expected: 4 tests PASS.

- [ ] **Step 4: Commit**

```bash
git add packages/ui/src/agentic/legal-agents.ts packages/ui/src/agentic/legal-agents.test.ts
git commit -m "feat(agentic): add Legal & Compliance sector agents (6, all new)"
```

---

### Task 2: `petroleum-agents.ts` — 3 reusados + 3 nuevos (Petróleo & Energía)

**Files:**
- Create: `packages/ui/src/agentic/petroleum-agents.ts`
- Create: `packages/ui/src/agentic/petroleum-agents.test.ts`

**Interfaces:**
- Consumes: `type NeuralAgent` desde `neural-agents.js`.
- Produces: `export const PETROLEUM_AGENTS: NeuralAgent[]` (6 elementos) — consumido por Task 5.

- [ ] **Step 1: Escribir `petroleum-agents.ts`**

```ts
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
        float eventHorizon = smoothstep(0.3, 0.35 - act * 0.1, radius);
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
        col += gold * smoothstep(0.3, 0.0, d) * (1.0 + act * 2.0);
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
```

- [ ] **Step 2: Escribir `petroleum-agents.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { PETROLEUM_AGENTS } from "./petroleum-agents.js";
import { buildFragmentShader, SHADER_PREAMBLE } from "./neural-agents.js";

describe("petroleum-agents data", () => {
  it("has 6 agents", () => {
    expect(PETROLEUM_AGENTS).toHaveLength(6);
  });

  it("all ids are unique", () => {
    const ids = PETROLEUM_AGENTS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every agent defines getColor and non-empty name/role/glow", () => {
    for (const a of PETROLEUM_AGENTS) {
      expect(a.glsl).toContain("vec3 getColor(");
      expect(a.name.length).toBeGreaterThan(0);
      expect(a.role.length).toBeGreaterThan(0);
      expect(a.glow).toMatch(/^rgba\(/);
    }
  });

  it("shaders compile against the shared preamble wrapper", () => {
    const src = buildFragmentShader(PETROLEUM_AGENTS[0].glsl);
    expect(src).toContain(SHADER_PREAMBLE.trim().slice(0, 20));
    expect(src).toContain("void main()");
  });
});
```

- [ ] **Step 3: Correr los tests**

Run: `cd "C:\dev\Duly DS" && pnpm --filter @duly/ui exec vitest run src/agentic/petroleum-agents.test.ts`
Expected: 4 tests PASS.

- [ ] **Step 4: Commit**

```bash
git add packages/ui/src/agentic/petroleum-agents.ts packages/ui/src/agentic/petroleum-agents.test.ts
git commit -m "feat(agentic): add Petroleum & Energy sector agents (3 reused, 3 new)"
```

---

### Task 3: `software-agents.ts` — 4 reusados + 2 nuevos (Software & Redes)

**Files:**
- Create: `packages/ui/src/agentic/software-agents.ts`
- Create: `packages/ui/src/agentic/software-agents.test.ts`

**Interfaces:**
- Consumes: `type NeuralAgent` desde `neural-agents.js`.
- Produces: `export const SOFTWARE_AGENTS: NeuralAgent[]` (6 elementos) — consumido por Task 5.

- [ ] **Step 1: Escribir `software-agents.ts`**

```ts
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
```

- [ ] **Step 2: Escribir `software-agents.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { SOFTWARE_AGENTS } from "./software-agents.js";
import { buildFragmentShader, SHADER_PREAMBLE } from "./neural-agents.js";

describe("software-agents data", () => {
  it("has 6 agents", () => {
    expect(SOFTWARE_AGENTS).toHaveLength(6);
  });

  it("all ids are unique", () => {
    const ids = SOFTWARE_AGENTS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every agent defines getColor and non-empty name/role/glow", () => {
    for (const a of SOFTWARE_AGENTS) {
      expect(a.glsl).toContain("vec3 getColor(");
      expect(a.name.length).toBeGreaterThan(0);
      expect(a.role.length).toBeGreaterThan(0);
      expect(a.glow).toMatch(/^rgba\(/);
    }
  });

  it("shaders compile against the shared preamble wrapper", () => {
    const src = buildFragmentShader(SOFTWARE_AGENTS[0].glsl);
    expect(src).toContain(SHADER_PREAMBLE.trim().slice(0, 20));
    expect(src).toContain("void main()");
  });
});
```

- [ ] **Step 3: Correr los tests**

Run: `cd "C:\dev\Duly DS" && pnpm --filter @duly/ui exec vitest run src/agentic/software-agents.test.ts`
Expected: 4 tests PASS.

- [ ] **Step 4: Commit**

```bash
git add packages/ui/src/agentic/software-agents.ts packages/ui/src/agentic/software-agents.test.ts
git commit -m "feat(agentic): add Software & Networks sector agents (4 reused, 2 new)"
```

---

### Task 4: `industrial-agents.ts` — 3 reusados + 3 nuevos (Industrial & Logística)

**Files:**
- Create: `packages/ui/src/agentic/industrial-agents.ts`
- Create: `packages/ui/src/agentic/industrial-agents.test.ts`

**Interfaces:**
- Consumes: `type NeuralAgent` desde `neural-agents.js`.
- Produces: `export const INDUSTRIAL_AGENTS: NeuralAgent[]` (6 elementos) — consumido por Task 5.

- [ ] **Step 1: Escribir `industrial-agents.ts`**

```ts
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
```

- [ ] **Step 2: Escribir `industrial-agents.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { INDUSTRIAL_AGENTS } from "./industrial-agents.js";
import { buildFragmentShader, SHADER_PREAMBLE } from "./neural-agents.js";

describe("industrial-agents data", () => {
  it("has 6 agents", () => {
    expect(INDUSTRIAL_AGENTS).toHaveLength(6);
  });

  it("all ids are unique", () => {
    const ids = INDUSTRIAL_AGENTS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every agent defines getColor and non-empty name/role/glow", () => {
    for (const a of INDUSTRIAL_AGENTS) {
      expect(a.glsl).toContain("vec3 getColor(");
      expect(a.name.length).toBeGreaterThan(0);
      expect(a.role.length).toBeGreaterThan(0);
      expect(a.glow).toMatch(/^rgba\(/);
    }
  });

  it("shaders compile against the shared preamble wrapper", () => {
    const src = buildFragmentShader(INDUSTRIAL_AGENTS[0].glsl);
    expect(src).toContain(SHADER_PREAMBLE.trim().slice(0, 20));
    expect(src).toContain("void main()");
  });
});
```

- [ ] **Step 3: Correr los tests**

Run: `cd "C:\dev\Duly DS" && pnpm --filter @duly/ui exec vitest run src/agentic/industrial-agents.test.ts`
Expected: 4 tests PASS.

- [ ] **Step 4: Commit**

```bash
git add packages/ui/src/agentic/industrial-agents.ts packages/ui/src/agentic/industrial-agents.test.ts
git commit -m "feat(agentic): add Industrial & Logistics sector agents (3 reused, 3 new)"
```

---

### Task 5: Stories por sector — reemplazar la vista plana

**Files:**
- Modify: `packages/ui/src/agentic/agent-gallery.stories.tsx` (reescritura completa del archivo)

**Interfaces:**
- Consumes: `LEGAL_AGENTS` (Task 1), `PETROLEUM_AGENTS` (Task 2), `SOFTWARE_AGENTS` (Task 3), `INDUSTRIAL_AGENTS` (Task 4), `NEURAL_AGENTS` (ya existente), `AgentGallery`/`AgentCard` (ya existentes, sin cambios de API en este task — Task 8 los cambia después).
- Produces: nada que otro task consuma — es una hoja del árbol de dependencias.

- [ ] **Step 1: Reemplazar el contenido completo de `agent-gallery.stories.tsx`**

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { AgentGallery } from "./agent-gallery.js";
import { AgentCard } from "./agent-card.js";
import { NEURAL_AGENTS } from "./neural-agents.js";
import { LEGAL_AGENTS } from "./legal-agents.js";
import { PETROLEUM_AGENTS } from "./petroleum-agents.js";
import { SOFTWARE_AGENTS } from "./software-agents.js";
import { INDUSTRIAL_AGENTS } from "./industrial-agents.js";

const meta: Meta<typeof AgentGallery> = {
  title: "Agentic/Agent Gallery/V002 By Industry",
  component: AgentGallery,
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "dark" },
  },
};
export default meta;

type S = StoryObj<typeof AgentGallery>;

export const LegalCompliance: S = {
  name: "Legal & Compliance",
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <AgentGallery
        agents={LEGAL_AGENTS}
        title="Legal & Compliance"
        subtitle="6 WebGL Shaders • Jurisprudencia & Compliance"
      />
    </div>
  ),
};

export const PetroleumEnergy: S = {
  name: "Petróleo & Energía",
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <AgentGallery
        agents={PETROLEUM_AGENTS}
        title="Petróleo & Energía"
        subtitle="6 WebGL Shaders • Oil & Gas Operations"
      />
    </div>
  ),
};

export const SoftwareNetworks: S = {
  name: "Software & Redes",
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <AgentGallery
        agents={SOFTWARE_AGENTS}
        title="Software & Redes"
        subtitle="6 WebGL Shaders • Infra & Networks"
      />
    </div>
  ),
};

export const Industrial: S = {
  name: "Industrial & Logística",
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <AgentGallery
        agents={INDUSTRIAL_AGENTS}
        title="Industrial & Logística"
        subtitle="6 WebGL Shaders • Manufacturing & Logistics"
      />
    </div>
  ),
};

export const SingleCard: S = {
  render: () => (
    <div className="grid min-h-screen place-items-center bg-bg-base p-12">
      <div className="w-full max-w-[320px]">
        <AgentCard agent={NEURAL_AGENTS[0]} />
      </div>
    </div>
  ),
};
```

Nota: este archivo pasa `agents={...}` explícito en las 4 stories de sector, así que sigue compilando igual antes y después de que Task 8 quite el default de `AgentGalleryProps.agents` — no hay estado intermedio roto.

- [ ] **Step 2: Verificar que Storybook sigue construyendo (typecheck + bundling de stories)**

Run: `cd "C:\dev\Duly DS" && pnpm turbo run build --filter=@duly/docs --force`
Expected: build exitoso, sin errores de tipos ni de import — confirma que los 4 imports nuevos (`LEGAL_AGENTS`, etc.) resuelven correctamente.

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/agentic/agent-gallery.stories.tsx
git commit -m "feat(agentic): replace flat Neural Cores story with 4 sector stories"
```

---

### Task 6: `agent-core.tsx` — renderer WebGL compartido (singleton a nivel de módulo)

**Files:**
- Modify: `packages/ui/src/agentic/agent-core.tsx` (reescritura completa del archivo)

**Interfaces:**
- Consumes: `buildFragmentShader`, `VERTEX_SHADER`, `type NeuralAgent` desde `neural-agents.js` (ya existentes, sin cambios).
- Produces: `AgentCoreProps` **sin cambios** (`agent`, `size?`, `active?`, `className`, resto de `React.ComponentProps<"div">`) — Task 7 lo consume igual que hoy. Ningún otro archivo del repo necesita cambiar por este task.

- [ ] **Step 1: Reemplazar el contenido completo de `agent-core.tsx`**

```tsx
import * as React from "react";
import { cn } from "@/lib/utils";
import {
  buildFragmentShader,
  VERTEX_SHADER,
  type NeuralAgent,
} from "./neural-agents.js";

export interface AgentCoreProps extends React.ComponentProps<"div"> {
  /** Agente a renderizar (aporta glow + shader). */
  agent: NeuralAgent;
  /** Diámetro del core en px. */
  size?: number;
  /** Nivel de actividad 0..1 — sube el brillo/velocidad del shader (ej. en hover). */
  active?: boolean;
}

// ---------------------------------------------------------------------------
// Renderer compartido (singleton a nivel de módulo, no un Context de React
// — ningún consumidor necesita envolver su árbol en un provider nuevo).
//
// El navegador tiene un techo de ~16 contextos WebGL vivos simultáneos. Antes
// de este refactor, cada AgentCore creaba su propio canvas + contexto WebGL;
// una galería de 24 agentes (ver legal/petroleum/software/industrial-agents.ts)
// lo golpearía y algunos cores caerían al fallback estático sin animar.
//
// Ahora hay UN solo contexto WebGL "maestro" (canvas offscreen, nunca en el
// DOM), creado perezosamente al montar el primer AgentCore. Cada instancia
// sigue montando su propio <canvas> visible, pero como contexto 2D — pinta
// ahí proyectando el maestro vía drawImage cada frame del loop compartido.
// ---------------------------------------------------------------------------

const MASTER_SIZE = 240;

interface RenderEntry {
  program: WebGLProgram;
  posLoc: number;
  locTime: WebGLUniformLocation | null;
  locRes: WebGLUniformLocation | null;
  locAct: WebGLUniformLocation | null;
  targetRef: React.MutableRefObject<number>;
  currentActivity: number;
  startTime: number;
  ctx2d: CanvasRenderingContext2D;
  isVisible: boolean;
}

class SharedAgentRenderer {
  private gl: WebGLRenderingContext | null = null;
  private masterCanvas: HTMLCanvasElement | null = null;
  private vertexShader: WebGLShader | null = null;
  private positionBuffer: WebGLBuffer | null = null;
  private initFailed = false;
  private entries = new Map<string, RenderEntry>();
  private rafId = 0;

  private ensureInit(): boolean {
    if (this.gl) return true;
    if (this.initFailed) return false;

    const canvas = document.createElement("canvas");
    canvas.width = MASTER_SIZE;
    canvas.height = MASTER_SIZE;
    const gl = canvas.getContext("webgl", {
      antialias: false,
      alpha: true,
      premultipliedAlpha: true,
    });
    if (!gl) {
      this.initFailed = true;
      return false;
    }

    const vs = gl.createShader(gl.VERTEX_SHADER);
    if (!vs) {
      this.initFailed = true;
      return false;
    }
    gl.shaderSource(vs, VERTEX_SHADER);
    gl.compileShader(vs);
    if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
      console.error("[AgentCore] vertex shader error", gl.getShaderInfoLog(vs));
      this.initFailed = true;
      return false;
    }

    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    this.gl = gl;
    this.masterCanvas = canvas;
    this.vertexShader = vs;
    this.positionBuffer = buffer;
    return true;
  }

  /** Registra un agente. Devuelve false si WebGL no está disponible o el shader falló al compilar. */
  register(
    id: string,
    agent: NeuralAgent,
    ctx2d: CanvasRenderingContext2D,
    targetRef: React.MutableRefObject<number>,
    reduced: boolean,
  ): boolean {
    if (!this.ensureInit()) return false;
    const gl = this.gl!;

    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    if (!fs) return false;
    gl.shaderSource(fs, buildFragmentShader(agent.glsl));
    gl.compileShader(fs);
    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
      console.error("[AgentCore] shader error", agent.name, gl.getShaderInfoLog(fs));
      gl.deleteShader(fs);
      return false;
    }

    const program = gl.createProgram();
    if (!program) return false;
    gl.attachShader(program, this.vertexShader!);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    const posLoc = gl.getAttribLocation(program, "position");
    const locTime = gl.getUniformLocation(program, "u_time");
    const locRes = gl.getUniformLocation(program, "u_resolution");
    const locAct = gl.getUniformLocation(program, "u_activity");

    if (reduced) {
      // prefers-reduced-motion: un solo frame estático — nunca entra al loop
      // compartido, así que no gasta un draw call por frame para siempre.
      gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer!);
      gl.useProgram(program);
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
      gl.uniform1f(locTime, 0);
      gl.uniform2f(locRes, MASTER_SIZE, MASTER_SIZE);
      gl.uniform1f(locAct, 0);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      ctx2d.clearRect(0, 0, MASTER_SIZE, MASTER_SIZE);
      ctx2d.drawImage(this.masterCanvas!, 0, 0);
      gl.deleteProgram(program);
      return true;
    }

    // Desfase pseudo-aleatorio estable por agente para que no sincronicen exacto.
    const seed = agent.id.charCodeAt(0) * 37 + agent.id.charCodeAt(agent.id.length - 1);
    const startTime = (typeof performance !== "undefined" ? performance.now() : 0) - seed;

    this.entries.set(id, {
      program,
      posLoc,
      locTime,
      locRes,
      locAct,
      targetRef,
      currentActivity: 0,
      startTime,
      ctx2d,
      isVisible: true,
    });
    this.ensureLoop();
    return true;
  }

  unregister(id: string) {
    const entry = this.entries.get(id);
    if (entry && this.gl) this.gl.deleteProgram(entry.program);
    this.entries.delete(id);
    if (this.entries.size === 0) this.stopLoop();
  }

  setVisible(id: string, visible: boolean) {
    const entry = this.entries.get(id);
    if (entry) entry.isVisible = visible;
  }

  private ensureLoop() {
    if (this.rafId) return;
    const tick = () => {
      this.rafId = requestAnimationFrame(tick);
      const gl = this.gl;
      if (!gl || !this.positionBuffer || !this.masterCanvas) return;

      gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
      const now = typeof performance !== "undefined" ? performance.now() : Date.now();

      this.entries.forEach((entry) => {
        entry.currentActivity += (entry.targetRef.current - entry.currentActivity) * 0.1;
        // Fuera de viewport y ya en reposo: salta el draw call de esta instancia.
        if (!entry.isVisible && entry.currentActivity < 0.01) return;

        const time = (now - entry.startTime) / 1000;
        gl.useProgram(entry.program);
        gl.enableVertexAttribArray(entry.posLoc);
        gl.vertexAttribPointer(entry.posLoc, 2, gl.FLOAT, false, 0, 0);
        gl.uniform1f(entry.locTime, time);
        gl.uniform2f(entry.locRes, MASTER_SIZE, MASTER_SIZE);
        gl.uniform1f(entry.locAct, entry.currentActivity);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        entry.ctx2d.clearRect(0, 0, MASTER_SIZE, MASTER_SIZE);
        entry.ctx2d.drawImage(this.masterCanvas!, 0, 0);
      });
    };
    this.rafId = requestAnimationFrame(tick);
  }

  private stopLoop() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = 0;
  }
}

const sharedRenderer = new SharedAgentRenderer();
let nextInstanceId = 0;

/**
 * Core neural WebGL de un agente. Renderiza el shader del agente proyectado
 * desde un contexto WebGL compartido (ver `SharedAgentRenderer` arriba) hacia
 * su propio canvas 2D. Degrada a un glow estático si WebGL no está disponible.
 * Con `prefers-reduced-motion` pinta un solo frame en vez de animar.
 */
export function AgentCore({
  agent,
  size = 120,
  active = false,
  className,
  style,
  ...props
}: AgentCoreProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const targetRef = React.useRef(0);
  const [supported, setSupported] = React.useState(true);
  const instanceIdRef = React.useRef<string | null>(null);
  if (!instanceIdRef.current) instanceIdRef.current = `agent-core-${nextInstanceId++}`;

  React.useEffect(() => {
    targetRef.current = active ? 1 : 0;
  }, [active]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) {
      setSupported(false);
      return;
    }

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const id = instanceIdRef.current!;
    const ok = sharedRenderer.register(id, agent, ctx2d, targetRef, !!reduced);
    setSupported(ok);
    if (!ok) return;

    const observer =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(([entry]) => {
            sharedRenderer.setVisible(id, entry.isIntersecting);
          })
        : null;
    observer?.observe(canvas);

    return () => {
      observer?.disconnect();
      sharedRenderer.unregister(id);
    };
  }, [agent.glsl, agent.id]);

  const px = size;
  const res = size * 2; // doble resolución (retina)

  return (
    <div
      className={cn("relative rounded-full", className)}
      style={{
        width: px,
        height: px,
        // eslint-disable-next-line no-restricted-syntax -- glow de identidad del agente (WebGL), no tokenizable
        boxShadow: `0 0 30px ${agent.glow}, inset 0 0 10px rgba(0,0,0,0.5)`,
        ...style,
      }}
      {...props}
    >
      {supported ? (
        <canvas
          ref={canvasRef}
          width={res}
          height={res}
          className="block h-full w-full rounded-full"
          aria-hidden
        />
      ) : (
        // Fallback sin WebGL: glow radial estático con el color del agente.
        <div
          className="h-full w-full rounded-full"
          style={{
            background: `radial-gradient(circle at 50% 40%, ${agent.glow}, transparent 70%)`,
          }}
          aria-hidden
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verificar que el paquete compila y lintea**

Run: `cd "C:\dev\Duly DS" && pnpm --filter @duly/ui exec tsc --noEmit -p tsconfig.json && pnpm --filter @duly/ui lint`
Expected: sin errores de tipo, cero warnings de lint.

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/agentic/agent-core.tsx
git commit -m "perf(agentic): agent-core.tsx shares one WebGL context across instances

Techo de ~16 contextos WebGL simultaneos del navegador -- un singleton
a nivel de modulo reemplaza el contexto individual por instancia. API
publica (AgentCoreProps) sin cambios."
```

---

### Task 7: `agent-core.test.tsx` — cobertura del renderer compartido

**Files:**
- Create: `packages/ui/src/agentic/agent-core.test.tsx`

**Interfaces:**
- Consumes: `AgentCore` desde `agent-core.js` (Task 6), `NEURAL_AGENTS` desde `neural-agents.js` (ya existente).
- Produces: nada — es una hoja del árbol.

Nota de entorno: jsdom no implementa WebGL real (`canvas.getContext("webgl")` devuelve `null`), así que estos tests ejercen el camino "sin soporte" (`SharedAgentRenderer.ensureInit()` falla → `register()` devuelve `false` → `AgentCore` cae al fallback CSS estático) — igual que ya ocurría con el código anterior a este refactor. El camino WebGL real (contexto compartido de verdad, blit por instancia) se verifica manualmente en Storybook, no aquí.

- [ ] **Step 1: Escribir el test**

```tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { AgentCore } from "./agent-core.js";
import { NEURAL_AGENTS } from "./neural-agents.js";

describe("AgentCore — renderer WebGL compartido", () => {
  it("renderiza múltiples instancias simultáneas sin lanzar (jsdom sin WebGL -> fallback estático)", () => {
    const { container } = render(
      <>
        <AgentCore agent={NEURAL_AGENTS[0]} />
        <AgentCore agent={NEURAL_AGENTS[1]} />
        <AgentCore agent={NEURAL_AGENTS[2]} />
      </>,
    );
    expect(container.querySelectorAll('[aria-hidden]').length).toBe(3);
    expect(container.querySelectorAll("canvas").length).toBe(0);
  });

  it("cada fallback usa el glow del agente correspondiente, no uno compartido por error", () => {
    const { container } = render(
      <>
        <AgentCore agent={NEURAL_AGENTS[0]} />
        <AgentCore agent={NEURAL_AGENTS[1]} />
      </>,
    );
    const fallbacks = container.querySelectorAll('[aria-hidden]');
    const bg0 = (fallbacks[0] as HTMLElement).style.background;
    const bg1 = (fallbacks[1] as HTMLElement).style.background;
    expect(bg0).toContain("radial-gradient");
    expect(bg0).not.toBe(bg1);
  });

  it("desmontar una instancia no rompe ni afecta a una hermana que sigue montada", () => {
    const { container, rerender } = render(
      <>
        <AgentCore agent={NEURAL_AGENTS[0]} />
        <AgentCore agent={NEURAL_AGENTS[1]} />
      </>,
    );
    expect(container.querySelectorAll('[aria-hidden]').length).toBe(2);
    rerender(<AgentCore agent={NEURAL_AGENTS[1]} />);
    expect(container.querySelectorAll('[aria-hidden]').length).toBe(1);
  });

  it("respeta prefers-reduced-motion sin lanzar", () => {
    const original = window.matchMedia;
    window.matchMedia = ((query: string) => ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
      onchange: null,
    })) as unknown as typeof window.matchMedia;

    const { container } = render(<AgentCore agent={NEURAL_AGENTS[0]} />);
    expect(container.querySelector('[aria-hidden]')).not.toBeNull();

    window.matchMedia = original;
  });
});
```

- [ ] **Step 2: Correr los tests**

Run: `cd "C:\dev\Duly DS" && pnpm --filter @duly/ui exec vitest run src/agentic/agent-core.test.tsx`
Expected: 4 tests PASS.

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/agentic/agent-core.test.tsx
git commit -m "test(agentic): cover shared-renderer registration/cleanup for AgentCore"
```

---

### Task 8: `AgentGalleryProps.agents` requerida + verificación final del pipeline completo

**Files:**
- Modify: `packages/ui/src/agentic/agent-gallery.tsx`

**Interfaces:**
- Consumes: nada nuevo.
- Produces: `AgentGalleryProps.agents: NeuralAgent[]` (antes `agents?: NeuralAgent[]` con default `NEURAL_AGENTS`) — rompe a cualquier consumidor que dependiera del default implícito. Se verificó en Task 5 que `agent-gallery.stories.tsx` ya no depende de él (la story `NeuralCores` fue eliminada, las 4 nuevas pasan `agents` explícito). `property-intelligence-console.tsx` ya pasaba `agents` explícito desde antes — sin impacto.

- [ ] **Step 1: Editar `agent-gallery.tsx`**

Reemplazar:
```tsx
import * as React from "react";
import { cn } from "@/lib/utils";
import { AgentCard } from "./agent-card.js";
import { NEURAL_AGENTS, type NeuralAgent } from "./neural-agents.js";

export interface AgentGalleryProps extends React.ComponentProps<"div"> {
  /** Agentes a mostrar. Por defecto los 10 Neural Cores. */
  agents?: NeuralAgent[];
  /** Título opcional del encabezado. */
  title?: string;
  /** Subtítulo opcional (mono). */
  subtitle?: string;
}

/**
 * Galería en grid de agentes IA con cores WebGL. Composición V001 "Neural Cores".
 */
export function AgentGallery({
  agents = NEURAL_AGENTS,
  title = "Neural Cores",
  subtitle,
  className,
  ...props
}: AgentGalleryProps) {
```

Por:
```tsx
import * as React from "react";
import { cn } from "@/lib/utils";
import { AgentCard } from "./agent-card.js";
import type { NeuralAgent } from "./neural-agents.js";

export interface AgentGalleryProps extends React.ComponentProps<"div"> {
  /** Roster de agentes a mostrar — un sector explícito (ver legal-agents.ts,
   *  petroleum-agents.ts, software-agents.ts, industrial-agents.ts). */
  agents: NeuralAgent[];
  /** Título opcional del encabezado. */
  title?: string;
  /** Subtítulo opcional (mono). */
  subtitle?: string;
}

/**
 * Galería en grid de agentes IA con cores WebGL, agrupada por sector/industria.
 */
export function AgentGallery({
  agents,
  title = "Neural Cores",
  subtitle,
  className,
  ...props
}: AgentGalleryProps) {
```

El resto del archivo (el `return (...)` con el header y el grid) no cambia.

- [ ] **Step 2: Pipeline completo del monorepo**

Run: `cd "C:\dev\Duly DS" && pnpm turbo run tokens build lint test --force`
Expected: 9/9 tareas exitosas (mismo criterio que las auditorías previas del repo). Si `@duly/docs:build` falla por algún import roto, revisar que ningún otro archivo (fuera de los tocados en Tasks 1-7) dependía del default de `agents`.

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/agentic/agent-gallery.tsx
git commit -m "feat(agentic)!: AgentGallery.agents is now required

La galeria ya no tiene modo generico sin sector -- todo consumidor
pasa un roster explicito (legal/petroleum/software/industrial-agents.ts
o real-estate-agents.ts). NEURAL_AGENTS sigue existiendo en
neural-agents.ts, solo deja de ser el default de AgentGallery."
```

- [ ] **Step 4: Verificación manual en Storybook (no automatizable)**

Run: `cd "C:\dev\Duly DS" && pnpm --filter @duly/docs storybook`
Abrir `http://localhost:6006`, ir a `Agentic/Agent Gallery/V002 By Industry`, confirmar:
- Las 4 stories de sector aparecen en el sidebar (`Legal & Compliance`, `Petróleo & Energía`, `Software & Redes`, `Industrial & Logística`).
- Cada una renderiza 6 cores WebGL **animados** (no glows estáticos) — confirma que el contexto compartido de Task 6 funciona de verdad en un navegador real, algo que jsdom no puede probar.
- Hover sobre una tarjeta sube su actividad (brillo/velocidad) sin afectar a las demás.
- `SingleCard` sigue funcionando igual que antes.

---

## Self-Review

**Cobertura del spec:** Datos (Tasks 1-4) ✓, stories por sector (Task 5) ✓, renderer WebGL compartido (Task 6) ✓, test nuevo (Task 7) ✓, `agents` requerida + retiro de la vista plana (Task 8) ✓, verificación de pipeline + Storybook (Task 8, steps 2 y 4) ✓. `NEURAL_AGENTS` intocado (ninguna task lo reordena) ✓. Real Estate no tocado (ninguna task lo referencia) ✓.

**Placeholders:** ninguno — cada step tiene código completo, comandos exactos con output esperado.

**Consistencia de tipos:** `NeuralAgent` (id/name/role/glow/glsl) usado idéntico en las 4 tasks de datos; `AgentCoreProps` sin cambios entre Task 6 y su consumo implícito en Task 7; `AgentGalleryProps.agents: NeuralAgent[]` en Task 8 coincide con lo que Task 5 ya pasa explícitamente en las 4 stories nuevas.
