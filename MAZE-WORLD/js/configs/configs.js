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
  passTime: false,
  rotationAnimation: true,
  showPos: false,
  showChunks: false,
  usePerspective: false,
  mapGeneration: MAP_GENERATION.DISTANCE,
};

export const CONFIG = {
  chunkRows: 100,
  chunkColumns: 100,
  cellHeight: 24,

  minZoom: 6,
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
  touchThreshold: 25,
};

export const CANVAS_CONFIG = {
  strokeColor: "black",
  emptyColor: "black",
  lineWidth: 1,
  wallDarkness: 0.5,
  fluidSpeed: 500,
};

export const GRID = /** @type {import("../configs/infos.js").Cell[][]} */ ([]);
