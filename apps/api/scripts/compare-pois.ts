import { createHash } from 'node:crypto';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { selectFeaturedRoutePois } from '../src/modules/routes/mappers/featured-route-pois';
import type { RoutePoiWithSource } from '../src/modules/routes/types/featured-pois';
import { html } from './debug-pois';

export const escapeHtml = (value: unknown): string =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ]!,
  );

export function comparisonPanel(
  name: string,
  index: number,
  beforeHtml: string,
  afterHtml: string,
  before: ReturnType<typeof metrics>,
  after: ReturnType<typeof metrics>,
  added: RoutePoiWithSource[],
  removed: RoutePoiWithSource[],
): string {
  const summary = (m: ReturnType<typeof metrics>) =>
    `${m.count} points | max gap ${(m.maxGapM / 1000).toFixed(2)} km | WATER ${m.types.WATER}, SHELTER ${m.types.SHELTER}, CAMP ${m.types.CAMP}`;
  const list = (points: RoutePoiWithSource[]) =>
    points.length
      ? points
          .map(
            (p) =>
              `${escapeHtml(p.label)} (${escapeHtml(p.type)}, ${(p.distanceFromStartM / 1000).toFixed(2)} km)`,
          )
          .join('; ')
      : 'None';
  return `<section id="case-${index}"><h2>${escapeHtml(name)}</h2><div class="pair"><article><h3>Frozen baseline</h3><p>${summary(before)}</p><iframe sandbox title="${escapeHtml(name)} baseline" srcdoc="${escapeHtml(beforeHtml)}"></iframe></article><article><h3>Current selector</h3><p>${summary(after)}</p><iframe sandbox title="${escapeHtml(name)} current" srcdoc="${escapeHtml(afterHtml)}"></iframe></article></div><details><summary>Selection changes: +${added.length} / -${removed.length}</summary><p><strong>Added:</strong> ${list(added)}</p><p><strong>Removed:</strong> ${list(removed)}</p></details></section>`;
}

export function metrics(pois: RoutePoiWithSource[], distanceM: number) {
  const positions = pois.map((p) => p.distanceFromStartM).sort((a, b) => a - b);
  const thirds = [0, 0, 0];
  const types: Record<string, number> = { WATER: 0, SHELTER: 0, CAMP: 0 };
  for (const poi of pois) {
    types[poi.type] = (types[poi.type] ?? 0) + 1;
    thirds[
      Math.min(
        2,
        Math.max(0, Math.floor((poi.distanceFromStartM / distanceM) * 3)),
      )
    ]++;
  }
  const boundaries = [0, ...positions, distanceM];
  return {
    count: pois.length,
    types,
    thirds,
    maxGapM: Math.max(...boundaries.slice(1).map((p, i) => p - boundaries[i])),
    firstM: positions[0] ?? null,
    lastM: positions.at(-1) ?? null,
  };
}

async function main() {
  const root = resolve('test/fixtures/poi-baseline-v2');
  const manifest = JSON.parse(
    await readFile(resolve(root, 'manifest.json'), 'utf8'),
  );
  const out = resolve('.poi-debug', `comparison-${Date.now()}`);
  const reports = [];
  const panels: string[] = [];
  for (const entry of manifest.cases) {
    const fixtureText = await readFile(
      resolve(root, entry.name, 'fixture.json'),
      'utf8',
    );
    const resultText = await readFile(
      resolve(root, entry.name, 'result.json'),
      'utf8',
    );
    const sha = (s: string) => createHash('sha256').update(s).digest('hex');
    if (
      sha(fixtureText) !== entry.fixtureSha256 ||
      sha(resultText) !== entry.resultSha256
    ) {
      throw new Error(`Baseline integrity check failed: ${entry.name}`);
    }
    const fixture = JSON.parse(fixtureText);
    const baseline: RoutePoiWithSource[] = JSON.parse(resultText).featuredPois;
    const current = selectFeaturedRoutePois(
      fixture.pois,
      fixture.route.distanceM,
    );
    const beforeIds = new Set(baseline.map((p) => p.id));
    const afterIds = new Set(current.map((p) => p.id));
    reports.push({
      case: entry.name,
      routeId: fixture.route.id,
      before: metrics(baseline, fixture.route.distanceM),
      after: metrics(current, fixture.route.distanceM),
      byType: Object.fromEntries(
        ['WATER', 'SHELTER', 'CAMP'].map((type) => [
          type,
          {
            before: metrics(
              baseline.filter((p) => p.type === type),
              fixture.route.distanceM,
            ),
            after: metrics(
              current.filter((p) => p.type === type),
              fixture.route.distanceM,
            ),
          },
        ]),
      ),
      added: current.filter((p) => !beforeIds.has(p.id)),
      removed: baseline.filter((p) => !afterIds.has(p.id)),
      sameOrderedIds:
        JSON.stringify(baseline.map((p) => p.id)) ===
        JSON.stringify(current.map((p) => p.id)),
      featuredPois: current,
    });
    const report = reports[reports.length - 1];
    panels.push(
      comparisonPanel(
        entry.name,
        panels.length,
        html(fixture, baseline),
        html(fixture, current),
        report.before,
        report.after,
        report.added,
        report.removed,
      ),
    );
  }
  await mkdir(out, { recursive: true });
  await writeFile(
    resolve(out, 'comparison.json'),
    JSON.stringify(reports, null, 2),
  );
  await writeFile(
    resolve(out, 'comparison.html'),
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Featured POI comparison</title><style>
body{font:16px Georgia,serif;background:#faf8f1;color:#24342d;margin:24px}nav{display:flex;gap:20px;flex-wrap:wrap}a{color:#276653}section{margin:36px 0}.pair{display:grid;grid-template-columns:1fr 1fr;gap:20px}article{min-width:0}iframe{width:100%;height:760px;border:1px solid #c9cec8;background:white;box-sizing:border-box}details{padding:16px 0}h3{margin-bottom:8px}@media(max-width:800px){.pair{grid-template-columns:1fr}body{margin:12px}}
</style></head><body><h1>Featured POI: before / after</h1><p>Identical input, projection and scale on both sides. Offline track diagrams, no basemap. Blue: water; amber: shelter; green: camp; gray: other candidates. Hover markers for details; scroll each panel for its selected-point table.</p><p>Gaps describe selected markers, not actual resource availability. Baseline is a reference, not an expected correct answer.</p><nav>${reports.map((r, i) => `<a href="#case-${i}">${escapeHtml(r.case)}</a>`).join('')}</nav>${panels.join('')}</body></html>`,
  );
  console.table(
    reports.map((r) => ({
      case: r.case,
      before: r.before.count,
      after: r.after.count,
      added: r.added.length,
      removed: r.removed.length,
      thirdsBefore: r.before.thirds.join('/'),
      thirdsAfter: r.after.thirds.join('/'),
      maxGapBeforeM: Math.round(r.before.maxGapM),
      maxGapAfterM: Math.round(r.after.maxGapM),
    })),
  );
  console.log(`Report: ${out}/comparison.json`);
  console.log(`Visual comparison: ${out}/comparison.html`);
  console.log(
    'Gaps describe selected markers, not actual resource availability. Differences are not test failures.',
  );
}

if (require.main === module)
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
