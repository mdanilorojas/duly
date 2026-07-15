---
"@duly/ui": minor
---

App shell multi-caso-de-uso (área D del NORTH_STAR): `AppShell` (skip-link, landmarks, densidad a nivel de sitio vía `DensityContext` + `data-density`), `AppSidebar`/`SidebarSection`/`SidebarItem` (rail colapsable con tooltips, drawer mobile), `AppTopbar` (`Breadcrumbs`, `TopbarSearchButton`, `TopbarIconButton`, `DensityToggle`), `WorkspaceSwitcher`, `EnvironmentBadge`, y `CommandPalette` sobre `cmdk` con hook `useCommandPalette` (⌘K/Ctrl+K). `DataTable` ahora hereda la densidad del shell como default cuando no recibe prop explícita (la prop sigue ganando; sin cambio de comportamiento fuera de un shell). Copy nuevo `appShell` en los diccionarios en/es.
