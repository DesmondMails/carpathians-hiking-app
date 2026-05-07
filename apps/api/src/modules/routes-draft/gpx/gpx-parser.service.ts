import { RouteElevationPoint } from '@hiking/shared';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import * as turf from '@turf/turf';
import { XMLParser } from 'fast-xml-parser';

import { reverseGeocodeRegionGeoapify } from 'src/common/utils/geoapify-reverse-geocode';

import { GPX_PARSER_OPTIONS } from '../configs';
import {
  Coordinate,
  GpxDocument,
  GpxElevationStats,
  GpxPoint,
  GpxTrackSegment,
  ParsedGpx,
} from '../interfaces';

const MIN_COORDINATES_COUNT = 2;

@Injectable()
export class GpxParserService {
  private readonly logger = new Logger(GpxParserService.name);
  private readonly xmlParser = new XMLParser(GPX_PARSER_OPTIONS);

  async parseGpx(file: Express.Multer.File): Promise<ParsedGpx> {
    const gpx = this.toGpxDocument(file);

    const coordinates = this.extractCoordinates(gpx);
    const elevationSamples = this.buildElevationSamples(coordinates);

    if (coordinates.length < MIN_COORDINATES_COUNT) {
      throw new BadRequestException(
        `GPX файл не містить достатньо точок (мінімум ${MIN_COORDINATES_COUNT})`,
      );
    }

    const region = await reverseGeocodeRegionGeoapify(coordinates[0], {
      apiKey: process.env.GEOAPIFY_API_KEY,
      warn: (message) => this.logger.warn(message),
    });

    const distanceM = this.calculateDistanceM(coordinates);
    const elevation = this.calculateElevationStats(elevationSamples);
    const elevationProfile = this.getElevationProfile(elevationSamples);

    this.logger.log(
      `Parsed GPX: points=${coordinates.length}, distanceM=${distanceM.toFixed(1)}`,
    );

    const { elevationGainM } = elevation;

    return {
      coordinates,
      distanceM,
      region,
      elevationGainM,
      elevationProfile,
    };
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
    const trackSegments = (gpx.trk ?? []).flatMap(
      (track) => track.trkseg ?? [],
    );

    const trackPoints = this.getLongestTrackSegment(trackSegments).trkpt ?? [];

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

    const ele = this.toNumber(pt.ele);

    return {
      longitude: lon,
      latitude: lat,
      ...(ele !== null ? { elevationM: ele } : {}),
    };
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
    elevationSamples: RouteElevationPoint[],
  ): GpxElevationStats {
    const elevations = elevationSamples.map((sample) => sample.elevationM);

    if (elevations.length === 0) {
      return {
        elevationGainM: 0,
        elevationLossM: 0,
        maxElevationM: 0,
        minElevationM: 0,
      };
    }

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
    elevationSamples: RouteElevationPoint[],
  ): RouteElevationPoint[] {
    if (elevationSamples.length < MIN_COORDINATES_COUNT) return [];

    const step = this.getProfileStep(elevationSamples.length);
    const profile: RouteElevationPoint[] = [];
    let lastSampledIndex = 0;

    profile.push(elevationSamples[0]);

    for (let i = step; i < elevationSamples.length; i += step) {
      profile.push(elevationSamples[i]);
      lastSampledIndex = i;
    }

    const finalIndex = elevationSamples.length - 1;

    if (lastSampledIndex !== finalIndex) {
      profile.push(elevationSamples[finalIndex]);
    }

    return profile;
  }

  private getProfileStep(coordsCount: number): number {
    const TARGET_SAMPLES = 200;

    return Math.max(1, Math.floor(coordsCount / TARGET_SAMPLES));
  }

  private buildElevationSamples(
    coordinates: Coordinate[],
  ): RouteElevationPoint[] {
    if (coordinates.length === 0) return [];

    const samples: RouteElevationPoint[] = [];
    let cumulativeDistanceM = 0;

    for (let i = 0; i < coordinates.length; i++) {
      if (i > 0) {
        cumulativeDistanceM += this.calculateDistanceM([
          coordinates[i - 1],
          coordinates[i],
        ]);
      }

      const elevationM = coordinates[i].elevationM;

      if (elevationM === undefined) {
        continue;
      }

      samples.push({
        distanceM: parseFloat(cumulativeDistanceM.toFixed(1)),
        elevationM,
      });
    }

    return samples;
  }

  private getLongestTrackSegment(
    trackSegments: GpxTrackSegment[],
  ): GpxTrackSegment {
    return trackSegments.reduce((longest, current) => {
      return (current.trkpt?.length ?? 0) > (longest.trkpt?.length ?? 0)
        ? current
        : longest;
    }, trackSegments[0]);
  }
}
