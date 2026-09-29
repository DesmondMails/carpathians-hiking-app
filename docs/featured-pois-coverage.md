# Featured POI coverage selector

> Historical experiment, no longer active. The coverage implementation was removed
> after visual review showed excessive campsite selection at the expense of water
> and shelters. `selectFeaturedRoutePois` now contains the original baseline only.
> The description below records the rejected experiment, not current behavior.
> No legacy export or runtime algorithm switch remains. Offline comparison still
> compares frozen baseline results with the single current selector.

## Flow and compatibility

Enrichment and storage are unchanged. Route details invoke `selectFeaturedRoutePois`,
now an alias for `selectCoverageFeaturedPois`. The response and mobile contracts
remain unchanged; the full POI endpoint still returns the complete set.
No migration or repeat Overpass enrichment is required.

The previous implementation remains exported as `selectLegacyFeaturedRoutePois`
in `featured-route-pois.ts`. To roll back, change the public alias to that function.
Frozen baseline fixtures must not be regenerated to approve a new selection.

## Selection

1. Keep WATER, SHELTER and CAMP with finite coordinates and nonnegative distances.
2. Determine route length; missing/invalid length falls back to the furthest POI.
3. Compute a target budget (not a guaranteed count), with length L in km:
   up to 5 km: `max(4, ceil(1.6 * L))`; up to 25 km:
   `ceil(8 + 0.2 * (L - 5))`; above 25 km:
   `min(16, ceil(12 + 0.13 * (L - 25)))`.
4. Sample the route uniformly by progress. Each candidate contributes triangular
   coverage within `length / budget`, scaled by confidence, subtype and distance
   from the track. Private access and non-potable water lower quality, not eligibility.
5. Repeatedly choose the largest additional coverage gain. Overall route coverage
   has weight 2; additional per-type coverage has weights WATER 1, SHELTER 0.85,
   CAMP 0.75. There are no reserved per-type quotas. Early camps (first 12% on
   routes over 15 km) receive a modest 15% gain penalty.
6. Reject duplicate IDs and points too close to an already selected point:
   progress spacing is `clamp(0.2 * length / budget, 60, 650)` metres; geographic
   spacing is the smaller of that value and 150 metres, including across types.
7. Stop at the budget or when no eligible positive gain remains. Return points in
   route order. ID tie-breaking makes selection stable for unique-ID input.

Coverage means preview representation, not a claim that water or shelter is
accessible throughout that distance. OSM access/potability data remains uncertain.
The greedy heuristic does not guarantee minimum maximum gap or every type's inclusion.
Geographic spacing is not screen-space collision detection: markers can still
overlap on a small static preview. Hub/full-map behavior is outside this change.

## Offline evaluation

Run from `apps/api`: `npm run test:pois` and `npm run debug:pois:compare`.
Comparison verifies frozen fixture/result hashes and writes a timestamped JSON
report under `.poi-debug`, without accessing the database or Overpass.

| Fixture | Previous count | New count | Previous maximum gap | New maximum gap |
| --- | ---: | ---: | ---: | ---: |
| Short | 3 | 4 | 2006 m | 2006 m |
| Medium | 12 | 12 | 2910 m | 3580 m |
| Long | 16 | 16 | 6620 m | 4387 m |
| Sparse | 1 | 2 | 286 m | 283 m |

Gaps include route start and end. The medium regression is explicit: quality and
type diversity can win over tighter gaps. Four fixtures are regression evidence,
not proof of production quality. Visual mobile review and more loop/long routes
remain required before treating the weights and marker cap as settled.
