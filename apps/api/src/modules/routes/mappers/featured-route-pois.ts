import {
  CAMP_SUBTYPE_SCORE,
  CONFIDENCE_SCORE,
  FEATURED_RULES,
  GENERIC_LABELS,
  MEDIUM_ROUTE_MAX_DISTANCE_M,
  SHELTER_SUBTYPE_SCORE,
  SHORT_ROUTE_MAX_DISTANCE_M,
  WATER_SUBTYPE_SCORE,
} from '../constants';
import type {
  FeaturedSupportedPoiTypes,
  FeaturedRule,
  RouteLengthPreset,
  RoutePoiWithSource,
} from '../types/featured-pois';

type FeaturedRoutePoiWithSource = RoutePoiWithSource & {
  type: FeaturedSupportedPoiTypes;
};

const TYPE_PRIORITY_SCORE: Record<FeaturedSupportedPoiTypes, number> = {
  WATER: 140,
  SHELTER: 120,
  CAMP: 95,
};

const OVERALL_MIN_SPACING_M: Record<RouteLengthPreset, number> = {
  SHORT: 250,
  MEDIUM: 450,
  LONG: 650,
};

const ROUTE_LENGTH_LIMITS_KM = {
  SHORT_MAX: 5,
  MEDIUM_MAX: 25,
} as const;

export function selectFeaturedRoutePois(
  routePois: RoutePoiWithSource[],
  routeDistanceM: number | null,
): RoutePoiWithSource[] {
  const routeLengthPreset = resolveRouteLengthPreset(routeDistanceM);
  const featuredRules = FEATURED_RULES[routeLengthPreset];
  const supportedPois = routePois.filter(
    (poi): poi is FeaturedRoutePoiWithSource =>
      isFeaturedSupportedPoiType(poi.type),
  );

  if (supportedPois.length === 0) {
    return [];
  }

  const effectiveRouteDistanceM =
    routeDistanceM && routeDistanceM > 0
      ? routeDistanceM
      : Math.max(...supportedPois.map((poi) => poi.distanceFromStartM), 1);
  const targetPoiCount = resolveTargetPoiCount(effectiveRouteDistanceM);
  const typeQuotas = resolveTypeQuotas(targetPoiCount, supportedPois);
  const rankedCandidates = supportedPois.sort(
    (left, right) =>
      previewScore(right, effectiveRouteDistanceM) -
      previewScore(left, effectiveRouteDistanceM),
  );
  const progressAnchors = buildProgressAnchors(
    effectiveRouteDistanceM,
    targetPoiCount,
  );
  const selected: FeaturedRoutePoiWithSource[] = [];
  const selectedIds = new Set<string>();
  const countsByType = initTypeCounter();
  const overallMinSpacingM = OVERALL_MIN_SPACING_M[routeLengthPreset];

  for (const anchor of progressAnchors) {
    const anchorCandidate = pickBestCandidateNearAnchor({
      anchorM: anchor,
      candidates: rankedCandidates,
      routeDistanceM: effectiveRouteDistanceM,
      targetPoiCount,
      selected,
      selectedIds,
      countsByType,
      typeQuotas,
      featuredRules,
      overallMinSpacingM,
      relaxOverallSpacing: false,
    });

    if (!anchorCandidate) {
      continue;
    }

    rememberCandidate(anchorCandidate, selected, selectedIds, countsByType);
  }

  for (const relaxOverallSpacing of [false, true]) {
    fillRemainingSlots({
      candidates: rankedCandidates,
      targetPoiCount,
      selected,
      selectedIds,
      countsByType,
      typeQuotas,
      featuredRules,
      overallMinSpacingM,
      relaxOverallSpacing,
    });
  }

  return selected.sort(
    (left, right) => left.distanceFromStartM - right.distanceFromStartM,
  );
}

function resolveRouteLengthPreset(
  routeDistanceM: number | null,
): RouteLengthPreset {
  if (routeDistanceM === null || routeDistanceM <= 0) {
    return 'MEDIUM';
  }

  if (routeDistanceM <= SHORT_ROUTE_MAX_DISTANCE_M) {
    return 'SHORT';
  }

  if (routeDistanceM <= MEDIUM_ROUTE_MAX_DISTANCE_M) {
    return 'MEDIUM';
  }

  return 'LONG';
}

export function resolveTargetPoiCount(routeDistanceM: number): number {
  const distanceKm = routeDistanceM / 1000;

  if (distanceKm <= ROUTE_LENGTH_LIMITS_KM.SHORT_MAX) {
    return clamp(Math.ceil(distanceKm * 1.6), 4, 8);
  }

  if (distanceKm <= ROUTE_LENGTH_LIMITS_KM.MEDIUM_MAX) {
    return clamp(Math.ceil(distanceKm * 0.5 + 2), 8, 12);
  }

  return clamp(Math.ceil(distanceKm * 0.22 + 4), 12, 16);
}

