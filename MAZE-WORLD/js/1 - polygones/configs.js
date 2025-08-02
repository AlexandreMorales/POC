export const KNOWN_POLYGONS = {
  TRIANGLE: 3,
  SQUARE: 4,
  HEXAGON: 6,
};

export const KNOWN_POLYGONS_VALUES = Object.values(KNOWN_POLYGONS);

export const MAP_GENERATION = {
  MIX: "MIX",
  DISTANCE: "DISTANCE",
};

export const MENU_CONFIG = {
  debugMode: false,
  passTime: true,
  rotationAnimation: true,
  rotationAnimationWithZoom: false,
  showPos: false,
  showChunks: false,
  usePerspective: false,
  keepTrianglePosition: false,
  showSelectedCell: false,
  rain: false,
  clouds: true,
  digitalClock: false,
  mapGeneration: MAP_GENERATION.DISTANCE,
};
