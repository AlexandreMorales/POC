export const KNOWN_POLYGONS = {
  TRIANGLE: 3,
  SQUARE: 4,
  HEXAGON: 6,
};

export const POLYGONS_IMAGES = {
  [KNOWN_POLYGONS.TRIANGLE]: "images/tools/triangle.png",
  [KNOWN_POLYGONS.SQUARE]: "images/tools/square.png",
  [KNOWN_POLYGONS.HEXAGON]: "images/tools/hexagon.png",
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
  showPos: false,
  showChunks: false,
  usePerspective: false,
  showSelectedCell: true,
  rain: false,
  clouds: true,
  digitalClock: false,
  music: false,
  mapGeneration: MAP_GENERATION.DISTANCE,
};
