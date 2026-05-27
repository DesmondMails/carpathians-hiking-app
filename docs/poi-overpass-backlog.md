# POI Overpass Backlog

Related document:

- [POI Overpass Implementation Plan](/Users/mikitabudejcuk/Documents/projects/hiking-app/docs/poi-overpass-implementation-plan.md)

Architecture note:

- POI are not stored in `RouteDraftPreview`
- POI enrichment starts only after route publish/finalize
- mobile should use route-level POI status and a dedicated POI endpoint

## Status Legend

- `[ ]` not started
- `[~]` in progress
- `[x]` done

## Epic 1. Schema and Persistence

### 1.1 Add `RoutePoi` Prisma model

- [x] Create `RoutePoi` model in Prisma schema
- [ ] Add fields for:
  - [x] `routeId`
  - [x] `sourceId`
  - [x] `type`
  - [x] `subtype`
  - [x] `label`
  - [x] `latitude`
  - [x] `longitude`
  - [x] `distanceFromRouteM`
  - [x] `distanceFromStartM`
  - [x] `confidence`
  - [x] `waterPotability`
  - [x] `access`
  - [x] `sortOrder`
  - [x] `metadataJson`
  - [x] timestamps
- [x] Add relation from `Route` to `RoutePoi`

Definition of done:

- [x] Prisma schema compiles
- [x] Model matches architecture doc

### 1.2 Add `RoutePoiSource` Prisma model

- [x] Create `RoutePoiSource` model in Prisma schema
- [ ] Add fields for:
  - [x] `provider`
  - [x] `osmType`
  - [x] `osmId`
  - [x] `rawTagsJson`
  - [x] `rawGeometryCenterJson`
  - [x] `fetchedAt`
  - [x] `hash`
- [x] Add relation from `RoutePoiSource` to `RoutePoi`
- [x] Add unique constraint on `provider + osmType + osmId`

Definition of done:

- [x] Prisma schema compiles
- [x] Unique source dedup is enforced in schema

### 1.3 Add enums and indexes

- [x] Add `RoutePoiConfidence` enum
- [x] Add `RoutePoiWaterPotability` enum
- [ ] Add indexes:
  - [x] `routeId`
  - [x] `routeId + type`
  - [x] `routeId + sortOrder`

Definition of done:

- [x] Query shape is supported by indexes

### 1.4 Create and validate migration

- [x] Generate Prisma migration
- [x] Review SQL before applying
- [x] Ensure no migration depends on `poiMarkersJson`

Definition of done:

- [ ] Migration applies successfully
- [x] Prisma client is regenerated

## Epic 2. Shared Contracts

### 2.1 Review and update shared POI types

- [x] Review `packages/shared/src/types/route-details.ts`
- [ ] Confirm final core types remain:
  - [x] `WATER`
  - [x] `SHELTER`
  - [x] `VIEWPOINT`
  - [x] `PEAK`
- [ ] Decide whether to add optional fields:
  - [x] `subtype?`
  - [x] `confidence?`
  - [x] `waterPotability?`

Definition of done:

- [x] Shared types reflect backend output
- [x] Existing mobile screens stay compatible

### 2.2 Review route draft preview contract

- [x] Review `RouteDraftPreview` type
- [x] Decide whether preview carries normalized POI directly
- [x] Keep preview versioning in mind if structure changes

Definition of done:

- [x] Draft preview format for POI is decided before implementation

## Epic 3. Overpass Integration

### 3.1 Create POI enrichment module

- [x] Add new module under `apps/api/src/modules`
- [ ] Add service boundaries for:
  - [x] Overpass client
  - [x] query builder
  - [x] normalization
  - [x] filtering/scoring
  - [x] persistence

Definition of done:

- [x] Module structure is isolated and testable

### 3.2 Implement Overpass client

- [x] Add `OverpassClientService`
- [x] Add HTTP request logic
- [x] Add timeout handling
- [x] Add retry with backoff
- [x] Add safe failure behavior
- [x] Add logging for request duration and result size

Definition of done:

- [x] Service can fetch and parse Overpass responses
- [x] Failure does not crash route import flow

### 3.3 Implement Overpass query builder

