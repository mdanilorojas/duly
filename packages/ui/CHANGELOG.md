# @duly/ui

## 0.1.0

### Minor Changes

- b7ab93d: App shell multi-caso-de-uso (área D del NORTH_STAR): `AppShell` (skip-link, landmarks, densidad a nivel de sitio vía `DensityContext` + `data-density`), `AppSidebar`/`SidebarSection`/`SidebarItem` (rail colapsable con tooltips, drawer mobile), `AppTopbar` (`Breadcrumbs`, `TopbarSearchButton`, `TopbarIconButton`, `DensityToggle`), `WorkspaceSwitcher`, `EnvironmentBadge`, y `CommandPalette` sobre `cmdk` con hook `useCommandPalette` (⌘K/Ctrl+K). `DataTable` ahora hereda la densidad del shell como default cuando no recibe prop explícita (la prop sigue ganando; sin cambio de comportamiento fuera de un shell). Copy nuevo `appShell` en los diccionarios en/es.
- 7b9322d: Data-viz tokens (área D del NORTH_STAR): `--viz-cat-1..8` (paleta categórica CVD-safe, mismos 8 hues re-escalonados por superficie, ≥3:1 sobre los temas oscuros, gates permanentes de CVD/visión-normal/contraste/no-impersonación-de-status en el build test) y `--viz-seq-1..7` (rampa sequential con la hue del accent de cada tema, lightness monotónica), emitidos en los theme CSS, mapeados a utilidades Tailwind (`--color-viz-*`) y expuestos en el export JS `viz`. En `@duly/ui`: helpers `vizCat`/`vizSeq`/`vizCategorical` + story `Data-viz Tokens/V001` con swatches, reglas de uso (orden fijo, cap all-pairs, alert = status tokens) y demo aplicada con recharts + tabla accesible.
- 6399ebb: `DateRangePicker` (área D del NORTH_STAR): rango de fechas sobre `react-aria-components` con la zona horaria siempre visible (chip con offset Intl o `timeZoneLabel` editorial, IANA en el title), presets rápidos calculados en la `timeZone` dada (últimos 7/30 días, mes/trimestre a la fecha; `presets={false}` para desactivar), calendario dual temado con tokens, API controlada-o-no y estados invalid/disabled. Copy nuevo `dateRangePicker` en los diccionarios en/es.
- 2d4c858: Add ganapliego theme, Toast, Combobox, and form-field; first real release.
- aa2a614: Fundación del Studio DS: tokens OKLCH multi-tema (@theme inline, gate de contraste) + componente TraceLog.
