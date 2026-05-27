import {
  type RoutePoiAccess,
  type RoutePoiConfidence,
  type RoutePoiWaterPotability,
} from '@hiking/shared';
import { Injectable } from '@nestjs/common';

import {
  NormalizedPoiCandidate,
  OverpassElement,
} from './poi-enrichment.types';

@Injectable()
export class PoiNormalizerService {
  normalizeElement(element: OverpassElement): NormalizedPoiCandidate | null {
    const tags = element.tags ?? {};
    const coordinates = this.extractCoordinates(element);

    if (coordinates === null || this.hasLifecycleTags(tags)) {
      return null;
    }

    return (
      this.normalizePeak(element, tags, coordinates) ??
      this.normalizeViewpoint(element, tags, coordinates) ??
      this.normalizeShelter(element, tags, coordinates) ??
      this.normalizeWater(element, tags, coordinates)
    );
  }

  private normalizePeak(
    element: OverpassElement,
    tags: Record<string, string>,
    coordinates: { latitude: number; longitude: number },
  ): NormalizedPoiCandidate | null {
    if (tags.natural !== 'peak') {
      return null;
    }

    const label =
      this.pickPreferredName(tags) ?? this.withElevationFallback(tags, 'Peak');
    const confidence = this.pickPreferredName(tags)
      ? ('HIGH' as const)
      : ('MEDIUM' as const);

    return this.buildCandidate(element, coordinates, {
      type: 'PEAK',
      subtype: 'natural_peak',
      label,
      confidence,
      waterPotability: 'UNKNOWN',
      access: this.normalizeAccess(tags),
      rawTags: tags,
      metadata: {
        ele: tags.ele ?? null,
      },
    });
  }

  private normalizeViewpoint(
    element: OverpassElement,
    tags: Record<string, string>,
    coordinates: { latitude: number; longitude: number },
  ): NormalizedPoiCandidate | null {
    if (tags.tourism !== 'viewpoint') {
      return null;
    }

    return this.buildCandidate(element, coordinates, {
      type: 'VIEWPOINT',
      subtype: 'tourism_viewpoint',
      label: this.pickPreferredName(tags) ?? 'Viewpoint',
      confidence: 'HIGH',
      waterPotability: 'UNKNOWN',
      access: this.normalizeAccess(tags),
      rawTags: tags,
      metadata: {
        direction: tags.direction ?? null,
        viewpoint: tags.viewpoint ?? null,
        towerType: tags['tower:type'] ?? null,
      },
    });
  }

  private normalizeShelter(
    element: OverpassElement,
    tags: Record<string, string>,
    coordinates: { latitude: number; longitude: number },
  ): NormalizedPoiCandidate | null {
    const shelterTag = this.resolveShelterSubtype(tags);

    if (shelterTag === null) {
      return null;
    }

    const isFallbackBuilding =
      tags.building === 'hut' || tags.building === 'cabin';

    return this.buildCandidate(element, coordinates, {
      type: 'SHELTER',
      subtype: shelterTag,
      label:
        this.pickPreferredName(tags) ?? this.humanizeShelterSubtype(shelterTag),
      confidence: isFallbackBuilding ? 'MEDIUM' : 'HIGH',
      waterPotability: 'UNKNOWN',
      access: this.normalizeAccess(tags),
      rawTags: tags,
      metadata: {
        shelterType: tags.shelter_type ?? null,
        fallbackBuilding: isFallbackBuilding,
        fallbackBuildingName: this.pickPreferredName(tags) !== null,
        fireplace: tags.fireplace ?? null,
        operator: tags.operator ?? null,
      },
    });
  }

  private normalizeWater(
    element: OverpassElement,
    tags: Record<string, string>,
    coordinates: { latitude: number; longitude: number },
  ): NormalizedPoiCandidate | null {
    const subtype = this.resolveWaterSubtype(tags);

    if (subtype === null) {
      return null;
    }

    return this.buildCandidate(element, coordinates, {
      type: 'WATER',
      subtype,
      label: this.pickPreferredName(tags) ?? this.humanizeWaterSubtype(subtype),
      confidence: this.pickWaterConfidence(tags),
      waterPotability: this.resolveWaterPotability(tags),
      access: this.normalizeAccess(tags),
      rawTags: tags,
      metadata: {
        drinkingWater: tags.drinking_water ?? null,
        manMade: tags.man_made ?? null,
      },
    });
  }

  private buildCandidate(
    element: OverpassElement,
    coordinates: { latitude: number; longitude: number },
    base: Omit<
      NormalizedPoiCandidate,
      | 'provider'
      | 'osmId'
      | 'osmType'
      | 'rawGeometryCenter'
      | 'latitude'
      | 'longitude'
    >,
  ): NormalizedPoiCandidate {
    return {
      provider: 'OVERPASS',
      osmType: this.normalizeOsmType(element.type),
      osmId: String(element.id),
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      rawGeometryCenter: coordinates,
      ...base,
    };
  }