- [x] Add bbox-based query builder
- [ ] Encode supported tag families:
  - [x] `PEAK`
  - [x] `VIEWPOINT`
  - [x] `SHELTER`
  - [x] `WATER`
- [x] Make code extensible for future route-corridor queries

Definition of done:

- [x] Query builder returns valid Overpass QL
- [x] Current project-approved tag mapping is encoded in one place

## Epic 4. OSM Mapping and Normalization

### 4.1 Implement normalized candidate model

- [x] Create internal `NormalizedPoiCandidate` shape
- [ ] Include:
  - [x] OSM identifiers
  - [x] internal type
  - [x] subtype
  - [x] label
  - [x] coordinates
  - [x] confidence
  - [x] potability
  - [x] access
  - [x] raw tags

Definition of done:

- [x] All later pipeline steps use one normalized shape

### 4.2 Implement `PEAK` mapping

- [x] Map `natural=peak`
- [x] Derive label from `name` or elevation fallback
- [x] Assign confidence

Definition of done:

- [x] Peak normalization is deterministic

### 4.3 Implement `VIEWPOINT` mapping

- [x] Map `tourism=viewpoint`
- [ ] Preserve optional metadata:
  - [x] `direction`
  - [x] `tower:type`
  - [x] `viewpoint`

Definition of done:

- [x] Viewpoint normalization is deterministic

### 4.4 Implement `SHELTER` mapping

- [x] Map `amenity=shelter`
- [x] Map `tourism=wilderness_hut`
- [x] Map `tourism=alpine_hut`
- [ ] Add fallback mapping for:
  - [x] `building=hut`
  - [x] `building=cabin`
- [x] Encode fallback admission rules

Definition of done:

- [x] Shelter mapping covers strong and fallback cases
- [x] Building-only noise is controlled

### 4.5 Implement `WATER` mapping

- [x] Map `amenity=drinking_water`
- [x] Map `natural=spring`
- [x] Map `man_made=water_tap`
- [x] Map `man_made=water_well` with potable signal only
- [x] Map `amenity=fountain` with potable signal only
- [x] Exclude `amenity=water`
- [x] Add `waterPotability` derivation

Definition of done:

- [x] Water normalization distinguishes confirmed vs unknown potable water

## Epic 5. Filtering, Scoring, and Dedup

### 5.1 Implement hard filters

- [x] Reject unsupported elements
- [x] Reject elements without valid coordinates
- [x] Reject deprecated ambiguous tags
- [ ] Reject lifecycle-tagged POI:
  - [x] `disused:*`
  - [x] `abandoned:*`
  - [x] `ruins:*`

Definition of done:

- [x] Garbage objects are removed before persistence

### 5.2 Implement scoring and downgrade logic

- [x] Score by tag strength
- [x] Score by route proximity
- [x] Score by `name`
- [x] Downgrade `access=private`
- [x] Downgrade unnamed weak fallback huts/cabins
- [x] Downgrade spring without potable signal

Definition of done:

- [x] Every persisted POI has predictable confidence

### 5.3 Implement dedup logic

- [x] Dedup exact OSM duplicates by `osmType + osmId`
- [x] Dedup nearby same-type POI by small radius
- [x] Define deterministic keep rule for duplicates

Definition of done:

- [x] Duplicate clutter is removed

## Epic 6. Route Geometry Utilities

### 6.1 Add distance-to-route helpers

- [x] Compute shortest distance from POI to route polyline
- [x] Store `distanceFromRouteM`

Definition of done:

- [x] Each POI has route proximity metric

### 6.2 Add projection-to-route helpers

- [x] Project POI onto route
- [x] Compute `distanceFromStartM`
- [x] Sort final POI by route progression

Definition of done:

- [x] Final POI order is stable and route-aware

## Epic 7. Draft Enrichment Flow

### 7.1 Trigger enrichment after route publish

- [x] Hook POI enrichment after route finalization/publish
- [x] Pass route geometry into Overpass query builder
- [x] Normalize and filter fetched POI

Definition of done:

- [x] Published route starts async POI enrichment

### 7.2 Keep drafts free of POI persistence

- [x] Decide MVP storage:
  - [x] no POI in `previewJson`
  - [x] no separate `RouteDraftPoi` table in this phase
- [x] Implement chosen path

Definition of done:

- [x] Draft flow stays simple and POI appear only after publish

