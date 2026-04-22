import { RouteElevationPoint } from '@hiking/shared';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import * as turf from '@turf/turf';
import { XMLParser } from 'fast-xml-parser';

import { GPX_PARSER_OPTIONS } from '../configs';
import {
  Coordinate,
  GpxDocument,
  GpxElevationStats,
  GpxPoint,
  ParsedGpx,
} from '../interfaces';

const MIN_COORDINATES_COUNT = 2;

@Injectable()
export class GpxParserService {
  private readonly logger = new Logger(GpxParserService.name);
  private readonly xmlParser = new XMLParser(GPX_PARSER_OPTIONS);

  parseGpx(file: Express.Multer.File): ParsedGpx {
    const gpx = this.toGpxDocument(file);

    const coordinates = this.extractCoordinates(gpx);

    if (coordinates.length < MIN_COORDINATES_COUNT) {
      throw new BadRequestException(
        `GPX файл не містить достатньо точок (мінімум ${MIN_COORDINATES_COUNT})`,
      );
    }

    const distanceM = this.calculateDistanceM(coordinates);
    const elevation = this.calculateElevationStats(coordinates);
    const elevationProfile = this.getElevationProfile(coordinates);

    this.logger.log(
      `Parsed GPX: points=${coordinates.length}, distanceM=${distanceM.toFixed(1)}`,
    );

    const { elevationGainM } = elevation;

    return { coordinates, distanceM, elevationGainM, elevationProfile };
  }

  private toGpxDocument(file: Express.Multer.File): GpxDocument {
    const { buffer } = file as { buffer: Buffer };
    const content = buffer.toString('utf-8');

    const parsed = this.xmlParser.parse(content) as { gpx?: GpxDocument };
    const gpx = parsed?.gpx;

    if (!gpx) {
      throw new BadRequestException('Файл не є GPX');
    }

    return gpx;
  }

  private extractCoordinates(gpx: GpxDocument): Coordinate[] {
    const trackPoints = (gpx.trk ?? []).flatMap((track) =>
      (track.trkseg ?? []).flatMap((seg) => seg.trkpt ?? []),
    );

    let routePoints: GpxPoint[] = [];

    if (trackPoints.length === 0) {
      routePoints = (gpx.rte ?? []).flatMap((route) => route.rtept ?? []);
    }

    const allPoints = [...trackPoints, ...routePoints];

    if (allPoints.length === 0) {
      throw new BadRequestException('GPX файл не містить точок');
    }

    return allPoints
      .map((pt) => this.toCoordinate(pt))
      .filter((c): c is Coordinate => c !== null);
  }

  private toCoordinate(pt: GpxPoint): Coordinate | null {
    const lon = this.toNumber(pt.lon);
    const lat = this.toNumber(pt.lat);

    if (lon === null || lat === null) {
      return null;
    }

    const ele = this.toNumber(pt.ele) ?? 0;

    return { longitude: lon, latitude: lat, elevationM: ele };
  }

  private toNumber(value: number | string | undefined): number | null {
    if (value === undefined || value === null) return null;
    const num = typeof value === 'number' ? value : parseFloat(value);
    return Number.isFinite(num) ? num : null;
  }

  private calculateDistanceM(coordinates: Coordinate[]): number {
    const line = turf.lineString(
      coordinates.map((c) => [c.longitude, c.latitude]),
    );
    return parseFloat(turf.length(line, { units: 'meters' }).toFixed(1));
  }

  private calculateElevationStats(
    coordinates: Coordinate[],
  ): GpxElevationStats {
    const elevations = coordinates.map((c) => c.elevationM ?? 0);

    let elevationGainM = 0;
    let elevationLossM = 0;

    for (let i = 1; i < elevations.length; i++) {
      const diff = elevations[i] - elevations[i - 1];

      if (diff > 0) elevationGainM += diff;
      else elevationLossM += Math.abs(diff);
    }

    return {
      elevationGainM: parseFloat(elevationGainM.toFixed(1)),
      elevationLossM: parseFloat(elevationLossM.toFixed(1)),
      maxElevationM: parseFloat(Math.max(...elevations).toFixed(1)),
      minElevationM: parseFloat(Math.min(...elevations).toFixed(1)),
    };
  }

  private getElevationProfile(
    coordinates: Coordinate[],
  ): RouteElevationPoint[] {
    if (coordinates.length < MIN_COORDINATES_COUNT) return [];

    const step = this.getProfileStep(coordinates.length);
    const profile: RouteElevationPoint[] = [];

    let cumulativeDistanceM = 0;
    let lastSampledIndex = 0;

    profile.push({
      distanceM: 0,
      elevationM: coordinates[0].elevationM ?? 0,
    });

    for (let i = step; i < coordinates.length; i += step) {
      cumulativeDistanceM = this.appendSample(
        profile,
        coordinates,
        lastSampledIndex,
        i,
        cumulativeDistanceM,
      );
      lastSampledIndex = i;
    }

    const finalIndex = coordinates.length - 1;

    if (lastSampledIndex !== finalIndex) {
      this.appendSample(
        profile,
        coordinates,
        lastSampledIndex,
        finalIndex,
        cumulativeDistanceM,
      );
    }

    return profile;
  }

  private appendSample(
    profile: RouteElevationPoint[],
    coordinates: Coordinate[],
    fromIndex: number,
    toIndex: number,
    cumulativeDistanceM: number,
  ): number {
    const nextCumulativeDistanceM =
      cumulativeDistanceM +
      this.calculateDistanceM([coordinates[fromIndex], coordinates[toIndex]]);

    profile.push({
      distanceM: parseFloat(nextCumulativeDistanceM.toFixed(1)),
      elevationM: coordinates[toIndex].elevationM ?? 0,
    });

    return nextCumulativeDistanceM;
  }

  private getProfileStep(coordsCount: number): number {
    const TARGET_SAMPLES = 200;

    return Math.max(1, Math.floor(coordsCount / TARGET_SAMPLES));
  }
}
