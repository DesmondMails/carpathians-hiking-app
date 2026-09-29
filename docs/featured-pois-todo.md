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
- [x] Make the length-based budget monotonic across 5 km and 25 km
- [ ] Improve distribution within each category without replacing water with camps

### Step 2: conservative post-selection swaps (current)

The proximity penalty described below has been removed. Baseline anchor selection
and ranked fill are restored, followed by same-type swaps. Each accepted swap
strictly reduces that category's maximum gap including endpoints and cannot
increase the overall maximum gap. Confidence, access, water potability, offset
from track and aggregate quality score cannot regress. Existing same-type spacing
and the baseline relaxed overall spacing floor are enforced for replacements.
Counts and categories are preserved. Work is bounded to the initial selection
size in passes and 20,000 candidate checks; this is not a global optimizer.

All four fixtures retain their category counts and non-increasing gaps. Short,
medium and sparse retain exact selections. Long changes two points: WATER gap
16416 -> 13356 m, CAMP 24969 -> 22649 m; overall gap remains 6620 m.
Visual review remains pending, especially the tradeoff between endpoint visibility
and the worst gap; these metric guarantees do not guarantee user preference.

### Rejected proximity-penalty experiment (historical)

The current selector subtracts up to 60 score points for proximity to the nearest
selected POI of the same type, with radius `routeDistanceM / typeQuota`. Other
types incur no new penalty. Existing hard spacing, quotas and quality scores
remain unchanged. Remaining-slot selection recomputes scores after every choice.
Frozen fixtures/results are untouched; tests now assert category counts for
medium/long rather than exact equality to the old selection. Short/sparse remain exact.

- [x] Add bounded same-type penalty and dynamic remaining-slot ranking
- [x] Test penalty isolation, confidence-tier bound and category counts
- [x] Include per-type metrics in comparison JSON (`byType`)
- [ ] Resolve medium-route regressions before accepting this as an improvement
- [ ] Review resulting mobile previews

Measured maximum gaps (including route endpoints): long SHELTER improves
26802 -> 16140 m and CAMP 24969 -> 22649 m; WATER is unchanged. Medium worsens:
WATER 7400 -> 9811 m, SHELTER 8095 -> 8690 m, CAMP 11187 -> 17483 m.
This is a local heuristic, not a guarantee of improved category coverage.
- [ ] Review actual mobile previews for all four baseline routes
- [ ] Validate weights and the 16-marker cap on additional long/loop routes

The side-by-side HTML compares frozen results with the current implementation,
not two live algorithms. See [experiment history](featured-pois-coverage.md).

### Step 1: monotonic budget

Keep baseline formulas, but raise the medium minimum from 6 to 8 and the long
minimum from 10 to 12. With L in km: up to 5 km use
`clamp(ceil(1.6 * L), 4, 8)`; up to 25 km use
`clamp(ceil(0.5 * L + 2), 8, 12)`; above 25 km use
`clamp(ceil(0.22 * L + 4), 12, 16)`.
This changes only the target budget, not scoring, spacing or quota formulas.
Actual selection may contain fewer points; its count is not guaranteed monotonic.
Tests cover both boundaries, integer/bounded monotonic growth through 200 km,
and unchanged results for the four frozen fixtures.
