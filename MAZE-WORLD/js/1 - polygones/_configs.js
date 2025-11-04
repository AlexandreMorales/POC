export const KNOWN_POLYGONS = {
  TRIANGLE: 3,
  SQUARE: 4,
  HEXAGON: 6,
};

export const POLYGONS_IMAGES = {
  [KNOWN_POLYGONS.TRIANGLE]: "images/polys/triangle.png",
  [KNOWN_POLYGONS.SQUARE]: "images/polys/square.png",
  [KNOWN_POLYGONS.HEXAGON]: "images/polys/hexagon.png",
};

export const POLYGONS_ENTITY_POS = {
  [KNOWN_POLYGONS.TRIANGLE]: /** @type {Pos} */ { i: 6, j: 2 },
  [KNOWN_POLYGONS.SQUARE]: /** @type {Pos} */ { i: 6, j: 1 },
  [KNOWN_POLYGONS.HEXAGON]: /** @type {Pos} */ { i: 6, j: 0 },
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
  clouds: false,
  digitalClock: false,
  music: false,
  mapGeneration: MAP_GENERATION.DISTANCE,
};
