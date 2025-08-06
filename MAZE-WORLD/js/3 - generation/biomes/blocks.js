import { ENTITY_TYPES } from "../../2 - entities/index.js";

/**
 * @param {string} hexColor
 * @returns {Color}
 */
const hexToRgb = (hexColor) => {
  let hex = hexColor.slice(1);
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  return { r, g, b };
};

const ENEMY_SPAWN = {
  probability: 0.00001,
  entityType: ENTITY_TYPES.ENEMY,
  spawnOnMove: true,
  increaseWithTime: true,
};

export const TRACK_TYPES = {
  TRACK1: "sounds/blocks/track1.mp3",
  TRACK2: "sounds/blocks/track2.mp3",
  TRACK3: "sounds/blocks/track3.mp3",
  TRACK4: "sounds/blocks/track4.mp3",
  TRACK5: "sounds/blocks/track5.mp3",
  TRACK6: "sounds/blocks/track6.mp3",
  TRACK7: "sounds/blocks/track7.mp3",
};

export const BLOCKS = /** @type {{ [k: string]: Block }} */ ({
  DEEP_WATER: {
    color: hexToRgb("#256299"),
    layer: 0,
    isFluid: true,
    spawnableEntities: [
      { probability: 0.0005, entityType: ENTITY_TYPES.TREE },
      { probability: 0.0005, entityType: ENTITY_TYPES.RABBIT },
      ENEMY_SPAWN,
    ],
    trackType: "TRACK4",
  },
  MEDIUM_WATER: {
    color: hexToRgb("#2375b4"),
    layer: 0,
    isFluid: true,
    trackType: "TRACK7",
  },
  SEA_SHORE: {
    color: hexToRgb("#4699de"),
    layer: 0,
    isFluid: true,
    trackType: "TRACK5",
  },
  BEACH_SAND: {
    color: hexToRgb("#ab976a"),
    layer: 0,
    spawnableEntities: [ENEMY_SPAWN],
    trackType: "TRACK3",
  },
  LOW_GRASS: { color: hexToRgb("#457950"), layer: 0, trackType: "TRACK2" },
  MID_GRASS: {
    color: hexToRgb("#2d673e"),
    layer: 0,
    spawnableEntities: [
      { probability: 0.01, entityType: ENTITY_TYPES.TREE },
      { probability: 0.0005, entityType: ENTITY_TYPES.RABBIT },
      ENEMY_SPAWN,
    ],
    trackType: "TRACK1",
  },
  HIGH_GRASS: { color: hexToRgb("#2d673e"), layer: 1, trackType: "TRACK1" },
  DIRT: { color: hexToRgb("#3F573A"), layer: 1, trackType: "TRACK6" },
  ROCK: { color: hexToRgb("#CBC0BB"), layer: 1 },
});
