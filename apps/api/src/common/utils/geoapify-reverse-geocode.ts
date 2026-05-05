export type LatLon = {
  latitude: number;
  longitude: number;
};

export type ReverseGeocodeGeoapifyOptions = {
  apiKey: string | undefined;
  /** Ukrainian labels when supported by the provider */
  lang?: string;
  warn?: (message: string) => void;
};

function isUnknownArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

function pickFirstGeoapifyResult(data: unknown): {
  state?: string;
  city?: string;
} | null {
  if (data === null || typeof data !== 'object') return null;

  const raw = (data as { results?: unknown }).results;

  if (raw === undefined || !isUnknownArray(raw) || raw.length === 0) {
    return null;
  }

  const row = raw[0];

  if (row === null || typeof row !== 'object') return null;

  return row as { state?: string; city?: string };
}

function formatStateCityRegion(first: {
  state?: string;
  city?: string;
}): string | null {
  const parts = [first.state, first.city].filter(
    (p): p is string => typeof p === 'string' && p.trim().length > 0,
  );

  return parts.length > 0 ? parts.join(', ') : null;
}

/**
 * Reverse-geocode coordinates via Geoapify; returns a short "state, city" label or null.
 */
export async function reverseGeocodeRegionGeoapify(
  { latitude, longitude }: LatLon,
  options: ReverseGeocodeGeoapifyOptions,
): Promise<string | null> {
  const { apiKey, lang = 'uk', warn } = options;

  if (!apiKey) {
    warn?.('GEOAPIFY_API_KEY is not set; reverse geocode skipped');
    return null;
  }

  const params = new URLSearchParams({
    lat: String(latitude),
    lon: String(longitude),
    lang,
    format: 'json',
    apiKey,
  });

  try {
    const res = await fetch(
      `https://api.geoapify.com/v1/geocode/reverse?${params.toString()}`,
    );

    if (!res.ok) {
      warn?.(`Geoapify reverse geocode HTTP ${res.status}`);
      return null;
    }

    const data: unknown = await res.json();
    const first = pickFirstGeoapifyResult(data);

    if (!first) return null;

    return formatStateCityRegion(first);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    warn?.(`Geoapify reverse geocode failed: ${message}`);
    return null;
  }
}
