import { BLOCKS } from "./blocks.js";

/**
 * @param {Block} block
 * @param {BlockProps} props
 * @returns {BlockEntity}
 */
const addPropsToBlock = (block, props) => ({ ...block, ...props });

const BIOMES_RAW = /** @type {{ [k: string]: Biome }} */ ({
  FOREST: {
    name: "FOREST",
    mapColor: BLOCKS.MID_GRASS.color,
    maxValue: 0,
    maxDistance: 50,
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
    name: "OCEAN",
    mapColor: BLOCKS.MEDIUM_WATER.color,
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
