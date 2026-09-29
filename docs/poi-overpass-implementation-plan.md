# POI Overpass Implementation Plan

## Goal

Implement automatic POI enrichment for hiking routes using Overpass only.

Scope:

- import GPX
- fetch nearby POI from Overpass
- normalize and filter OSM data
- persist selected POI in dedicated tables
- expose POI in route APIs
- render POI on mobile map and route screen

Non-goals for this phase:

- multiple POI providers
- manual POI editing UI
- replacing route geometry with OSM route relations

## Product Decision

We use Overpass as the single POI provider.

Supported POI types:

- `WATER`
- `SHELTER`
- `VIEWPOINT`
- `PEAK`

Extra map category for later:

- `CAMP`

For this implementation, `CAMP` may be queried and stored later, but it is not part of the core `RoutePoiType` contract unless product explicitly adds it to shared types and UI.

## Current State

Current codebase already supports route POI rendering on mobile through `RouteDetails.poiMarkers`, but backend flow is incomplete:

- GPX parser returns geometry and elevation, but not POI
- route draft preview can store POI-shaped data, but parsing/finalization does not carry it through fully
- route POI were previously considered as JSON on `Route`, but this should not be used as the target architecture

## Target Architecture

### High-level flow

1. User uploads GPX.
2. Backend parses route geometry and elevation.
3. Route is published.
4. Backend starts asynchronous Overpass enrichment for the published route.
5. Backend fetches raw OSM objects for supported POI categories.
6. Backend normalizes OSM tags into internal POI candidates.
7. Backend filters, scores, deduplicates, and sorts POI.
8. Backend stores POI in dedicated route POI tables.
9. Route API exposes POI through a dedicated endpoint and status field.
10. Mobile shows loader state until POI are ready.

### Persistence model

Recommended dedicated tables:

#### `route_poi_source`

Stores raw provider objects for traceability and reprocessing.

Suggested fields:

- `id`
- `provider` = `OVERPASS`
- `osmType` = `node | way | relation`
- `osmId`
- `rawTagsJson`
- `rawGeometryCenterJson`
- `fetchedAt`
- `hash`

Suggested constraints:

- unique index on `provider + osmType + osmId`

#### `route_poi`

Stores POI actually attached to a route.

Suggested fields:

- `id`
- `routeId`
- `sourceId` nullable, relation to `route_poi_source`
- `type` = `WATER | SHELTER | VIEWPOINT | PEAK`
- `subtype` nullable
- `label`
- `latitude`
- `longitude`
- `distanceFromRouteM`
- `distanceFromStartM`
- `confidence` = `HIGH | MEDIUM | LOW`
- `waterPotability` nullable = `CONFIRMED | UNKNOWN | NON_POTABLE`
- `access` nullable
- `sortOrder`
- `metadataJson`
- `createdAt`
- `updatedAt`

Suggested indexes:

- `routeId`
- `routeId + type`
- `routeId + sortOrder`

### Why two tables

`route_poi_source` gives:

- traceability to the original OSM object
- easier debugging
- reprocessing when mapping rules change
- dedup against repeated imports

`route_poi` gives:

- stable snapshot for route rendering
- decoupling from future OSM edits
- easy frontend contract

## Data Model Mapping

### `PEAK`

Strong match:

- `natural=peak`

Normalization:

- `type = PEAK`
- `subtype = natural_peak`
- `label = name || ele + " m" || "Peak"`
- `confidence = HIGH` if `name` exists, otherwise `MEDIUM`

### `VIEWPOINT`

Strong match:

- `tourism=viewpoint`

Normalization:

- `type = VIEWPOINT`
- `subtype = tourism_viewpoint`
- `label = name || "Viewpoint"`
- `confidence = HIGH`

Metadata worth storing:

- `direction`
- `viewpoint`
- `tower:type`

### `SHELTER`

Strong matches:

- `amenity=shelter`
- `tourism=wilderness_hut`
- `tourism=alpine_hut`

Fallback matches:

- `building=hut`
- `building=cabin`

Fallback conditions for `building=hut|cabin`:

- has `name`, or
- has `tourism=*`, or
- has `shelter_type=*`, or
- has `fireplace=*`, or
- has `operator=*`, or
- is very close to route corridor

Normalization:

- `type = SHELTER`
- `subtype` one of:
  - `amenity_shelter`
  - `wilderness_hut`
  - `alpine_hut`
  - `building_hut`
  - `building_cabin`
- `label = name || subtype label || "Shelter"`
- `confidence = HIGH` for tourism/amenity matches
- `confidence = LOW | MEDIUM` for building fallback

### `WATER`

Strong matches:

- `amenity=drinking_water`
- `man_made=water_tap` + `drinking_water=yes`
- `man_made=water_tap` + `amenity=drinking_water`
- `natural=spring` + `drinking_water=yes`

Medium matches:

- `natural=spring`
- `amenity=fountain` + `drinking_water=yes`
- `man_made=water_well` + `drinking_water=yes`

