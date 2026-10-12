import { writeFileSync } from "node:fs";
import { buildDesignSystem } from "./design-system.js";

const url = new URL("../design-system.json", import.meta.url);
const json = JSON.stringify(buildDesignSystem(), null, 2) + "\n";
writeFileSync(url, json);
console.log(`Wrote ${url.pathname} (${json.length} bytes)`);
