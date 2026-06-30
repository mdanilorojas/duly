# TraceLog

Timeline de eventos/log para vistas de agent-ops. Compound component sobre Radix.

## API

- `TraceLog.Root` — `density?: "comfortable" | "compact"`, `streaming?: boolean`.
- `TraceLog.Header` — `title: string`, `hint?: string`.
- `TraceLog.Body` — `maxHeight?: number` (activa scroll).
- `TraceLog.Row` — `tone?: "info"|"ok"|"review"|"warn"|"block"`, `agent: string`, `step?`, `timestamp?`.
- `TraceLog.Code` · `TraceLog.Detail` · `TraceLog.Empty` · `TraceLog.Truncated`.

## Contrato a11y

- `Body` expone `role="log"`; con `streaming`, `aria-live="polite"`.
- Cada `Row` lleva icono + label textual del tone (`.sr-only`) — la severidad nunca es solo color.
- `Detail` es Radix Collapsible: operable con Enter/Espacio, focus ring vía `--ring`.

## Do / Don't

- ✅ Usar `tone` para severidad; ✅ `streaming` solo mientras hay proceso vivo.
- ❌ No poner texto de color hardcodeado; ❌ no usar `Detail` para contenido crítico siempre-visible.
