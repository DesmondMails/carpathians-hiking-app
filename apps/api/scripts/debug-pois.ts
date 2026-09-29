import 'dotenv/config';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { Client } from 'pg';
import { selectFeaturedRoutePois } from '../src/modules/routes/mappers/featured-route-pois';
import type { RoutePoiWithSource } from '../src/modules/routes/types/featured-pois';

type Fixture = {
  version: 1;
  route: {
    id: string;
    title: string;
    distanceM: number | null;
    coordinates: { latitude: number; longitude: number }[];
    status: string;
  };
  pois: RoutePoiWithSource[];
};

async function fromDatabase(id: string): Promise<Fixture> {
  if (!process.env.DATABASE_URL)
    throw new Error('DATABASE_URL is required for --route');
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query(
      'BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY',
    );
    const result = await client.query(
      'SELECT id, title, "distanceM", "routeCoordinatesJson" AS coordinates, "poiEnrichmentStatus" AS status FROM "Route" WHERE id = $1',
      [id],
    );
    if (!result.rows.length) throw new Error('Route not found');
    const pois = await client.query(
      'SELECT p.*, row_to_json(s) AS source FROM "RoutePoi" p JOIN "RoutePoiSource" s ON s.id = p."sourceId" WHERE p."routeId" = $1 ORDER BY p."sortOrder", p.id',
      [id],
    );
    await client.query('COMMIT');
    return { version: 1, route: result.rows[0], pois: pois.rows };
  } finally {
    await client.end();
  }
}

function validate(data: Fixture): void {
  if (
    data.version !== 1 ||
    !data.route ||
    !Array.isArray(data.pois) ||
    !Array.isArray(data.route.coordinates)
  )
    throw new Error('Invalid fixture structure');
  if (
    data.route.distanceM !== null &&
    (!Number.isFinite(data.route.distanceM) || data.route.distanceM <= 0)
  ) {
    throw new Error('Route distance must be positive or null');
  }
  const ids = new Set<string>();
  for (const point of [...data.route.coordinates, ...data.pois]) {
    if (
      !Number.isFinite(point.latitude) ||
      !Number.isFinite(point.longitude) ||
      Math.abs(point.latitude) > 90 ||
      Math.abs(point.longitude) > 180
    )
      throw new Error('Invalid coordinates');
  }
  for (const poi of data.pois) {
    if (
      !poi.id ||
      ids.has(poi.id) ||
      typeof poi.label !== 'string' ||
      !['WATER', 'SHELTER', 'CAMP', 'PEAK', 'VIEWPOINT'].includes(poi.type) ||
      !['HIGH', 'MEDIUM', 'LOW'].includes(poi.confidence) ||
      !Number.isFinite(poi.distanceFromStartM) ||
      poi.distanceFromStartM < 0 ||
      !Number.isFinite(poi.distanceFromRouteM) ||
      poi.distanceFromRouteM < 0
    )
      throw new Error('Invalid or duplicate POI');
    ids.add(poi.id);
  }
}

