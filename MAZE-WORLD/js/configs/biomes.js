/**
 * @typedef {Object} Color
 * @property {number} r
 * @property {number} g
 * @property {number} b
 */

/**
 * @typedef {Object} BlockEntity
 * @property {string} color
 * @property {number} layer
 * @property {Color} [colorRGB]
 * @property {boolean} [isFluid]
 */

/**
 * @typedef {Object} BlockProps
 * @property {number} max
 */

/**
 * @typedef {BlockEntity & BlockProps} Block
 */

/**
 * @typedef {Object} Biome
 * @property {Block[]} ranges
 * @property {number} maxDistance The max distance from 0,0 for this biome to appear
 * @property {number} maxValue The max value from perlin noise for this biome to appear
 * @property {BlockEntity} higherGroundBlock
 */

/**
 * @param {BlockEntity} block
 * @returns {BlockEntity}
 */
const addRgbToBlock = (block) => {
  block.colorRGB = hexToRgb(block.color);
  return block;
};

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
 * @param {BlockEntity} block
 * @param {BlockProps} props
 * @returns {Block}
 */
const addPropsToBlock = (block, props) => ({ ...block, ...props });

export const BLOCKS = /** @type {{ [k: string]: BlockEntity }} */ ({
  DEEP_WATER: addRgbToBlock({ color: "#256299", layer: -1, isFluid: true }),
  MEDIUM_WATER: addRgbToBlock({ color: "#2375b4", layer: -1, isFluid: true }),
  SEA_SHORE: addRgbToBlock({ color: "#4699de", layer: -1, isFluid: true }),
  BEACH_SAND: addRgbToBlock({ color: "#ab976a", layer: 0 }),
  LOW_GRASS: addRgbToBlock({ color: "#457950", layer: 0 }),
  MID_GRASS: addRgbToBlock({ color: "#2d673e", layer: 0 }),
  HIGH_GRASS: addRgbToBlock({ color: "#2d673e", layer: 1 }),
  DIRT: addRgbToBlock({ color: "#3F573A", layer: 1 }),
  ROCK: addRgbToBlock({ color: "#CBC0BB", layer: 1 }),
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
      addPropsToBlock(BLOCKS.BEACH_SAND, { max: 0.35 }),
      addPropsToBlock(BLOCKS.LOW_GRASS, { max: 0.4 }),
      addPropsToBlock(BLOCKS.HIGH_GRASS, { max: 0.5 }),
      addPropsToBlock(BLOCKS.DIRT, { max: 1 }),
    ],
  },
});

export const BIOMES = /** @type {Biome[]} */ (Object.values(BIOMES_RAW));
