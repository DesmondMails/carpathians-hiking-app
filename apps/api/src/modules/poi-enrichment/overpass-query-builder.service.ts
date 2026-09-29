import { Injectable } from '@nestjs/common';

import { OverpassBBox } from './poi-enrichment.types';

@Injectable()
export class OverpassQueryBuilderService {
  buildPoiQueryForBbox(bbox: OverpassBBox): string {
    const area = this.formatBbox(bbox);

    return `
[out:json][timeout:25];
(
  node["natural"="peak"]${area};
  way["natural"="peak"]${area};
  relation["natural"="peak"]${area};

  node["tourism"="viewpoint"]${area};
  way["tourism"="viewpoint"]${area};
  relation["tourism"="viewpoint"]${area};

  nwr["tourism"="camp_site"]${area};
  nwr["tourism"="camp_pitch"]${area};
  nwr["camp_site"="wild"]${area};
  nwr["camp_site"="basic"]${area};

  nwr["amenity"="shelter"]${area};
  nwr["tourism"="wilderness_hut"]${area};
  nwr["tourism"="alpine_hut"]${area};
  nwr["building"="hut"]${area};
  nwr["building"="cabin"]${area};

  nwr["amenity"="drinking_water"]${area};
  nwr["natural"="spring"]${area};
  nwr["man_made"="water_tap"]${area};
  nwr["man_made"="water_well"]["drinking_water"="yes"]${area};
  nwr["amenity"="fountain"]["drinking_water"="yes"]${area};
);
out center tags;
`.trim();
  }

  private formatBbox({ south, west, north, east }: OverpassBBox): string {
    return `(${south.toFixed(6)},${west.toFixed(6)},${north.toFixed(6)},${east.toFixed(6)})`;
  }
}