export function html(fixture: Fixture, selected: RoutePoiWithSource[]): string {
  const escape = (value: unknown) =>
    String(value).replace(
      /[&<>"']/g,
      (c) =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
        })[c]!,
    );
  const points = [...fixture.route.coordinates, ...fixture.pois];
  const lat = points.length
    ? points.reduce((sum, p) => sum + p.latitude, 0) / points.length
    : 0;
  const xy = (p: { latitude: number; longitude: number }) => [
    p.longitude * Math.cos((lat * Math.PI) / 180),
    -p.latitude,
  ];
  const coords = points.map(xy);
  const minX = Math.min(...coords.map((p) => p[0]), 180);
  const minY = Math.min(...coords.map((p) => p[1]), 90);
  const width = Math.max(...coords.map((p) => p[0]), minX) - minX;
  const height = Math.max(...coords.map((p) => p[1]), minY) - minY;
  const scale = Math.min(
    900 / Math.max(width, 0.00001),
    550 / Math.max(height, 0.00001),
  );
  const project = (p: { latitude: number; longitude: number }) => {
    const [x, y] = xy(p);
    return [
      50 + (900 - width * scale) / 2 + (x - minX) * scale,
      25 + (550 - height * scale) / 2 + (y - minY) * scale,
    ];
  };
  const selectedIds = new Set(selected.map((p) => p.id));
  const colors: Record<string, string> = {
    WATER: '#2878ce',
    SHELTER: '#c87810',
    CAMP: '#16804c',
  };
  const circles = (pois: RoutePoiWithSource[], featured: boolean) =>
    pois
      .map((p) => {
        const [x, y] = project(p);
        return `<circle cx="${x}" cy="${y}" r="${featured ? 7 : 3}" fill="${featured ? colors[p.type] : '#a3a3a3'}"><title>${escape(p.label)} | ${p.type} | ${(p.distanceFromStartM / 1000).toFixed(2)} km | offset ${p.distanceFromRouteM} m | ${p.confidence} | ${p.access}</title></circle>`;
      })
      .join('');
  return `<!doctype html><html lang="en"><meta charset="utf-8"><title>POI debug</title>
<style>body{font:16px Georgia;margin:24px;background:#faf8f1;color:#24342d}svg{width:100%;max-height:65vh;background:#fff;border:1px solid #ddd}table{border-collapse:collapse;width:100%}td,th{text-align:left;padding:8px;border-bottom:1px solid #ddd}#toggle:not(:checked)~svg .candidates{display:none}</style>
<h1>${escape(fixture.route.title)}</h1><p>${fixture.route.distanceM === null ? 'Unknown length' : (fixture.route.distanceM / 1000).toFixed(1) + ' km'} | ${escape(fixture.route.status)} | ${fixture.pois.length} candidates / ${selected.length} featured</p>
<p>Offline track diagram (no basemap). Blue: water; amber: shelter; green: camp. Hover a point for details. Unselected does not mean unavailable.</p>
<input id="toggle" type="checkbox" checked><label for="toggle"> Show all candidates</label>
<svg viewBox="0 0 1000 600" role="img" aria-label="Route and POI distribution"><polyline points="${fixture.route.coordinates.map((p) => project(p).join(',')).join(' ')}" fill="none" stroke="#375f51" stroke-width="2"/><g class="candidates">${circles(
    fixture.pois.filter((p) => !selectedIds.has(p.id)),
    false,
  )}</g>${circles(selected, true)}</svg>
<h2>Featured points in route order</h2><table><tr><th>km</th><th>Type</th><th>Name</th><th>Offset (m)</th><th>Confidence</th><th>Access</th></tr>${selected.map((p) => `<tr><td>${(p.distanceFromStartM / 1000).toFixed(2)}</td><td>${p.type}</td><td>${escape(p.label)}</td><td>${p.distanceFromRouteM}</td><td>${p.confidence}</td><td>${escape(p.access)}</td></tr>`).join('')}</table></html>`;
}

async function main() {
  const { values } = parseArgs({
    options: {
      route: { type: 'string' },
      fixture: { type: 'string' },
      out: { type: 'string' },
      help: { type: 'boolean' },
    },
  });
  if (values.help) {
    console.log(
      'npm run debug:pois -- --route <id> [--out .poi-debug/name]\nnpm run debug:pois -- --fixture .poi-debug/name/fixture.json [--out .poi-debug/replay]',
    );
    return;
  }
  if (Boolean(values.route) === Boolean(values.fixture))
    throw new Error('Provide exactly one of --route or --fixture');
  const fixture: Fixture = values.fixture
    ? JSON.parse(await readFile(resolve(values.fixture), 'utf8'))
    : await fromDatabase(values.route!);
  validate(fixture);
  const selected = selectFeaturedRoutePois(
    fixture.pois,
    fixture.route.distanceM,
  );
  const out = resolve(values.out ?? `.poi-debug/${Date.now()}`);
  await mkdir(out, { recursive: true });
  await writeFile(
    resolve(out, 'fixture.json'),
    JSON.stringify(fixture, null, 2),
  );
  await writeFile(
    resolve(out, 'result.json'),
    JSON.stringify(
      {
        routeId: fixture.route.id,
        candidateCount: fixture.pois.length,
        featuredCount: selected.length,
        featuredPois: selected,
      },
      null,
      2,
    ),
  );
  await writeFile(resolve(out, 'map.html'), html(fixture, selected));
  console.log(
    `${fixture.pois.length} candidates -> ${selected.length} featured. Status: ${fixture.route.status}`,
  );
  if (fixture.route.status !== 'READY')
    console.warn('Snapshot is not READY; enrichment may be incomplete.');
  console.table(
    selected.map((p) => ({
      type: p.type,
      label: p.label,
      km: p.distanceFromStartM / 1000,
    })),
  );
  console.log(`Output: ${out}`);
}

if (require.main === module)
  main().catch(() => {
    console.error(
      'POI debug failed. Check arguments (--help), fixture format, DATABASE_URL and database availability.',
    );
    process.exitCode = 1;
  });
