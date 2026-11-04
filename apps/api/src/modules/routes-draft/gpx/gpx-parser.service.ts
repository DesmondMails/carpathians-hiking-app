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
import { OpenMeteoElevationService } from './open-meteo-elevation.service';

const MIN_COORDINATES_COUNT = 2;
// DEM resolution is 90 m, denser sampling costs quota but adds no data
const MIN_ELEVATION_SAMPLE_STEP_M = 100;
// Open-Meteo bills every coordinate as one API call (600/min, 10k/day)
const MAX_ELEVATION_SAMPLES = 200;
// DEM heights jump around on steep valley sides, which inflates the gain;
// averaging over 600 m of trail matched reference gain within ~3%
const DEM_SMOOTHING_WINDOW_M = 600;

@Injectable()
export class GpxParserService {
  private readonly logger = new Logger(GpxParserService.name);
  private readonly xmlParser = new XMLParser(GPX_PARSER_OPTIONS);

  constructor(
    private readonly openMeteoElevationService: OpenMeteoElevationService,
  ) {}

  async parseGpx(file: Express.Multer.File): Promise<ParsedGpx> {
    const gpx = this.toGpxDocument(file);

    const coordinates = this.extractCoordinates(gpx);

    if (coordinates.length < MIN_COORDINATES_COUNT) {
      throw new BadRequestException(
        `GPX файл не містить достатньо точок (мінімум ${MIN_COORDINATES_COUNT})`,
      );
    }

    const [region, elevationSamples] = await Promise.all([
      reverseGeocodeRegionGeoapify(coordinates[0], {
        apiKey: process.env.GEOAPIFY_API_KEY,
        warn: (message) => this.logger.warn(message),
      }),
      this.getElevationSamples(coordinates),
    ]);

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

  private async getElevationSamples(
    coordinates: Coordinate[],
  ): Promise<RouteElevationPoint[]> {
    const gpxSamples = this.buildElevationSamples(coordinates);

    if (gpxSamples.length >= MIN_COORDINATES_COUNT) return gpxSamples;

    const points = this.sampleAlongRoute(coordinates);
    const elevations = await this.openMeteoElevationService.getElevations(
      points.map((point) => point.coordinate),
    );

    if (!elevations) return [];

    this.logger.log(
      `GPX has no elevation, fetched ${elevations.length} samples from Open-Meteo`,
    );

    const stepM = points.length > 1 ? points[1].distanceM : 0;
    const smoothed = this.smoothElevations(elevations, stepM);

    return points.map((point, i) => ({
      distanceM: parseFloat(point.distanceM.toFixed(1)),
      elevationM: parseFloat(smoothed[i].toFixed(1)),
    }));
  }

  /**
   * Moving average over evenly spaced samples. The window narrows towards
   * the ends so start and end heights stay exact and the climb isn't cut off.
   */
  private smoothElevations(elevations: number[], stepM: number): number[] {
    if (stepM <= 0) return elevations;

    const halfWindow = Math.floor(DEM_SMOOTHING_WINDOW_M / 2 / stepM);
    const lastIndex = elevations.length - 1;

    return elevations.map((_, i) => {
      const half = Math.min(halfWindow, i, lastIndex - i);
      let sum = 0;

      for (let j = i - half; j <= i + half; j++) {
        sum += elevations[j];
      }

      return sum / (half * 2 + 1);
    });
  }

  /**
   * Evenly spaced points along the route, interpolated between GPX points,
   * so dense tracks don't waste requests and sparse ones still get coverage.
   */
  private sampleAlongRoute(
    coordinates: Coordinate[],
  ): { coordinate: Coordinate; distanceM: number }[] {
    const cumulativeM = [0];

    for (let i = 1; i < coordinates.length; i++) {
      const segmentM = turf.distance(
        [coordinates[i - 1].longitude, coordinates[i - 1].latitude],
        [coordinates[i].longitude, coordinates[i].latitude],
        { units: 'meters' },
      );
      cumulativeM.push(cumulativeM[i - 1] + segmentM);
    }

    const totalM = cumulativeM[cumulativeM.length - 1];
    const sampleCount = Math.min(
      Math.max(
        Math.floor(totalM / MIN_ELEVATION_SAMPLE_STEP_M) + 1,
        MIN_COORDINATES_COUNT,
      ),
      MAX_ELEVATION_SAMPLES,
    );
    const stepM = totalM / (sampleCount - 1);

    const samples: { coordinate: Coordinate; distanceM: number }[] = [];
    let segment = 0;

    for (let k = 0; k < sampleCount; k++) {
      const targetM = k === sampleCount - 1 ? totalM : k * stepM;

      while (
        segment < coordinates.length - 2 &&
        cumulativeM[segment + 1] < targetM
      ) {
        segment++;
      }

      const from = coordinates[segment];
      const to = coordinates[segment + 1];
      const segmentM = cumulativeM[segment + 1] - cumulativeM[segment];
      const t = segmentM > 0 ? (targetM - cumulativeM[segment]) / segmentM : 0;

      samples.push({
        coordinate: {
          latitude: from.latitude + (to.latitude - from.latitude) * t,
          longitude: from.longitude + (to.longitude - from.longitude) * t,
        },
        distanceM: targetM,
      });
    }

    return samples;
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
