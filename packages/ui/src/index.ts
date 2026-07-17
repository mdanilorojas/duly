export { cn } from "./lib/cn.js";
export { vizCat, vizSeq, vizCategorical, VIZ_CAT_SLOTS, VIZ_SEQ_STEPS } from "./lib/viz.js";
export { TraceLog } from "./trace-log/trace-log.js";
export type { Tone, Density } from "./trace-log/trace-log.variants.js";

// copy / i18n — contrato inyectable, default inglés sin configuración
export { CopyProvider, useCopy, useLocale, useFormatCurrency, enCopy, esCopy } from "./lib/copy/index.js";
export type { CopyDict, Locale } from "./lib/copy/index.js";

// shadcn primitives — copy-owned, token-mapped
export * from "./components/ui/button.js";
export * from "./components/ui/badge.js";
export * from "./components/ui/card.js";
export * from "./components/ui/input.js";
export * from "./components/ui/alert.js";
export * from "./components/ui/error-state.js";
export * from "./components/ui/avatar.js";
export * from "./components/ui/tooltip.js";
export * from "./components/ui/separator.js";
export * from "./components/ui/select.js";
export * from "./components/ui/textarea.js";
export * from "./components/ui/label.js";
export * from "./components/ui/switch.js";
export * from "./components/ui/checkbox.js";
export * from "./components/ui/radio-group.js";
export * from "./components/ui/dialog.js";
export * from "./components/ui/sheet.js";
export * from "./components/ui/dropdown-menu.js";
export * from "./components/ui/tabs.js";
export * from "./components/ui/accordion.js";
export * from "./components/ui/progress.js";
export * from "./components/ui/stepper.js";
export * from "./components/ui/dropzone.js";
export * from "./components/ui/skeleton.js";
export * from "./components/ui/toast.js";
export * from "./components/ui/combobox.js";
export * from "./form/index.js";

// app-shell — chrome de aplicación multi-caso-de-uso (sidebar, topbar,
// workspace switcher, command palette, densidad de sitio)
export * from "./app-shell/index.js";

// data-table — primitiva densa/virtualizada, columna vertebral de todas las tablas
export * from "./data-table/index.js";

// kanban — tablero de columnas controlado (dnd-kit), backlogs por estado
export * from "./kanban/index.js";

// date-range-picker — rango con zona horaria visible (react-aria-components)
export * from "./date-range-picker/index.js";

// agentic — AI agent UI experiments
export * from "./agentic/index.js";

// compliance — auditoría / evidencia (área C)
export * from "./compliance/index.js";

// commercial — estrategia comercial enterprise (área E)
export * from "./commercial/index.js";

// industrial — operación OT / SCADA (área F, ISA-101/18.2)
export * from "./industrial/index.js";