Excluded:

- `amenity=water`
- `amenity=watering_place`
- generic rivers/streams/lakes as POI

Normalization:

- `type = WATER`
- `subtype` one of:
  - `drinking_water`
  - `spring`
  - `water_tap`
  - `water_well`
  - `drinking_fountain`
- `label = name || subtype label || "Water"`
- `waterPotability`:
  - `CONFIRMED` when potable signal exists
  - `UNKNOWN` for spring without potable signal
  - `NON_POTABLE` when explicitly tagged

## Overpass Query Strategy

### Phase 1 query style

Use a widened `bbox` during validation and early rollout.

### Phase 2 query style

Move to route corridor based fetching:

1. Simplify route polyline.
2. Split route into points every fixed distance.
3. Build corridor search using `around` queries or a small set of route windows.
4. Deduplicate results by `osmType + osmId`.

Target corridor size:

- strict route relevance: `75m - 150m`
- wider discovery mode: `200m - 400m`

### Recommended implementation detail

Do not call Overpass for each GPX point.

Preferred approach:

- simplify track first
- sample representative points
- query in chunks

This keeps request count and response size manageable.

## Sequential Implementation Plan

### Phase 1. Schema and contracts

1. Add Prisma model for `RoutePoi`.
2. Add Prisma model for `RoutePoiSource`.
3. Add enums:
   - `RoutePoiConfidence`
   - `RoutePoiWaterPotability`
4. Add relation from `Route` to `RoutePoi`.
5. Generate Prisma client and create migration.
6. Keep old temporary route POI JSON fields untouched only if needed for compatibility, but stop writing to them.

Deliverables:

- migration
- generated client
- schema reviewed

### Phase 2. Shared types

1. Keep existing `RoutePoiType` as:
   - `WATER`
   - `SHELTER`
   - `VIEWPOINT`
   - `PEAK`
2. Extend shared `RoutePoi` payload if needed with optional fields:
   - `subtype?`
   - `confidence?`
   - `waterPotability?`
3. Keep current `poiMarkers` response shape stable for mobile.

Deliverables:

- updated shared types
- no breaking API changes for mobile

### Phase 3. Overpass module

1. Add a dedicated module, for example `poi-enrichment`.
2. Add `OverpassClientService`.
3. Add query builder:
   - `buildPoiQueryForBbox`
   - later `buildPoiQueryForRouteCorridor`
4. Add timeout, retry, and response parsing.
5. Add clear logging:
   - route id / draft id
   - request duration
   - result count
   - failures

Deliverables:

- isolated Overpass client
- testable query builder

### Phase 4. Normalization layer

1. Add `normalizeOverpassElementToPoiCandidate`.
2. Convert OSM tags into internal candidate shape.
3. Map tags according to the rules above.
4. Produce a consistent normalized structure before DB write.

Suggested normalized shape:

```ts
type NormalizedPoiCandidate = {
  provider: 'OVERPASS'
  osmType: 'node' | 'way' | 'relation'
  osmId: string
  type: 'WATER' | 'SHELTER' | 'VIEWPOINT' | 'PEAK'
  subtype?: string
  label: string
  latitude: number
  longitude: number
  confidence: 'HIGH' | 'MEDIUM' | 'LOW'
  waterPotability?: 'CONFIRMED' | 'UNKNOWN' | 'NON_POTABLE'
  access?: string
  rawTags: Record<string, string>
}
```

Deliverables:

- normalization functions
- mapping unit tests

### Phase 5. Filtering and scoring

1. Filter unsupported or obviously bad elements.
2. Drop lifecycle-tagged objects:
   - `disused:*`
   - `abandoned:*`
   - `ruins:*`
3. Score by relevance:
   - supported tag strength
   - distance to route
   - presence of `name`
   - access restrictions
   - potable signal for water
4. Deduplicate same-type POI in a small radius.
5. Sort by `distanceFromStartM`.

Suggested filtering rules:

- hard reject:
  - no usable coordinates
  - unsupported tags
  - obviously deprecated tags
- soft downgrade:
  - `access=private`
  - unnamed fallback hut/cabin
  - spring without potable signal

Deliverables:

- deterministic filter/scoring pipeline
- radius-based dedup

### Phase 6. Geometry utilities

1. Add utility to compute shortest distance from POI to route polyline.
2. Add utility to project POI onto route and compute `distanceFromStartM`.
3. Store:
   - `distanceFromRouteM`
   - `distanceFromStartM`
4. Use `@turf/turf` for first implementation.

Deliverables:

- route distance helpers
- sorted POI output

### Phase 7. Post-publish enrichment flow

1. After route finalization, trigger POI enrichment asynchronously.
2. Mark route `poiEnrichmentStatus = PENDING`.
3. Run Overpass fetch, normalization, filtering, scoring, and dedup.
4. Persist `RoutePoiSource` and `RoutePoi`.
5. Mark route `poiEnrichmentStatus = READY` or `FAILED`.