function resolveTypeQuotas(
  targetPoiCount: number,
  candidates: FeaturedRoutePoiWithSource[],
): Record<FeaturedSupportedPoiTypes, number> {
  const availableCounts = candidates.reduce((acc, candidate) => {
    acc[candidate.type] += 1;
    return acc;
  }, initTypeCounter());

  const quotas: Record<FeaturedSupportedPoiTypes, number> = {
    WATER: Math.min(Math.max(Math.round(targetPoiCount * 0.45), 2), 6),
    SHELTER: Math.min(Math.max(Math.round(targetPoiCount * 0.35), 1), 5),
    CAMP: Math.min(Math.max(Math.round(targetPoiCount * 0.2), 1), 3),
  };

  for (const type of Object.keys(quotas) as FeaturedSupportedPoiTypes[]) {
    quotas[type] = Math.min(quotas[type], availableCounts[type]);
  }

  let allocated = sumCounts(quotas);
  const priorityOrder: FeaturedSupportedPoiTypes[] = [
    'WATER',
    'SHELTER',
    'CAMP',
  ];

  while (allocated < targetPoiCount) {
    let changed = false;

    for (const type of priorityOrder) {
      if (quotas[type] >= availableCounts[type]) {
        continue;
      }

      quotas[type] += 1;
      allocated += 1;
      changed = true;

      if (allocated >= targetPoiCount) {
        break;
      }
    }

    if (!changed) {
      break;
    }
  }

  return quotas;
}

function buildProgressAnchors(
  routeDistanceM: number,
  targetPoiCount: number,
): number[] {
  if (targetPoiCount <= 0) {
    return [];
  }

  const segmentLengthM = routeDistanceM / targetPoiCount;

  return Array.from(
    { length: targetPoiCount },
    (_, index) => segmentLengthM * index + segmentLengthM / 2,
  );
}

function pickBestCandidateNearAnchor(params: {
  anchorM: number;
  candidates: FeaturedRoutePoiWithSource[];
  routeDistanceM: number;
  targetPoiCount: number;
  selected: FeaturedRoutePoiWithSource[];
  selectedIds: Set<string>;
  countsByType: Record<FeaturedSupportedPoiTypes, number>;
  typeQuotas: Record<FeaturedSupportedPoiTypes, number>;
  featuredRules: Record<FeaturedSupportedPoiTypes, FeaturedRule>;
  overallMinSpacingM: number;
  relaxOverallSpacing: boolean;
}): FeaturedRoutePoiWithSource | null {
  const {
    anchorM,
    candidates,
    routeDistanceM,
    targetPoiCount,
    selected,
    selectedIds,
    countsByType,
    typeQuotas,
    featuredRules,
    overallMinSpacingM,
    relaxOverallSpacing,
  } = params;
  const segmentLengthM = Math.max(routeDistanceM / targetPoiCount, 1);
  let bestCandidate: FeaturedRoutePoiWithSource | null = null;
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const candidate of candidates) {
    if (
      !canSelectCandidate({
        candidate,
        selected,
        selectedIds,
        countsByType,
        typeQuotas,
        featuredRules,
        overallMinSpacingM,
        relaxOverallSpacing,
      })
    ) {
      continue;
    }

    const score =
      previewScore(candidate, routeDistanceM) -
      progressDistancePenalty(
        Math.abs(candidate.distanceFromStartM - anchorM),
        segmentLengthM,
      );

    if (score <= bestScore) {
      continue;
    }

    bestCandidate = candidate;
    bestScore = score;
  }

  return bestCandidate;
}

function canSelectCandidate(params: {
  candidate: FeaturedRoutePoiWithSource;
  selected: FeaturedRoutePoiWithSource[];
  selectedIds: Set<string>;
  countsByType: Record<FeaturedSupportedPoiTypes, number>;
  typeQuotas: Record<FeaturedSupportedPoiTypes, number>;
  featuredRules: Record<FeaturedSupportedPoiTypes, FeaturedRule>;
  overallMinSpacingM: number;
  relaxOverallSpacing: boolean;
}): boolean {
  const {
    candidate,
    selected,
    selectedIds,
    countsByType,
    typeQuotas,
    featuredRules,
    overallMinSpacingM,
    relaxOverallSpacing,
  } = params;

  if (selectedIds.has(candidate.id)) {
    return false;
  }

  if (countsByType[candidate.type] >= typeQuotas[candidate.type]) {
    return false;
  }

  const typeRule = featuredRules[candidate.type];
  const sameTypeSpacingM = typeRule.minSpacingM;
  const effectiveOverallSpacingM = relaxOverallSpacing
    ? overallMinSpacingM * 0.55
    : overallMinSpacingM;

  for (const existing of selected) {
    if (
      existing.type === candidate.type &&
      Math.abs(existing.distanceFromStartM - candidate.distanceFromStartM) <
        sameTypeSpacingM
    ) {
      return false;
    }

    if (
      Math.abs(existing.distanceFromStartM - candidate.distanceFromStartM) <
      effectiveOverallSpacingM
    ) {
      return false;
    }
  }

  return true;
}

