/**
 * @typedef {Object} Color
 * @property {number} r
 * @property {number} g
 * @property {number} b
 */

/**
 * @typedef {Object} Block
 * @property {number} max
 * @property {string} color
 * @property {Color} [colorRGB]
 * @property {boolean} [isFluid]
 */

/**
 * @param {Block} block
 * @returns {Block}
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

const BLOCKS2 = /** @type {{ [k: string]: Block }} */ ({
  DEEP_WATER: { max: -0.1, color: "#256299", isFluid: true },
  MEDIUM_WATER: { max: 0.1, color: "#2375b4", isFluid: true },
  SEA_SHORE: { max: 0.2, color: "#4699de", isFluid: true },
  BEACH_SAND: { max: 0.35, color: "#ab976a" },
  LOW_GRASS: { max: 0.4, color: "#457950" },
  HIGH_GRASS: { max: 0.5, color: "#2d673e" },
  DIRT: { max: 0.7, color: "#3F573A" },
  ROCK: { max: 1, color: "#CBC0BB" },
});

const BLOCKS = /** @type {{ [k: string]: Block }} */ ({
  DEEP_WATER: addRgbToBlock({ max: -0.6, color: "#256299", isFluid: true }),
  MEDIUM_WATER: addRgbToBlock({ max: -0.5, color: "#2375b4", isFluid: true }),
  SEA_SHORE: addRgbToBlock({ max: -0.4, color: "#4699de", isFluid: true }),
  BEACH_SAND: addRgbToBlock({ max: -0.35, color: "#ab976a" }),
  LOW_GRASS: addRgbToBlock({ max: 0.2, color: "#457950" }),
  HIGH_GRASS: addRgbToBlock({ max: 0.5, color: "#2d673e" }),
  DIRT: addRgbToBlock({ max: 0.7, color: "#3F573A" }),
  ROCK: addRgbToBlock({ max: 1, color: "#CBC0BB" }),
});

export const BIOMES = {
  FOREST: {
    ranges: BLOCKS,
  },
  OCEAN: {
    ranges: BLOCKS2,
  },
};
