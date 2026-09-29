import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { selectFeaturedRoutePois } from '../src/modules/routes/mappers/featured-route-pois';
import type { RoutePoiWithSource } from '../src/modules/routes/types/featured-pois';
import { comparisonPanel, metrics } from './compare-pois';

test('selection is independent of candidate order', () => {
  const fixture = load('long');
  assert.deepEqual(
    selectFeaturedRoutePois(fixture.pois, fixture.route.distanceM),
    selectFeaturedRoutePois(
      [...fixture.pois].reverse(),
      fixture.route.distanceM,
    ),
  );
});

test('a dense early cluster does not exclude isolated middle and late resources', () => {
  const points = Array.from({ length: 30 }, (_, i) => ({
    ...sample,
    id: `early-${i}`,
    latitude: 48,
    longitude: 24,
    distanceFromStartM: i * 5,
  }));
  points.push({
    ...sample,
    id: 'middle',
    latitude: 48.2,
    longitude: 24,
    distanceFromStartM: 20000,
  });
  points.push({
    ...sample,
    id: 'late',
    latitude: 48.4,
    longitude: 24,
    distanceFromStartM: 45000,
  });
  const selected = selectFeaturedRoutePois(points, 50000);
  assert.ok(selected.some((p) => p.id === 'middle'));
  assert.ok(selected.some((p) => p.id === 'late'));
  assert.equal(selected.filter((p) => p.id.startsWith('early')).length, 1);
});

const load = (name: string) =>
  JSON.parse(
    readFileSync(
      resolve('test/fixtures/poi-baseline-v2', name, 'fixture.json'),
      'utf8',
    ),
  );
const sample: RoutePoiWithSource = load('long').pois.find(
  (p) => p.type === 'WATER',
);

test('visual comparison embeds two isolated panels and escapes labels', () => {
  const stats = metrics([], 1000);
  const panel = comparisonPanel(
    '<route>',
    0,
    '<svg>before</svg>',
    '<svg>after</svg>',
    stats,
    stats,
    [{ ...sample, label: '<script>alert(1)</script>' }],
    [],
  );
  assert.equal((panel.match(/<iframe /g) ?? []).length, 2);
  assert.equal((panel.match(/sandbox/g) ?? []).length, 2);
  assert.ok(panel.includes('&lt;svg&gt;before&lt;/svg&gt;'));
  assert.ok(panel.includes('&lt;svg&gt;after&lt;/svg&gt;'));
  assert.ok(panel.includes('&lt;route&gt;'));
  assert.ok(!panel.includes('<script>'));
});

for (const name of ['short', 'medium', 'long', 'sparse']) {
  test(`${name}: selection matches the frozen baseline`, () => {
    const fixture = load(name);
    const expected = JSON.parse(
      readFileSync(
        resolve('test/fixtures/poi-baseline-v2', name, 'result.json'),
        'utf8',
      ),
    ).featuredPois;
    assert.deepEqual(
      selectFeaturedRoutePois(fixture.pois, fixture.route.distanceM),
      expected,
    );
  });
  test(`${name}: valid, unique, ordered subset; deterministic and input unchanged`, () => {
    const fixture = load(name);
    const before = JSON.stringify(fixture);
    const selected = selectFeaturedRoutePois(
      fixture.pois,
      fixture.route.distanceM,
    );
    assert.ok(selected.length <= Math.min(16, fixture.pois.length));
    assert.equal(new Set(selected.map((p) => p.id)).size, selected.length);
    for (const [i, poi] of selected.entries()) {
      assert.ok(['WATER', 'SHELTER', 'CAMP'].includes(poi.type));
      assert.deepEqual(
        poi,
        fixture.pois.find((p) => p.id === poi.id),
      );
      if (i)
        assert.ok(poi.distanceFromStartM >= selected[i - 1].distanceFromStartM);
    }
    assert.deepEqual(
      selected,
      selectFeaturedRoutePois(fixture.pois, fixture.route.distanceM),
    );
    assert.equal(JSON.stringify(fixture), before);
  });
}

test('empty and unsupported inputs return no featured points', () => {
  assert.deepEqual(selectFeaturedRoutePois([], null), []);
  assert.deepEqual(
    selectFeaturedRoutePois(
      [
        { ...sample, type: 'PEAK' },
        { ...sample, id: 'view', type: 'VIEWPOINT' },
      ],
      5000,
    ),
    [],
  );
});

test('missing length is deterministic and retains an isolated useful point', () => {
  const points = [{ ...sample, distanceFromStartM: 2000 }];
  assert.deepEqual(selectFeaturedRoutePois(points, null), points);
});

test('duplicate IDs cannot produce duplicate featured markers', () => {
  const points = [sample, { ...sample, distanceFromStartM: 20000 }];
  assert.equal(selectFeaturedRoutePois(points, 30000).length, 1);
});

test('a long sparse route does not invent points to fill its budget', () => {
  const points = [{ ...sample, distanceFromStartM: 30000 }];
  assert.deepEqual(selectFeaturedRoutePois(points, 60000), points);
});

test('comparison metrics include start/end gaps and route thirds', () => {
  assert.deepEqual(metrics([], 9000), {
    count: 0,
    types: { WATER: 0, SHELTER: 0, CAMP: 0 },
    thirds: [0, 0, 0],
    maxGapM: 9000,
    firstM: null,
    lastM: null,
  });
  const result = metrics(
    [1000, 4000, 8000].map((distanceFromStartM, i) => ({
      ...sample,
      id: String(i),
      distanceFromStartM,
    })),
    9000,
  );
  assert.deepEqual(result.thirds, [1, 1, 1]);
  assert.equal(result.maxGapM, 4000);
});