## Epic 8. Finalization and Persistence

### 8.1 Persist source objects

- [x] Save `RoutePoiSource` records during route enrichment
- [x] Reuse source rows when same OSM object already exists

Definition of done:

- [x] Final route POI have traceable source records

### 8.2 Persist final route POI

- [x] Save `RoutePoi` rows for finalized route
- [ ] Populate:
  - [x] type
  - [x] subtype
  - [x] label
  - [x] coordinates
  - [x] distance metrics
  - [x] confidence
  - [x] potability
  - [x] sortOrder

Definition of done:

- [x] Route POI are fully stored outside route JSON

## Epic 9. Route API Integration

### 9.1 Load relational POI in route queries

- [x] Update route details query to include `routePois`
- [x] Keep performance in mind with proper includes/order
- [x] Add dedicated `GET /routes/:id/pois` endpoint with status-aware payload

Definition of done:

- [x] Route query returns relational POI

### 9.2 Map relational POI to `poiMarkers`

- [x] Replace JSON-based POI mapping in route mapper
- [x] Preserve current mobile response shape

Definition of done:

- [x] `GET /routes/:id` returns expected `poiMarkers`

## Epic 10. Mobile Validation

### 10.1 Validate existing marker rendering

- [x] Verify `PoiMarkers.tsx` works with new POI payload
- [x] Verify selection logic still works
- [x] Add separate mobile POI loading flow via `GET /routes/:id/pois`
- [x] Add loader state for `PENDING` enrichment
- [x] Add failed-state fallback for `FAILED` enrichment

Definition of done:

- [x] Markers render correctly on map

### 10.2 Validate selected POI card

- [x] Check `SelectedPoi` rendering for all 4 types
- [ ] Optionally show subtype or potability if shared contract includes them

Definition of done:

- [ ] Selected card remains stable and useful

## Epic 11. Testing

### 11.1 Add unit tests for mapping

- [ ] `PEAK` normalization tests
- [ ] `VIEWPOINT` normalization tests
- [ ] `SHELTER` normalization tests
- [ ] `WATER` normalization tests

Definition of done:

- [ ] Supported tag mapping is covered by tests

### 11.2 Add unit tests for filtering and dedup

- [ ] lifecycle-tag filtering tests
- [ ] `access=private` downgrade tests
- [ ] spring potable-state tests
- [ ] duplicate merge tests

Definition of done:

- [ ] Filtering behavior is deterministic

### 11.3 Add integration tests

- [ ] GPX import -> enrichment integration test
- [ ] draft finalize -> route POI persistence test
- [ ] route details API response test

Definition of done:

- [ ] End-to-end POI flow is covered

## Epic 12. Manual Validation and Rollout

### 12.1 Validate on real routes

- [ ] Prepare a small set of real GPX files
- [ ] Review output for:
  - [ ] missing peaks
  - [ ] missing viewpoints
  - [ ] missing shelters
  - [ ] missing water points
  - [ ] noisy huts/cabins
  - [ ] noisy springs

Definition of done:

- [ ] Mapping quality is manually verified

### 12.2 Rollout strategy

- [ ] Enable enrichment for new imports only
- [ ] Monitor logs and failures
- [ ] Tune mapping thresholds if needed
- [ ] Delay backfill of old routes until signal quality is acceptable

Definition of done:

- [ ] New route imports work reliably with POI enrichment

## Suggested Execution Order

- [ ] Epic 1. Schema and Persistence
- [ ] Epic 2. Shared Contracts
- [ ] Epic 3. Overpass Integration
- [ ] Epic 4. OSM Mapping and Normalization
- [ ] Epic 5. Filtering, Scoring, and Dedup
- [ ] Epic 6. Route Geometry Utilities
- [ ] Epic 7. Draft Enrichment Flow
- [ ] Epic 8. Finalization and Persistence
- [ ] Epic 9. Route API Integration
- [ ] Epic 10. Mobile Validation
- [ ] Epic 11. Testing
- [ ] Epic 12. Manual Validation and Rollout

## Notes

- Do not introduce additional POI providers in this phase.
- Do not bring back `poiMarkersJson` as the target persistence model.
- Keep `Overpass` as enrichment-on-import, not read-time dependency.
- Keep frontend contract stable wherever possible.
