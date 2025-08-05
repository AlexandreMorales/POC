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

export const BLOCKS = /** @type {{ [k: string]: Block }} */ ({
  DEEP_WATER: {
    color: hexToRgb("#256299"),
    layer: 0,
    isFluid: true,
    spawnableEntities: [
      { probability: 0.004, entityType: ENTITY_TYPES.TREE },
      {
        probability: 0.00001,
        entityType: ENTITY_TYPES.ENEMY,
        spawnOnMove: true,
        increaseWithTime: true,
      },
    ],
  },
  MEDIUM_WATER: { color: hexToRgb("#2375b4"), layer: 0, isFluid: true },
  SEA_SHORE: { color: hexToRgb("#4699de"), layer: 0, isFluid: true },
  BEACH_SAND: { color: hexToRgb("#ab976a"), layer: 0 },
  LOW_GRASS: { color: hexToRgb("#457950"), layer: 0 },
  MID_GRASS: {
    color: hexToRgb("#2d673e"),
    layer: 0,
    spawnableEntities: [
      { probability: 0.01, entityType: ENTITY_TYPES.TREE },
      {
        probability: 0.00001,
        entityType: ENTITY_TYPES.ENEMY,
        spawnOnMove: true,
        increaseWithTime: true,
      },
    ],
  },
  HIGH_GRASS: { color: hexToRgb("#2d673e"), layer: 1 },
  DIRT: { color: hexToRgb("#3F573A"), layer: 1 },
  ROCK: { color: hexToRgb("#CBC0BB"), layer: 1 },
});
