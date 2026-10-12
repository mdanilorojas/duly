export { sha256Hex } from "./sha256.js";
export {
  CATALOG_COMPONENTS,
  CATALOG_ID,
  CATALOG_VERSION,
  COMPONENT_SUMMARIES,
  REACT_COMPONENTS,
  componentSchemas,
} from "./schemas.js";
export { buildCatalog, themeNames } from "./catalog.js";
export { canonicalize, checkSurface, surfaceHash } from "./surface.js";
export type { CheckedSurface, StrippedComponent, SurfaceCheck, SurfaceIssue, SurfaceNode } from "./surface.js";
