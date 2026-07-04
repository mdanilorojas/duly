// Auditoría WCAG 2.2 sobre storybook-static: corre axe-core en cada story.
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'fs';
import { createServer } from 'http';
import { extname, join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Raíz del repo derivada de la ubicación del script (scripts/..) — portable a
// CI/Linux; antes estaba hardcodeada a una ruta absoluta de Windows.
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const AXE = readFileSync(`${ROOT}/node_modules/.pnpm/axe-core@4.9.1/node_modules/axe-core/axe.min.js`, 'utf8');
const index = JSON.parse(readFileSync(`${ROOT}/apps/docs/storybook-static/index.json`, 'utf8'));
const ids = Object.values(index.entries).filter(e => e.type === 'story').map(e => e.id);

// Servir storybook-static por HTTP: los modulos ES fallan por CORS bajo file://
const STATIC = `${ROOT}/apps/docs/storybook-static`;
const MIME = { '.html':'text/html', '.js':'text/javascript', '.mjs':'text/javascript', '.css':'text/css', '.json':'application/json', '.svg':'image/svg+xml', '.png':'image/png', '.woff2':'font/woff2' };
const server = createServer((req, res) => {
  const path = decodeURIComponent(req.url.split('?')[0]);
  try {
    const body = readFileSync(join(STATIC, path === '/' ? 'index.html' : path));
    res.writeHead(200, { 'content-type': MIME[extname(path)] ?? 'application/octet-stream' });
    res.end(body);
  } catch { res.writeHead(404); res.end(); }
});
await new Promise(r => server.listen(6006, r));
const b = await chromium.launch();
let emptyRoots = 0;
const p = await b.newPage({ viewport: { width: 1000, height: 700 } });
const results = [];
for (const id of ids) {
  await p.goto(`http://localhost:6006/iframe.html?id=${id}&viewMode=story`, { waitUntil: 'networkidle' });
  await p.waitForTimeout(400);
  // Guard: si el root esta vacio, la story NO se rindio — auditar nada = pasar falso.
  const rootLen = await p.evaluate(() => document.getElementById('storybook-root')?.innerHTML.length ?? 0);
  if (rootLen === 0) { emptyRoots++; results.push({ story: id, violations: [{ id: 'render-failed', impact: 'critical', help: 'story did not render (empty root) — audit invalid for this story', nodes: [] }] }); continue; }
  await p.evaluate(AXE);
  const r = await p.evaluate(async () => {
    const res = await window.axe.run(document.getElementById('storybook-root') ?? document.body, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
    });
    return res.violations.map(v => ({
      id: v.id, impact: v.impact, help: v.help,
      nodes: v.nodes.slice(0, 3).map(n => n.html.slice(0, 160)),
    }));
  });
  if (r.length) results.push({ story: id, violations: r });
}

// WCAG 1.4.10 Reflow: a 320px de ancho no debe aparecer scroll horizontal.
// Este check existe porque un overflow real (Accordion w-96) paso todas las
// verificaciones — todas renderizaban a un solo ancho desktop.
const rp = await b.newPage({ viewport: { width: 320, height: 800 } });
for (const id of ids) {
  await rp.goto(`http://localhost:6006/iframe.html?id=${id}&viewMode=story`, { waitUntil: 'networkidle' });
  await rp.waitForTimeout(300);
  const overflow = await rp.evaluate(() => {
    const el = document.scrollingElement;
    return el.scrollWidth > el.clientWidth + 1 ? el.scrollWidth - el.clientWidth : 0;
  });
  if (overflow > 0) results.push({ story: id, violations: [{ id: 'reflow-320', impact: 'serious', help: `WCAG 1.4.10: ${overflow}px horizontal overflow at 320px viewport`, nodes: [] }] });
}
await rp.close();
await b.close();
server.close();
writeFileSync(`${ROOT}/.ds-sync/a11y-report.json`, JSON.stringify(results, null, 2));
const total = results.reduce((a, s) => a + s.violations.length, 0);
console.log(`stories checked: ${ids.length}, stories with violations: ${results.length}, total violations: ${total}`);
for (const s of results) console.log(`- ${s.story}: ${s.violations.map(v => v.id).join(', ')}`);
