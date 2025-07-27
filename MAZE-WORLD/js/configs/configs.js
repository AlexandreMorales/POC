export const KNOWN_POLYGONS = {
  TRIANGLE: 3,
  SQUARE: 4,
  HEXAGON: 6,
};

export const KNOWN_POLYGONS_VALUES = Object.values(KNOWN_POLYGONS);

export const MAP_GENERATION = {
  MIX: Symbol("MIX"),
  DISTANCE: Symbol("DISTANCE"),
};

export const CONFIG = {
  debugMode: true,
  chunkRows: 100,
  chunkColumns: 100,
  cellHeight: 24,

  minZoom: 10,
  maxZoom: 120,

  maxLayer: 2,
};

export const MAP_CONFIG = {
  passHour: 0.5,
  midNightHour: 70,
  velocity: 25,
  rotateDelay: 500,
  noiseResolutionBiome: 75,
  noiseResolution: 20,
  mapGeneration: MAP_GENERATION.DISTANCE,
  touchThreshold: 25,
  passTime: false,
};

export const CANVAS_CONFIG = {
  rotationAnimation: true,
  showPos: false,
  showChunks: false,
  strokeColor: "black",
  emptyColor: "black",
  lineWidth: 1,
  wallDarkness: 0.5,
};

export const ENTITIES_CONFIG = {
  notInvertedBothClipPath: "polygon(0 0, 50% 75%, 100% 0)",
  notInvertedRightClipPath: "polygon(0 0, 0 100%, 35% 100%, 100% 0)",
  notInvertedLeftClipPath: "polygon(0 0, 65% 100%, 100% 100%, 100% 0)",

  defaultSizeRatio: 2.5,
  wallSizeRatio: 2,
};

export const MOVEMENT = {
  UP: Symbol("UP"),
  DOWN: Symbol("DOWN"),
  LEFT: Symbol("LEFT"),
  RIGHT: Symbol("RIGHT"),
};

export const MOVEMENT_VALUES = Object.values(MOVEMENT);
