import { BLOCKS } from "./_blocks.js";

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
    minValue: -1,
    minDistance: 0,
    higherGroundBlock: BLOCKS.MID_GRASS,
    ranges: [
      addPropsToBlock(BLOCKS.WATER, { max: -0.4 }),
      addPropsToBlock(BLOCKS.LOW_GRASS, { max: -0.2 }),
      addPropsToBlock(BLOCKS.MID_GRASS, { max: 0.4 }),
      addPropsToBlock(BLOCKS.HIGH_GRASS, { max: 0.5 }),
      addPropsToBlock(BLOCKS.DIRT, { max: 1 }),
    ],
  },
  OCEAN: {
    name: "OCEAN",
    mapColor: BLOCKS.WATER.color,
    minValue: -0.2,
    minDistance: 100,
    higherGroundBlock: BLOCKS.MID_GRASS,
    ranges: [
      addPropsToBlock(BLOCKS.DEEP_WATER, { max: -0.1 }),
      addPropsToBlock(BLOCKS.WATER, { max: 0.3 }),
      addPropsToBlock(BLOCKS.BEACH_SAND, { max: 0.5 }),
      addPropsToBlock(BLOCKS.LOW_GRASS, { max: 0.7 }),
      addPropsToBlock(BLOCKS.HIGH_GRASS, { max: 0.8 }),
      addPropsToBlock(BLOCKS.DIRT, { max: 1 }),
    ],
  },
  SNOW: {
    name: "SNOW",
    mapColor: BLOCKS.ICE.color,
    minValue: 0.2,
    minDistance: 300,
    higherGroundBlock: BLOCKS.ICE,
    negativeJ: false,
    ranges: [
      addPropsToBlock(BLOCKS.FROZEN_WATER, { max: -0.2 }),
      addPropsToBlock(BLOCKS.FROZEN_SEA_SHORE, { max: 0 }),
      addPropsToBlock(BLOCKS.SLUSH, { max: 0.1 }),
      addPropsToBlock(BLOCKS.HIGH_ICE, { max: 1 }),
    ],
  },
  DESERT: {
    name: "DESERT",
    mapColor: BLOCKS.SAND.color,
    minValue: 0,
    minDistance: 300,
    higherGroundBlock: BLOCKS.TERRACOTA,
    negativeJ: true,
    ranges: [
      addPropsToBlock(BLOCKS.DUST, { max: -0.4 }),
      addPropsToBlock(BLOCKS.SAND, { max: -0.2 }),
      addPropsToBlock(BLOCKS.DARK_SAND, { max: 0 }),
      addPropsToBlock(BLOCKS.TERRACOTA, { max: 0.2 }),
      addPropsToBlock(BLOCKS.HIGH_TERRACOTA, { max: 1 }),
    ],
  },
});

export const BIOMES = Object.values(BIOMES_RAW).sort(
  (a, b) => b.minDistance - a.minDistance
);
