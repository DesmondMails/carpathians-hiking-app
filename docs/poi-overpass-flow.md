# POI Overpass Flow

## Purpose

This document describes the runtime flow of POI enrichment after route publish.

It is intentionally shorter than the implementation plan and should be used as the quick architectural reference for backend and mobile work.

Related docs:

- [POI Overpass Implementation Plan](/Users/mikitabudejcuk/Documents/projects/hiking-app/docs/poi-overpass-implementation-plan.md)
- [POI Overpass Backlog](/Users/mikitabudejcuk/Documents/projects/hiking-app/docs/poi-overpass-backlog.md)

## Core Decision

POI are:

- not stored in `RouteDraftPreview`
- not created during draft import
- created only after route publish/finalize
- stored in dedicated relational tables
- fetched by mobile through a dedicated endpoint

## Main Components

### Data tables

- `Route`
  - stores route metadata and POI enrichment status
- `RoutePoiSource`
  - stores raw Overpass/OSM source object snapshot
- `RoutePoi`
  - stores normalized POI attached to a specific route

### Route status fields

`Route` contains:

- `poiEnrichmentStatus`
  - `PENDING`
  - `READY`
  - `FAILED`
- `poiEnrichmentError`
- `poiEnrichedAt`

### API endpoints

- `GET /routes/:id`
  - returns route details
  - includes `poiEnrichmentStatus`
  - may include `poiMarkers`, but mobile should rely on the dedicated POI endpoint
- `GET /routes/:id/pois`
  - returns POI payload:

```ts
{
  status: 'PENDING' | 'READY' | 'FAILED'
  poiMarkers: RoutePoi[]
}
```

## End-to-End Flow

### 1. GPX import

When a GPX is uploaded:

- backend parses geometry
- backend extracts elevation profile
- backend stores draft preview

At this step:

- no POI are fetched
- no POI are stored

### 2. Draft finalization

When user finalizes a draft:

1. backend creates `Route`
2. route is persisted with:
   - geometry
   - images
   - metadata
3. route starts with:
   - `poiEnrichmentStatus = PENDING`
4. backend schedules asynchronous POI enrichment

Important:

- route publish should not wait for Overpass to respond
- route creation must succeed even if POI enrichment later fails

### 3. POI enrichment start

After publish:

1. backend loads route geometry from `Route.routeCoordinatesJson`
2. backend builds an expanded bbox around the route
3. backend sends Overpass query

Queried categories:

- `PEAK`
- `VIEWPOINT`
- `SHELTER`
- `WATER`

### 4. Overpass response normalization

Raw OSM elements are converted into internal POI candidates.

Examples:

- `natural=peak` -> `PEAK`
- `tourism=viewpoint` -> `VIEWPOINT`
- `amenity=shelter` -> `SHELTER`
- `tourism=wilderness_hut` -> `SHELTER`
- `tourism=alpine_hut` -> `SHELTER`
- `building=hut|cabin` -> fallback `SHELTER`
- `amenity=drinking_water` -> `WATER`
- `natural=spring` -> `WATER`
- `man_made=water_tap` -> `WATER`

Normalization result includes:

- `type`
- `subtype`
- `label`
- `latitude`
- `longitude`
- `confidence`
- `waterPotability`
- `access`
- raw OSM tags

### 5. Filtering and scoring

After normalization:

1. unsupported objects are rejected
2. objects without valid coordinates are rejected
3. lifecycle-tagged objects are rejected
4. candidates are scored by:
   - tag strength
   - route proximity
   - presence of `name`
   - potable signal for water
   - `access=private`
5. fallback huts/cabins are penalized if weakly tagged
6. nearby duplicates are merged

### 6. Route geometry metrics

For every remaining POI:

- backend computes `distanceFromRouteM`
- backend computes `distanceFromStartM`
- final POI are sorted by route progression

This gives:

- stable order
- meaningful map/list ordering
- cleaner UX for route exploration

### 7. Persistence

For every accepted POI:

1. backend upserts `RoutePoiSource`
2. backend creates `RoutePoi`
3. backend stores:
   - normalized type
   - subtype
   - label
   - coordinates
   - confidence
   - access
   - potability
   - distance metrics
   - metadata

After successful persistence:

- `Route.poiEnrichmentStatus = READY`
- `Route.poiEnrichedAt` is set

If enrichment fails:

- `Route.poiEnrichmentStatus = FAILED`
- `Route.poiEnrichmentError` is filled

## Mobile Flow

### Recommended loading behavior

1. mobile loads `GET /routes/:id`
2. mobile reads `poiEnrichmentStatus`
3. mobile requests `GET /routes/:id/pois`
4. UI behavior:
   - `PENDING` -> show loader/skeleton for POI area
   - `READY` -> render markers
   - `FAILED` -> hide loader and show route without POI

### Why separate POI endpoint

This gives:

- cleaner async UX
- route screen can open immediately
- POI can load independently
- future room for retries, filters, or pagination

## Backend Sequence

```text
GPX upload
  -> draft created
  -> no POI yet

draft finalize
  -> route created
  -> route.poiEnrichmentStatus = PENDING
  -> async enrichment scheduled

async enrichment
  -> load route geometry
  -> build bbox
  -> query Overpass
  -> normalize OSM
  -> filter / score / dedup
  -> persist RoutePoiSource
  -> persist RoutePoi
  -> route.poiEnrichmentStatus = READY
```

## Failure Behavior

If Overpass is slow or unavailable:

- route publish must still succeed
- POI enrichment may fail independently
- route remains usable
- mobile sees `FAILED` and does not block route screen

## Current Implementation Boundary

Current implementation is optimized for:

- first production-ready Overpass integration
- enrichment after publish
- dedicated POI endpoint

Not included in this phase:

- multiple POI providers
- manual POI editing
- draft POI preview
- route-corridor query optimization instead of bbox
- backfill for old routes

## Practical Summary

The final model is:

- draft creates route geometry
- publish creates route
- publish triggers POI enrichment
- POI are stored in `RoutePoi` and `RoutePoiSource`
- mobile loads POI separately through `GET /routes/:id/pois`
- route and POI lifecycles are intentionally decoupled