  private extractCoordinates(
    element: OverpassElement,
  ): { latitude: number; longitude: number } | null {
    const latitude =
      element.type === 'node' ? element.lat : element.center?.lat;
    const longitude =
      element.type === 'node' ? element.lon : element.center?.lon;

    if (
      typeof latitude !== 'number' ||
      typeof longitude !== 'number' ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      return null;
    }

    return {
      latitude,
      longitude,
    };
  }

  private hasLifecycleTags(tags: Record<string, string>): boolean {
    const lifecyclePrefixes = ['disused:', 'abandoned:', 'ruins:'];

    return (
      tags.disused === 'yes' ||
      tags.abandoned === 'yes' ||
      tags.ruins === 'yes' ||
      Object.keys(tags).some((key) =>
        lifecyclePrefixes.some((prefix) => key.startsWith(prefix)),
      )
    );
  }

  private pickPreferredName(tags: Record<string, string>): string | null {
    const raw = tags['name:uk'] ?? tags.name;

    return raw && raw.trim().length > 0 ? raw.trim() : null;
  }

  private withElevationFallback(
    tags: Record<string, string>,
    fallback: string,
  ): string {
    return tags.ele ? `${tags.ele} m` : fallback;
  }

  private normalizeAccess(tags: Record<string, string>): RoutePoiAccess {
    return tags.access === 'private' ? 'PRIVATE' : 'PUBLIC';
  }

  private normalizeOsmType(type: OverpassElement['type']) {
    if (type === 'node') return 'NODE' as const;
    if (type === 'way') return 'WAY' as const;
    return 'RELATION' as const;
  }

  private resolveShelterSubtype(tags: Record<string, string>): string | null {
    if (tags.amenity === 'shelter') {
      return tags.shelter_type
        ? `shelter_${tags.shelter_type}`
        : 'amenity_shelter';
    }

    if (tags.tourism === 'wilderness_hut') {
      return 'wilderness_hut';
    }

    if (tags.tourism === 'alpine_hut') {
      return 'alpine_hut';
    }

    if (tags.building === 'hut' && this.isFallbackBuildingShelter(tags)) {
      return 'building_hut';
    }

    if (tags.building === 'cabin' && this.isFallbackBuildingShelter(tags)) {
      return 'building_cabin';
    }

    return null;
  }

  private isFallbackBuildingShelter(tags: Record<string, string>): boolean {
    return [
      tags.name,
      tags['name:uk'],
      tags.tourism,
      tags.shelter_type,
      tags.fireplace,
      tags.operator,
    ].some((value) => typeof value === 'string' && value.trim().length > 0);
  }

  private humanizeShelterSubtype(subtype: string): string {
    switch (subtype) {
      case 'wilderness_hut':
        return 'Wilderness hut';
      case 'alpine_hut':
        return 'Alpine hut';
      case 'building_hut':
        return 'Hut';
      case 'building_cabin':
        return 'Cabin';
      default:
        return 'Shelter';
    }
  }

  private resolveWaterSubtype(tags: Record<string, string>): string | null {
    if (tags.amenity === 'drinking_water') {
      return 'drinking_water';
    }

    if (tags.natural === 'spring') {
      return 'spring';
    }

    if (tags.man_made === 'water_tap') {
      return 'water_tap';
    }

    if (
      tags.man_made === 'water_well' &&
      (tags.drinking_water === 'yes' || tags.amenity === 'drinking_water')
    ) {
      return 'water_well';
    }

    if (tags.amenity === 'fountain' && tags.drinking_water === 'yes') {
      return 'drinking_fountain';
    }

    if (tags.amenity === 'water') {
      return null;
    }

    return null;
  }

  private resolveWaterPotability(
    tags: Record<string, string>,
  ): RoutePoiWaterPotability {
    if (tags.drinking_water === 'no') {
      return 'NON_POTABLE';
    }

    if (tags.amenity === 'drinking_water' || tags.drinking_water === 'yes') {
      return 'CONFIRMED';
    }

    return 'UNKNOWN';
  }

  private pickWaterConfidence(
    tags: Record<string, string>,
  ): RoutePoiConfidence {
    if (tags.amenity === 'drinking_water' || tags.drinking_water === 'yes') {
      return 'HIGH';
    }

    if (tags.natural === 'spring') {
      return 'MEDIUM';
    }

    return 'MEDIUM';
  }

  private humanizeWaterSubtype(subtype: string): string {
    switch (subtype) {
      case 'drinking_water':
        return 'Drinking water';
      case 'spring':
        return 'Spring';
      case 'water_tap':
        return 'Water tap';
      case 'water_well':
        return 'Water well';
      case 'drinking_fountain':
        return 'Drinking fountain';
      default:
        return 'Water';
    }
  }
}
