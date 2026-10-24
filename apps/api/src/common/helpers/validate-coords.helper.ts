export const isValidLongitude = (longitude?: number): longitude is number => {
  return longitude !== undefined && longitude <= 180 && longitude >= -180;
};

export const isValidLatitude = (latitude?: number): latitude is number => {
  return latitude !== undefined && latitude <= 90 && latitude >= -90;
};
