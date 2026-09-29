# POI debug runner

## Regression checks and baseline comparison

From `apps/api`:

```sh
npm run test:pois
npm run debug:pois:compare
```

The regression suite checks supported types, membership in the input, uniqueness,
ordering, the global 16-marker ceiling, determinism and input immutability on all
four real fixtures. Additional cases cover empty/unsupported data, unknown length,
duplicate IDs and a long route with one POI. These are runtime tests, not a full
TypeScript build. They deliberately do not freeze exact selected IDs as correctness
requirements or lock in the current discontinuous route-length budget formula.

Comparison verifies baseline fixture/result SHA-256 hashes before running the
current selector. It writes a timestamped `.poi-debug/comparison-*/comparison.json`
with added/removed POIs, current selected POIs, type counts, counts per route third,
first/last position and largest progression gap (including start/end). Baseline
files are never overwritten. Differences are reported, not treated as failures.

All comparisons are offline. Gaps describe displayed markers, not physical water
or shelter availability. Screen-space overlap, loop handling and quality of future
coverage selection still need separate validation.

Run from `apps/api`. No API server or Overpass calls are needed.

## Capture an existing route

```sh
npm run debug:pois -- --route ROUTE_ID --out .poi-debug/baseline
```

Reads `DATABASE_URL` from the API environment/.env. Uses a read-only transaction to capture the route and all persisted POIs consistently. Does not trigger enrichment or change the database. Prefer routes with READY status.

## Replay after changing the selector

```sh
npm run debug:pois -- --fixture .poi-debug/baseline/fixture.json --out .poi-debug/experiment
```

Replay is offline and executes the real `selectFeaturedRoutePois` implementation. Open `map.html` in a browser: grey points are unselected candidates, colored points are featured, and the line is the route. Hover points for details, toggle candidates, and compare baseline vs experiment side by side.

Outputs: `fixture.json` (versioned input snapshot), `result.json` (selected POIs), and `map.html` (self-contained diagram without external tiles). The terminal also prints selected types and kilometers. The diagram preserves approximate geographic proportions but is not a navigational map. Reasons for individual rejections are not currently instrumented.

Fixtures contain normalized, persisted POIs, not raw Overpass responses. This runner tests featured selection, not query coverage or normalization. New query-builder rules require a separately refreshed enrichment before capturing a new fixture. Missing POIs cannot be recovered from an old snapshot.

Generated artifacts under `apps/api/.poi-debug/` are git-ignored. Use separate output folders to preserve comparisons. No automatic browser launch or database migration is performed.
# Side-by-side baseline comparison

From the repository root run `npm run debug:pois:compare --workspace api`.
Open the printed `.poi-debug/comparison-<timestamp>/comparison.html` path.
The self-contained HTML shows all four frozen baseline cases: original selection
on the left, current selection on the right, with identical projection and scale.
Each panel includes candidate toggling, marker tooltips and a selected-point table.
Counts, maximum gaps and added/removed lists help explain the differences.
On narrow screens the panels stack vertically. No database, Overpass, map tiles
or network access is required. `comparison.json` is still generated alongside it.
