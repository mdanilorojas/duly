import { writeFileSync } from "node:fs";
import { buildCatalog } from "./catalog.js";

const url = new URL("../catalog.json", import.meta.url);
const json = JSON.stringify(buildCatalog(), null, 2) + "\n";
writeFileSync(url, json);
console.log(`Wrote ${url.pathname} (${json.length} bytes)`);
