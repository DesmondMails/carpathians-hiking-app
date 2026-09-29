# POI UI Strategy

## Purpose

This document defines how POI should be selected and displayed in the product.

It focuses on production UX for long hiking routes, where showing every POI at once creates too much visual noise.

Related docs:

- [POI Overpass Flow](/Users/mikitabudejcuk/Documents/projects/hiking-app/docs/poi-overpass-flow.md)
- [POI Overpass Implementation Plan](/Users/mikitabudejcuk/Documents/projects/hiking-app/docs/poi-overpass-implementation-plan.md)

## Problem

For long routes, for example `40-60 km`, even good POI data can become unusable if every point is rendered at the same time.

Typical issues:

- too many markers on route preview
- overlaps between nearby POI
- repeated similar points along the same segment
- peaks already visible on basemap, creating duplicate visual meaning
- fallback shelters such as `hut/cabin` adding noise if not ranked carefully

Because of this, product UX should not treat all POI equally.

## Core Product Decision

We split POI into two layers:

- `allPois`
- `featuredPois`

### `allPois`

This is the full normalized POI set stored by backend after Overpass enrichment.

Use cases:

- full map view
- detailed route exploration
- future search/filter UX

### `featuredPois`

This is a curated subset of the most useful POI for the main route screen.

Use cases:

- route hero map
- quick route preview
- compact route summary

## Type Priorities

Default POI priority for the product:

1. `WATER`
2. `SHELTER`
3. `CAMP`
4. `VIEWPOINT`
5. `PEAK`

Why:

- `WATER` and `SHELTER` are functional and often most important during real hiking
- `CAMP` is more actionable for multi-hour and overnight hiking routes
- `VIEWPOINT` is useful but can be numerous
- `PEAK` is often already represented clearly on hiking basemaps

## Recommendation for `PEAK`

`PEAK` should be:

- stored by backend
- available in `allPois`
- hidden by default in route preview
- hidden by default in full map filters

Reason:

- many peaks are already visible from the basemap label layer
- dedicated POI markers often duplicate information rather than improve it

## Recommendation for `hut/cabin`

Fallback `building=hut` and `building=cabin` should stay in the data model.

But they should be treated as:

- fallback shelters
- lower priority than:
  - `amenity=shelter`
  - `tourism=wilderness_hut`
  - `tourism=alpine_hut`

Use rules:

- allowed in `allPois`
- allowed in `featuredPois` only if strong shelter types are missing nearby
- should carry lower confidence

## Backend Selection Strategy

### Store full set

Backend always stores the full accepted POI set as `allPois`.

This ensures:

- data completeness
- future flexibility
- no need to re-enrich just because UI changes

### Build featured subset

Backend should derive `featuredPois` from `allPois`.

Suggested target limits:

- `WATER`: up to `3`
- `SHELTER`: up to `3`
- `CAMP`: up to `2`
- `VIEWPOINT`: optional in preview, up to `4` if product brings it back later
- `PEAK`: `0` by default

Total target for route preview:

- `6-10 POI`

### Spacing rules

In addition to geo dedup, featured selection should use route progression spacing.

Use `distanceFromStartM` to avoid selecting many similar POI in the same route segment.

Suggested minimum spacing should depend on route length:

- short routes: up to `10 km`
  - `WATER`: `300 m`
  - `SHELTER`: `450 m`
  - `VIEWPOINT`: `600 m`
- medium routes: `10-25 km`
  - `WATER`: `600 m`
  - `SHELTER`: `900 m`
  - `VIEWPOINT`: `1200 m`
- long routes: over `25 km`
  - `WATER`: `900 m`
  - `SHELTER`: `1200 m`
  - `VIEWPOINT`: `1500 m`

These are starting values and should be tuned using real routes.

### Selection heuristic

Selection should consider:

- POI type priority
- confidence
- distance from route
- presence of `name`
- subtype strength
- route spacing

Suggested ranking within each type:

1. higher confidence
2. named POI
3. stronger subtype
4. closer to route
5. better route distribution

## Preview Map Strategy

### Goal

The preview map on route screen should feel legible and intentional.

It is not the place to show every possible POI.

### Rules

- render only `featuredPois`
- do not render `PEAK` by default
- do not overload the route line with dense markers
- keep the map understandable at a glance

### Loading behavior

- if `poiEnrichmentStatus = PENDING`
  - show map
  - show POI loading overlay
  - poll route details until `featuredPois` become available
- if `poiEnrichmentStatus = READY`
  - render `featuredPois`
- if `poiEnrichmentStatus = FAILED`
  - render route without POI

Preview map should not replace `featuredPois` with the full POI payload from the dedicated POI endpoint.

## Full Map View Strategy

### Goal

The full map view is the place for richer route exploration.

Here, showing `allPois` is acceptable, but only with proper UX controls.

### Default behavior

Show `allPois` with:

- type filters
- zoom-aware rendering
- clustering on smaller zooms

### Default filters

Enabled by default:

- `WATER`
- `SHELTER`
- `VIEWPOINT`

Disabled by default:

- `PEAK`

### Required interactions

Full map should support:

- tapping markers
- opening POI details
- filtering by type
- browsing POI sorted by route order

### Recommended UI elements

- top filter chips:
  - `Water`
  - `Shelter`
  - `Viewpoints`
  - `Peaks`
- bottom sheet or list
- distance from route start in POI details

## API Strategy

### Route details response

`GET /routes/:id` should expose:

- base route data
- `poiEnrichmentStatus`
- `featuredPoiMarkers`

### Dedicated POI response

`GET /routes/:id/pois` should expose:

- `status`
- `poiMarkers`

Response shape:

```ts
{
  status: 'PENDING' | 'READY' | 'FAILED'
  poiMarkers: RoutePoi[]
}
```

### Optional future API extensions

Useful later:

- `GET /routes/:id/pois?featured=true`
- `GET /routes/:id/pois?types=WATER,SHELTER`
- `GET /routes/:id/pois?include=PEAK`

## Production UX Recommendation

For the first production-ready version:

- backend stores full POI set
- backend derives `featuredPois`
- route preview uses only `featuredPois`
- full map uses `allPois`
- `PEAK` is hidden by default
- `hut/cabin` stays as fallback shelter data

This gives the best balance between:

- completeness
- legibility
- scalability on long routes

## Summary

The correct production model is:

- `allPois` for completeness
- `featuredPois` for clarity
- route preview for curated signal
- full map for exploration

This avoids the common failure mode where technically correct POI data still produces a bad hiking UX because too many markers compete for attention at once.
