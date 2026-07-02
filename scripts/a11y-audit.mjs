// Auditoría WCAG 2.2 sobre storybook-static: corre axe-core en cada story.
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'fs';

const ROOT = 'C:/dev/Enterprise Design System';
const AXE = readFileSync(`${ROOT}/node_modules/.pnpm/axe-core@4.9.1/node_modules/axe-core/axe.min.js`, 'utf8');
const index = JSON.parse(readFileSync(`${ROOT}/apps/docs/storybook-static/index.json`, 'utf8'));
const ids = Object.values(index.entries).filter(e => e.type === 'story').map(e => e.id);

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1000, height: 700 } });
const results = [];
for (const id of ids) {
  await p.goto(`file:///C:/dev/Enterprise Design System/apps/docs/storybook-static/iframe.html?id=${id}&viewMode=story`, { waitUntil: 'networkidle' });
  await p.waitForTimeout(400);
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
await b.close();
writeFileSync(`${ROOT}/.ds-sync/a11y-report.json`, JSON.stringify(results, null, 2));
const total = results.reduce((a, s) => a + s.violations.length, 0);
console.log(`stories checked: ${ids.length}, stories with violations: ${results.length}, total violations: ${total}`);
for (const s of results) console.log(`- ${s.story}: ${s.violations.map(v => v.id).join(', ')}`);
