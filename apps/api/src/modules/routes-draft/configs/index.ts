import { X2jOptions } from 'fast-xml-parser';

export const GPX_PARSER_OPTIONS: X2jOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: '',
  parseTagValue: true,
  parseAttributeValue: true,
  trimValues: true,
  isArray: (name: string) =>
    ['trk', 'trkseg', 'trkpt', 'rte', 'rtept', 'wpt'].includes(name),
};
