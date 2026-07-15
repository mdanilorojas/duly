# Diseño — Reorganización de la IA de Storybook (Duly DS)

**Fecha:** 2026-07-15

## Problema

El sidebar de Storybook (`packages/ui`) creció orgánicamente hasta 5 grupos top-level distintos que en realidad son el mismo nivel conceptual (átomos base de shadcn): `Primitives`, `Layout`, `Display`, `Feedback`, `Overlay`. Además, varios componentes quedaron huérfanos fuera de cualquier área de dominio (`Agent-ops/TraceLog`, `Kanban`, `App Shell`, `DateRangePicker`, `Data-viz Tokens`), y la profundidad de los títulos es inconsistente (algunos flat `Categoría/V00x Nombre`, otros de 3 niveles `Categoría/Componente/V00x variante`). Un reviewer no puede navegar el árbol de forma útil.

## Decisión

No se adopta atomic design estricto (átomos/moléculas/organismos) — ese modelo sirve a un producto único, no a una librería multi-industria. `NORTH_STAR.md` ya organiza el catálogo por área de dominio (n8n, Agent ops, Compliance, Comercial, Industrial); el sidebar de Storybook debe reflejar esa misma taxonomía.

### Estructura final (3 grupos top-level)

1. **Fundamentos** — tokens y fundamentos visuales (`Data-viz Tokens`).
2. **Primitivas** — un solo grupo (antes 5: Primitives/Layout/Display/Feedback/Overlay), con 6 subcarpetas:
   - `Forms` — Button, Badge, Checkbox, Dropzone, Input, Label, RadioGroup, Select, Stepper, Switch, Textarea, DateRangePicker.
   - `Layout` — Card, Separator, App Shell (huérfano, absorbido).
   - `Visualización` (antes Display) — Accordion, Avatar, Tabs, Tooltip.
   - `Retroalimentación` (antes Feedback) — Alert, Progress, Skeleton.
   - `Superpuestos` (antes Overlay) — Dialog, DropdownMenu, Sheet.
   - `DataTable` — Dense Virtualized, FilterBar, Saved Views.
3. **Áreas de dominio** — Agentic, Compliance, Comercial (antes Commercial), Industrial, Recetas (antes Recipes). `Agent-ops/TraceLog` y `Kanban` (huérfanos) se absorben en Agentic.

Se descartó un 4to bucket "transversal/todas industrias" para componentes reusados entre verticales — quedan en su dominio de origen tal como estaban.

### Idioma

- Nombre de categoría/subcategoría: español, excepto `Agentic`, `Compliance` (términos ya establecidos en la industria) y `Layout` (término técnico universal).
- Segmento de nombre de componente (2do nivel, p.ej. "Agent Status Matrix", "Kanban Board"): se mantiene igual al nombre real del componente en código — no se traduce, para no romper la correspondencia visual entre el árbol de Storybook y el archivo fuente.
- Texto descriptivo de variante (después de `V00x`, cuando existe): español.
- Número de versión (`V001`, `V002`): literal, sin traducir — es convención de versionado.
- Código, nombres de archivo, componentes, props: sin cambios, en inglés.

### Alcance de la profundidad

No se fuerza un 3er nivel donde nunca existió una variante separada del nombre del componente (p.ej. `Compliance/V001 Model Provenance Card` no gana un segmento extra inventado). Solo se estandariza a 3 niveles donde ya existía contenido real de variante que lo justificaba.

## Implementación

Cambio mecánico: solo la propiedad `title` del objeto `meta` de cada `*.stories.tsx` (83 archivos en `packages/ui/src/**`). Cero cambios de lógica, props, o nombres de archivo/componente. Verificado: `pnpm --filter @duly/ui lint` limpio, 83 títulos únicos (sin colisiones) tras el cambio.

## Fuera de alcance

- Reorganizar archivos/carpetas físicas — solo cambia el string `title:`, la ubicación en disco de cada `.stories.tsx` no se toca.
- Traducir el copy runtime de los componentes (`en.ts`/`es.ts`) — eso ya tiene su propio sistema de i18n vía `useCopy()`, no forma parte de este cambio.
- Agregar version numbers o descriptores de variante a primitivas que nunca los tuvieron.