Deliverables:

- POI are created only after publish
- route publish is not blocked by Overpass latency

### Phase 8. Route API integration

1. Keep `GET /routes/:id` backward compatible and expose `poiEnrichmentStatus`.
2. Add dedicated `GET /routes/:id/pois` endpoint.
3. Return:
   - `status`
   - `poiMarkers`
4. Keep route POI stored only in relational tables.

Deliverables:

- mobile can load route first, then POI separately
- frontend can distinguish `PENDING`, `READY`, and `FAILED`

### Phase 9. Mobile integration

1. Add POI loader flow on top of route details screen.
2. Fetch route details first.
3. Then fetch `GET /routes/:id/pois`.
4. Render loader while POI status is `PENDING`.
5. Render markers when status is `READY`.
6. Gracefully handle `FAILED`.

Deliverables:

- loader-friendly POI UX without blocking route screen

### Phase 10. Mobile integration

1. Keep `PoiMarkers.tsx` rendering logic.
2. Extend selected POI card if needed to show:
   - subtype
   - potable state for water
3. Keep icon and color mapping by main type.
4. Optional later improvement:
   - separate icons for `spring` vs `tap`
   - separate icons for `wilderness_hut` vs `shelter`

Deliverables:

- no major UI refactor required
- POI render path stays stable

### Phase 11. Testing

1. Unit tests for OSM tag normalization.
2. Unit tests for filter/scoring logic.
3. Unit tests for dedup behavior.
4. Integration test for GPX import -> draft enrichment.
5. Integration test for finalize -> route details.
6. Manual validation on real GPX files from target regions.

Deliverables:

- predictable mapping quality
- safer rollout

### Phase 12. Rollout

1. Enable Overpass enrichment for new GPX imports only.
2. Validate on internal routes.
3. Review false positives and missing POI.
4. Tune tag mapping and corridor distance.
5. Only after stabilization, consider backfill for older routes.

## Filtering Rules Summary

### Keep

- supported OSM tags for the four POI types
- named POI
- unnamed POI with strong semantic signal

### Downgrade

- `access=private`
- unnamed `building=hut|cabin`
- `natural=spring` without potable signal

### Exclude

- deprecated ambiguous tags like `amenity=water`
- irrelevant shelter subtypes such as public transport shelters
- lifecycle-tagged abandoned/disused ruins

## Frontend Impact

Minimal frontend change is expected.

Existing components already support:

- list of POI markers
- selected POI state
- icon/color by type

Recommended small additions later:

- optional badge for `waterPotability`
- optional subtitle from `subtype`

## Risks

### 1. Overpass instability

Risk:

- public instance can timeout or rate limit

Mitigation:

- retries with backoff
- enrichment happens once on import, not on every route read
- route creation should not fail hard if POI enrichment fails

### 2. OSM tag inconsistency

Risk:

- same real-world object mapped differently in different regions

Mitigation:

- strong/medium/fallback mapping layers
- raw source storage for reprocessing
- validation on real local routes

### 3. Too much noise from fallback tags

Risk:

- `building=hut|cabin` can be noisy

Mitigation:

- treat as fallback only
- require supporting tags or route proximity

### 4. Route-wide bbox noise

Risk:

- wide bbox returns too many unrelated POI

Mitigation:

- use bbox only in early validation
- move to route corridor query in implementation

## Recommended Milestones

### Milestone 1

Database schema + shared types + Overpass client

### Milestone 2

Normalization + filtering + geometry scoring

### Milestone 3

Draft enrichment + finalization persistence

### Milestone 4

Route details API + mobile validation

### Milestone 5

Tuning + rollout + optional backfill

## Estimate

### MVP

- schema and migration: `0.5-1 day`
- Overpass client and query builder: `1 day`
- normalization and filtering: `1.5-2 days`
- route distance and sorting helpers: `1 day`
- draft/finalization integration: `1.5-2 days`
- API integration: `0.5-1 day`
- mobile validation and polish: `0.5 day`
- tests and manual validation: `1-1.5 days`

Total:

- `7-10 working days`

### Safer production rollout

Add:

- stronger retry/error handling
- better raw source storage
- corridor query optimization
- backfill tooling
- richer observability

Total:

- `10-14 working days`

## Recommended Order of Work

Do work in this exact order:

1. Prisma schema and migration
2. shared POI contract review
3. Overpass client
4. OSM -> internal normalization
5. filtering, dedup, scoring
6. route distance calculations
7. draft enrichment
8. finalization persistence
9. route details API mapping
10. mobile validation
11. tests
12. rollout tuning

## Final Recommendation

Use Overpass only.

Persist final POI in dedicated relational tables.

Treat OSM as an enrichment source, not as a read-time dependency.

Keep frontend contract stable by continuing to return `poiMarkers`, but source it from relational POI storage instead of temporary route JSON.
