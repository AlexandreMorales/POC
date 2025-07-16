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
 * @property {number} layer
 * @property {Color} [colorRGB]
 * @property {boolean} [isFluid]
 */

/**
 * @typedef {Object} Biome
 * @property {{ [k: string]: Block }} ranges
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

export const BIOMES = /** @type {{ [k: string]: Biome }} */ ({
  FOREST: {
    ranges: {
      DEEP_WATER: addRgbToBlock({
        max: -0.6,
        color: "#256299",
        layer: -1,
        isFluid: true,
      }),
      MEDIUM_WATER: addRgbToBlock({
        max: -0.5,
        color: "#2375b4",
        layer: -1,
        isFluid: true,
      }),
      SEA_SHORE: addRgbToBlock({
        max: -0.4,
        color: "#4699de",
        layer: -1,
        isFluid: true,
      }),
      BEACH_SAND: addRgbToBlock({ max: -0.35, color: "#ab976a", layer: 0 }),
      LOW_GRASS: addRgbToBlock({ max: 0.2, color: "#457950", layer: 0 }),
      MID_GRASS: addRgbToBlock({ max: 0.4, color: "#2d673e", layer: 0 }),
      HIGH_GRASS: addRgbToBlock({ max: 0.5, color: "#2d673e", layer: 1 }),
      DIRT: addRgbToBlock({ max: 0.7, color: "#3F573A", layer: 1 }),
      ROCK: addRgbToBlock({ max: 1, color: "#CBC0BB", layer: 2 }),
    },
  },
  OCEAN: {
    ranges: {
      DEEP_WATER: addRgbToBlock({
        max: -0.1,
        color: "#256299",
        layer: -1,
        isFluid: true,
      }),
      MEDIUM_WATER: addRgbToBlock({
        max: 0.1,
        color: "#2375b4",
        layer: -1,
        isFluid: true,
      }),
      SEA_SHORE: addRgbToBlock({
        max: 0.2,
        color: "#4699de",
        layer: -1,
        isFluid: true,
      }),
      BEACH_SAND: addRgbToBlock({ max: 0.35, color: "#ab976a", layer: 0 }),
      LOW_GRASS: addRgbToBlock({ max: 0.4, color: "#457950", layer: 0 }),
      HIGH_GRASS: addRgbToBlock({ max: 0.5, color: "#2d673e", layer: 1 }),
      DIRT: addRgbToBlock({ max: 0.7, color: "#3F573A", layer: 1 }),
      ROCK: addRgbToBlock({ max: 1, color: "#CBC0BB", layer: 2 }),
    },
  },
});
