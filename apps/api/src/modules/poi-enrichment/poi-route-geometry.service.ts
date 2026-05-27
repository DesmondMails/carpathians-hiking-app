import type { RouteCoordinate } from '@hiking/shared';
import { Injectable } from '@nestjs/common';
import * as turf from '@turf/turf';

import { OverpassBBox } from './poi-enrichment.types';

const METERS_PER_LAT_DEGREE = 111_320;

@Injectable()
export class PoiRouteGeometryService {
  buildExpandedBbox(
    routeCoordinates: RouteCoordinate[],
    paddingM: number,
  ): OverpassBBox | null {
    if (routeCoordinates.length === 0) {
      return null;
    }

    const latitudes = routeCoordinates.map((coordinate) => coordinate.latitude);
    const longitudes = routeCoordinates.map(
      (coordinate) => coordinate.longitude,
    );

    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLon = Math.min(...longitudes);
    const maxLon = Math.max(...longitudes);
    const averageLat = (minLat + maxLat) / 2;

    const latPadding = paddingM / METERS_PER_LAT_DEGREE;
    const lonPadding =
      paddingM /
      (METERS_PER_LAT_DEGREE *
        Math.max(Math.cos((averageLat * Math.PI) / 180), 0.2));

    return {
      south: minLat - latPadding,
      west: minLon - lonPadding,
      north: maxLat + latPadding,
      east: maxLon + lonPadding,
    };
  }

  measurePoiDistanceMetrics(
    routeCoordinates: RouteCoordinate[],
    latitude: number,
    longitude: number,
  ): { distanceFromRouteM: number; distanceFromStartM: number } | null {
    if (routeCoordinates.length < 2) {
      return null;
    }

    const routeLine = turf.lineString(
      routeCoordinates.map((coordinate) => [
        coordinate.longitude,
        coordinate.latitude,
      ]),
    );
    const poiPoint = turf.point([longitude, latitude]);

    const distanceFromRouteM = turf.pointToLineDistance(poiPoint, routeLine, {
      units: 'meters',
    });
    const snapped = turf.nearestPointOnLine(routeLine, poiPoint, {
      units: 'meters',
    });
    const location =
      typeof snapped.properties.location === 'number'
        ? snapped.properties.location
        : 0;

    return {
      distanceFromRouteM: Number(distanceFromRouteM.toFixed(1)),
      distanceFromStartM: Number(location.toFixed(1)),
    };
  }

  distanceBetweenPointsM(
    first: { latitude: number; longitude: number },
    second: { latitude: number; longitude: number },
  ): number {
    return turf.distance(
      turf.point([first.longitude, first.latitude]),
      turf.point([second.longitude, second.latitude]),
      { units: 'meters' },
    );
  }
}
