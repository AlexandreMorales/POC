/**
 * @typedef {Object} Block
 * @property {number} max
 * @property {string} color
 * @property {{ r: number, g: number, b: number }} [colorRGB]
 * @property {boolean} [isFluid]
 */

const BLOCKS1 = /** @type {{ [k: string]: Block }} */ ({
  DEEP_WATER: { max: -0.1, color: "#256299", isFluid: true },
  MEDIUM_WATER: { max: 0.1, color: "#2375b4", isFluid: true },
  SEA_SHORE: { max: 0.2, color: "#4699de" },
  BEACH_SAND: { max: 0.35, color: "#ab976a" },
  LOW_GRASS: { max: 0.4, color: "#457950" },
  HIGH_GRASS: { max: 0.5, color: "#2d673e" },
  DIRT: { max: 0.7, color: "#3F573A" },
  ROCK: { max: 1, color: "#CBC0BB" },
});

const BLOCKS2 = /** @type {{ [k: string]: Block }} */ ({
  DEEP_WATER: { max: -0.6, color: "#256299", isFluid: true },
  MEDIUM_WATER: { max: -0.5, color: "#2375b4", isFluid: true },
  SEA_SHORE: { max: -0.4, color: "#4699de", isFluid: true },
  BEACH_SAND: { max: -0.35, color: "#ab976a" },
  LOW_GRASS: { max: 0.2, color: "#457950" },
  HIGH_GRASS: { max: 0.5, color: "#2d673e" },
  DIRT: { max: 0.7, color: "#3F573A" },
  ROCK: { max: 1, color: "#CBC0BB" },
});

export const BIOMES = {
  FOREST: {
    ranges: BLOCKS2,
  },
  OCEAN: {
    ranges: BLOCKS1,
  },
};
