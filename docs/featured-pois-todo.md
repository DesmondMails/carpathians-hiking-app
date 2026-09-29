# Featured POIs TODO

## Goal

Show only the most useful POI on the main route screen while keeping the full POI set available through the dedicated POI endpoint.

## Tasks

- [x] Define the `featuredPois` product rules
- [x] Implement backend POI selection utility
- [x] Exclude `PEAK` from default featured output
- [x] Limit featured counts by POI type
- [x] Add route-spacing rules by `distanceFromStartM`
- [x] Prioritize strong shelters over fallback `hut/cabin`
- [x] Return featured POI in route details response
- [x] Keep full POI set in `GET /routes/:id/pois`
- [x] Update mobile route screen to use featured POI only
- [x] Stop route screen from replacing featured POI with full POI set
- [x] Verify mobile lint still passes
- [x] Update docs/backlog to reflect final featured POI flow

## Preview V2

### Baseline before selector replacement

- [x] Capture four real READY routes: short, medium, long and sparse
- [x] Freeze fixtures, existing selections and HTML diagrams in `apps/api/test/fixtures/poi-baseline-v2`
- [x] Archive selector/constants/types and record SHA-256 hashes
- [x] Verify byte-identical results on offline replay for all four fixtures
- [x] Add behavioral regression tests and an offline baseline comparison mode
- [x] Implement and evaluate the replacement selector using the frozen fixtures

- [x] Replace fixed per-type limits with route-length-based target point count
- [x] Add preview point quotas by POI type
- [x] Add distribution by route progress instead of only raw ranking
- [x] Add start-zone penalty for `CAMP` on longer routes
- [x] Keep same-type spacing and add overall anti-clumping spacing

### Baseline restored (current)

- [x] Remove the experimental coverage selector; keep baseline as the only implementation
- [x] Use the same selector in route details, debug runner and comparison
- [x] Add exact regression checks against all four frozen baseline results
- [ ] Make the length-based budget monotonic across 5 km and 25 km
- [ ] Improve distribution within each category without replacing water with camps
- [ ] Review actual mobile previews for all four baseline routes
- [ ] Validate weights and the 16-marker cap on additional long/loop routes

The side-by-side HTML compares frozen results with the current implementation,
not two live algorithms. See [experiment history](featured-pois-coverage.md).