function fillRemainingSlots(params: {
  candidates: FeaturedRoutePoiWithSource[];
  targetPoiCount: number;
  selected: FeaturedRoutePoiWithSource[];
  selectedIds: Set<string>;
  countsByType: Record<FeaturedSupportedPoiTypes, number>;
  typeQuotas: Record<FeaturedSupportedPoiTypes, number>;
  featuredRules: Record<FeaturedSupportedPoiTypes, FeaturedRule>;
  overallMinSpacingM: number;
  relaxOverallSpacing: boolean;
}): void {
  const { candidates, targetPoiCount, ...selectionParams } = params;
  const { selected, selectedIds, countsByType } = selectionParams;

  for (const candidate of candidates) {
    if (selected.length >= targetPoiCount) {
      break;
    }

    if (!canSelectCandidate({ candidate, ...selectionParams })) {
      continue;
    }

    rememberCandidate(candidate, selected, selectedIds, countsByType);
  }
}

function rememberCandidate(
  candidate: FeaturedRoutePoiWithSource,
  selected: FeaturedRoutePoiWithSource[],
  selectedIds: Set<string>,
  countsByType: Record<FeaturedSupportedPoiTypes, number>,
): void {
  selected.push(candidate);
  selectedIds.add(candidate.id);
  countsByType[candidate.type] += 1;
}

function thisTypeScore(poi: RoutePoiWithSource): number {
  return (
    CONFIDENCE_SCORE[poi.confidence] +
    subtypeScore(poi) +
    labelScore(poi) +
    routeDistanceScore(poi) +
    accessScore(poi) +
    waterPotabilityScore(poi)
  );
}

function previewScore(
  poi: FeaturedRoutePoiWithSource,
  routeDistanceM: number,
): number {
  return (
    thisTypeScore(poi) +
    TYPE_PRIORITY_SCORE[poi.type] +
    routeProgressScore(poi, routeDistanceM)
  );
}

function subtypeScore(poi: RoutePoiWithSource): number {
  if (!poi.subtype) {
    return 0;
  }

  if (poi.type === 'SHELTER') {
    return SHELTER_SUBTYPE_SCORE[poi.subtype] ?? 50;
  }

  if (poi.type === 'WATER') {
    return WATER_SUBTYPE_SCORE[poi.subtype] ?? 35;
  }

  if (poi.type === 'CAMP') {
    return CAMP_SUBTYPE_SCORE[poi.subtype] ?? 45;
  }

  return 0;
}

function labelScore(poi: RoutePoiWithSource): number {
  return GENERIC_LABELS.has(poi.label) ? 0 : 30;
}

function routeDistanceScore(poi: RoutePoiWithSource): number {
  if (poi.distanceFromRouteM <= 40) {
    return 35;
  }

  if (poi.distanceFromRouteM <= 90) {
    return 25;
  }

  if (poi.distanceFromRouteM <= 150) {
    return 15;
  }

  return 0;
}

function accessScore(poi: RoutePoiWithSource): number {
  return poi.access === 'PRIVATE' ? -20 : 0;
}

function waterPotabilityScore(poi: RoutePoiWithSource): number {
  if (poi.type !== 'WATER') {
    return 0;
  }

  if (poi.waterPotability === 'CONFIRMED') {
    return 35;
  }

  if (poi.waterPotability === 'NON_POTABLE') {
    return -30;
  }

  return 0;
}

function routeProgressScore(
  poi: RoutePoiWithSource,
  routeDistanceM: number,
): number {
  if (routeDistanceM <= 0) {
    return 0;
  }

  const progress = poi.distanceFromStartM / routeDistanceM;
  let score = 0;

  if (routeDistanceM >= 15_000 && progress < 0.12) {
    score -= poi.type === 'CAMP' ? 80 : 20;
  }

  if (routeDistanceM >= 25_000 && progress < 0.2 && poi.type === 'CAMP') {
    score -= 50;
  }

  if (progress >= 0.25 && progress <= 0.85) {
    score += 12;
  }

  return score;
}

function progressDistancePenalty(
  distanceFromAnchorM: number,
  segmentLengthM: number,
): number {
  const normalizedDistance = distanceFromAnchorM / Math.max(segmentLengthM, 1);

  return normalizedDistance * 85;
}

function initTypeCounter(): Record<FeaturedSupportedPoiTypes, number> {
  return {
    WATER: 0,
    SHELTER: 0,
    CAMP: 0,
  };
}

function isFeaturedSupportedPoiType(
  type: string,
): type is FeaturedSupportedPoiTypes {
  return type === 'WATER' || type === 'SHELTER' || type === 'CAMP';
}

function sumCounts(values: Record<FeaturedSupportedPoiTypes, number>): number {
  return Object.values(values).reduce((sum, value) => sum + value, 0);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
