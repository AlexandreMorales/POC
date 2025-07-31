import { ENTITY_TYPES } from "../2 - entities/index.js";

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

/**
 * @param {Block} block
 * @param {BlockProps} props
 * @returns {BlockEntity}
 */
const addPropsToBlock = (block, props) => ({ ...block, ...props });

export const BLOCKS = /** @type {{ [k: string]: Block }} */ ({
  DEEP_WATER: {
    color: hexToRgb("#256299"),
    layer: 0,
    isFluid: true,
    spawnableEntities: [
      { probability: 0.004, entityType: ENTITY_TYPES.TREE },
      {
        probability: 0.0001,
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
        probability: 0.0001,
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

const BIOMES_RAW = /** @type {{ [k: string]: Biome }} */ ({
  FOREST: {
    maxValue: 0,
    maxDistance: 100,
    higherGroundBlock: BLOCKS.MID_GRASS,
    ranges: [
      addPropsToBlock(BLOCKS.MEDIUM_WATER, { max: -0.5 }),
      addPropsToBlock(BLOCKS.SEA_SHORE, { max: -0.4 }),
      addPropsToBlock(BLOCKS.LOW_GRASS, { max: -0.2 }),
      addPropsToBlock(BLOCKS.MID_GRASS, { max: 0.4 }),
      addPropsToBlock(BLOCKS.HIGH_GRASS, { max: 0.5 }),
      addPropsToBlock(BLOCKS.DIRT, { max: 0.7 }),
      addPropsToBlock(BLOCKS.ROCK, { max: 1 }),
    ],
  },
  OCEAN: {
    maxValue: Infinity,
    maxDistance: Infinity,
    higherGroundBlock: BLOCKS.MID_GRASS,
    ranges: [
      addPropsToBlock(BLOCKS.DEEP_WATER, { max: -0.1 }),
      addPropsToBlock(BLOCKS.MEDIUM_WATER, { max: 0.1 }),
      addPropsToBlock(BLOCKS.SEA_SHORE, { max: 0.2 }),
      addPropsToBlock(BLOCKS.BEACH_SAND, { max: 0.4 }),
      addPropsToBlock(BLOCKS.LOW_GRASS, { max: 0.5 }),
      addPropsToBlock(BLOCKS.HIGH_GRASS, { max: 0.7 }),
      addPropsToBlock(BLOCKS.DIRT, { max: 1 }),
    ],
  },
});

export const BIOMES = /** @type {Biome[]} */ (Object.values(BIOMES_RAW));
