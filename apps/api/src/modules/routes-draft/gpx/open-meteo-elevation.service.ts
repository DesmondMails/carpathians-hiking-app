import { Injectable, Logger } from '@nestjs/common';

import { Coordinate } from '../interfaces';

const OPEN_METEO_ELEVATION_URL = 'https://api.open-meteo.com/v1/elevation';
// API limit per request
const MAX_COORDINATES_PER_REQUEST = 100;
const REQUEST_TIMEOUT_MS = 5000;
// ~1 m precision, the DEM itself is 90 m, so extra digits only bloat the URL
const COORDINATE_PRECISION = 5;

/**
 * Fills elevation for GPX files that have no <ele> data,
 * using the Copernicus GLO-90 DEM via Open-Meteo.
 */
@Injectable()
export class OpenMeteoElevationService {
  private readonly logger = new Logger(OpenMeteoElevationService.name);

  /**
   * Returns elevations in the same order as `coordinates`,
   * or null if any request fails, so callers can fall back to no elevation.
   */
  async getElevations(coordinates: Coordinate[]): Promise<number[] | null> {
    if (coordinates.length === 0) return [];

    const chunks: Coordinate[][] = [];

    for (let i = 0; i < coordinates.length; i += MAX_COORDINATES_PER_REQUEST) {
      chunks.push(coordinates.slice(i, i + MAX_COORDINATES_PER_REQUEST));
    }

    try {
      const results = await Promise.all(
        chunks.map((chunk) => this.fetchChunk(chunk)),
      );

      return results.flat();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Open-Meteo elevation failed: ${message}`);
      return null;
    }
  }

  private async fetchChunk(chunk: Coordinate[]): Promise<number[]> {
    const params = new URLSearchParams({
      latitude: chunk
        .map((c) => c.latitude.toFixed(COORDINATE_PRECISION))
        .join(','),
      longitude: chunk
        .map((c) => c.longitude.toFixed(COORDINATE_PRECISION))
        .join(','),
    });

    const res = await fetch(`${OPEN_METEO_ELEVATION_URL}?${params}`, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = (await res.json()) as { elevation?: unknown };
    const elevation = data.elevation;

    if (
      !Array.isArray(elevation) ||
      elevation.length !== chunk.length ||
      !elevation.every((e) => typeof e === 'number' && Number.isFinite(e))
    ) {
      throw new Error('Unexpected response shape');
    }

    return elevation as number[];
  }
}
