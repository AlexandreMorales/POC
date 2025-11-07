import { BIOME_TYPES, ENTITY_TYPES } from "../../2 - entities/index.js";

/**
 * @param {string} hexColor
 * @returns {Color}
 */
const hexToRgb = (hexColor) => {
  let hex = hexColor.trim().slice(1);
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  return { r, g, b };
};

export const TRACK_TYPES = {
  // Song1
  TRACK1: "TRACK1",
  TRACK2: "TRACK2",
  TRACK3: "TRACK3",
  TRACK4: "TRACK4",
  TRACK5: "TRACK5",
  TRACK6: "TRACK6",

  // Song2
  TRACK7: "TRACK7",
  TRACK8: "TRACK8",
  TRACK9: "TRACK9",
  TRACK11: "TRACK11",

  // Drums
  TRACK10: "TRACK10",

  // Song3
  TRACK12: "TRACK12",
  TRACK13: "TRACK13",
  TRACK14: "TRACK14",
  TRACK15: "TRACK15",
  TRACK16: "TRACK16",
};

const ENEMY_SPAWN = {
  probability: 0.00001,
  entityType: ENTITY_TYPES.ENEMY,
  spawnOnMove: true,
  increaseWithTime: true,
};
const WATER_SPAWNS = [
  { probability: 0.0005, entityType: ENTITY_TYPES.TREE },
  { probability: 0.0005, entityType: ENTITY_TYPES.RABBIT },
  ENEMY_SPAWN,
];
const FOREST_SPAWNS = [
  { probability: 0.01, entityType: ENTITY_TYPES.TREE },
  { probability: 0.0005, entityType: ENTITY_TYPES.RABBIT },
  ENEMY_SPAWN,
];
const SNOW_PROPS = {
  biomeType: BIOME_TYPES.SNOW,
  spawnableEntities: [
    { probability: 0.01, entityType: ENTITY_TYPES.TREE },
    ENEMY_SPAWN,
  ],
};
const DESERT_PROPS = {
  biomeType: BIOME_TYPES.DESERT,
  spawnableEntities: [
    { probability: 0.001, entityType: ENTITY_TYPES.TREE },
    {
      ...ENEMY_SPAWN,
      probability: 0.00005,
    },
  ],
};

export const EMPTY_BLOCK = /** @type {Block} */ ({
  layer: 0,
  color: { r: -1, g: -1, b: -1 },
});

// Adding space on the rgb color so VScode shows the color
export const BLOCKS = /** @type {{ [k: string]: Block }} */ ({
  DEEP_WATER: {
    color: hexToRgb(" #256299"),
    layer: 0,
    isFluid: true,
    spawnableEntities: WATER_SPAWNS,
    trackType: TRACK_TYPES.TRACK5,
  },
  WATER: {
    color: hexToRgb(" #2375b4"),
    layer: 0,
    isFluid: true,
    trackType: TRACK_TYPES.TRACK4,
  },
  LOW_GRASS: {
    color: hexToRgb(" #457950"),
    layer: 0,
    spawnableEntities: FOREST_SPAWNS,
    trackType: TRACK_TYPES.TRACK2,
  },
  MID_GRASS: {
    color: hexToRgb(" #2d673e"),
    layer: 0,
    spawnableEntities: FOREST_SPAWNS,
    trackType: TRACK_TYPES.TRACK1,
  },
  HIGH_GRASS: {
    color: hexToRgb(" #2d673e"),
    layer: 1,
    trackType: TRACK_TYPES.TRACK1,
  },
  DIRT: {
    color: hexToRgb(" #3F573A"),
    layer: 1,
    trackType: TRACK_TYPES.TRACK6,
  },
  ROCK: { color: hexToRgb(" #CBC0BB"), layer: 1 },
  BEACH_SAND: {
    color: hexToRgb(" #ab976a"),
    layer: 0,
    spawnableEntities: [ENEMY_SPAWN],
    trackType: TRACK_TYPES.TRACK3,
  },

  // Snow
  FROZEN_WATER: {
    color: hexToRgb(" #94F2F4"),
    layer: 0,
    trackType: TRACK_TYPES.TRACK11,
    ...SNOW_PROPS,
  },
  FROZEN_SEA_SHORE: {
    color: hexToRgb(" #A0E6EC"),
    layer: 0,
    trackType: TRACK_TYPES.TRACK8,
    ...SNOW_PROPS,
  },
  SLUSH: {
    color: hexToRgb(" #D0ECEB"),
    layer: 0,
    trackType: TRACK_TYPES.TRACK8,
    ...SNOW_PROPS,
  },
  ICE: {
    color: hexToRgb(" #ECFFFD"),
    layer: 0,
    trackType: TRACK_TYPES.TRACK7,
    ...SNOW_PROPS,
  },
  HIGH_ICE: {
    color: hexToRgb(" #ECFFFD"),
    layer: 1,
    trackType: TRACK_TYPES.TRACK7,
    ...SNOW_PROPS,
  },

  // Desert
  DUST: {
    color: hexToRgb(" #DAA98B"),
    layer: 0,
    trackType: TRACK_TYPES.TRACK16,
    ...DESERT_PROPS,
  },
  SAND: {
    color: hexToRgb(" #EC912E"),
    layer: 0,
    trackType: TRACK_TYPES.TRACK14,
    ...DESERT_PROPS,
  },
  DARK_SAND: {
    color: hexToRgb(" #CC7025"),
    layer: 0,
    trackType: TRACK_TYPES.TRACK14,
    ...DESERT_PROPS,
  },
  TERRACOTA: {
    color: hexToRgb(" #9F561A"),
    layer: 0,
    trackType: TRACK_TYPES.TRACK15,
    ...DESERT_PROPS,
  },
  HIGH_TERRACOTA: {
    color: hexToRgb(" #9F561A"),
    layer: 1,
    trackType: TRACK_TYPES.TRACK14,
    ...DESERT_PROPS,
  },
});
