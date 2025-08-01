import { GENERATION_CONFIG } from "./configs.js";
import { getChunkStart } from "./utils.js";

export const VECTORS = {
  BIOME: Symbol("BIOME"),
  BLOCK: Symbol("BLOCK"),
};

const PERLIN_CONFIG = {
  noiseResolutionBiome: 75,
  noiseResolution: 10,
};

/**
 * @typedef {Object} Vector
 * @property {Point[][]} vectors
 * @property {number} width
 * @property {number} height
 * @property {number} resolution
 */

/**
 * @param {number} size
 * @param {number} resolution
 * @returns {number}
 */
const getSizeFromNoise = (size, resolution) => {
  const numVectorsX = Math.floor(size / resolution) + 1;
  const extraVectorX = size % resolution == 0 ? 0 : 1;
  return numVectorsX + extraVectorX;
};

/**
 * @param {Vector} vector
 * @returns {Vector}
 */
const initializeVector = (vector) => {
  return {
    width: getSizeFromNoise(vector.width, vector.resolution),
    height: getSizeFromNoise(vector.height, vector.resolution),
    vectors: [],
    resolution: vector.resolution,
  };
};

const vectors = /** @type {{ [k: symbol]: Vector }} */ ({
  [VECTORS.BIOME]: initializeVector({
    width: GENERATION_CONFIG.chunkColumns,
    height: GENERATION_CONFIG.chunkRows,
    vectors: [],
    resolution: PERLIN_CONFIG.noiseResolutionBiome,
  }),
  [VECTORS.BLOCK]: initializeVector({
    width: GENERATION_CONFIG.chunkColumns,
    height: GENERATION_CONFIG.chunkRows,
    vectors: [],
    resolution: PERLIN_CONFIG.noiseResolution,
  }),
});

/**
 * @param {number} i
 * @param {number} j
 * @param {Vector} vector
 */
const updateVector = (i, j, vector) => {
  const [offsetI, offsetJ] = getChunkStart(
    { i, j },
    vector.height,
    vector.width
  );
  for (let i = 0; i <= vector.height - 1; i++) {
    const nI = i + offsetI;
    vector.vectors[nI] = vector.vectors[nI] || [];
    for (let j = 0; j <= vector.width - 1; j++) {
      const nJ = j + offsetJ;
      vector.vectors[nI][nJ] = getRandUnitVect();
    }
  }
};

/**
 * @returns {Point}
 */
const getRandUnitVect = () => {
  const theta = Math.random() * 2 * Math.PI;
  return { x: Math.cos(theta), y: Math.sin(theta) };
};

/**
 * @param {number} i
 * @param {number} j
 * @param {symbol} vectorType
 * @returns {number}
 */
export const getValue = (i, j, vectorType) => {
  const vector = vectors[vectorType];

  const offset = 0.5 / vector.resolution;

  const x = i / vector.resolution + offset;
  const y = j / vector.resolution + offset;

  const xF = Math.floor(x);
  const yF = Math.floor(y);

  const tlv = dotProduct(vector, x, y, xF, yF);
  const trv = dotProduct(vector, x, y, xF + 1, yF);
  const blv = dotProduct(vector, x, y, xF, yF + 1);
  const brv = dotProduct(vector, x, y, xF + 1, yF + 1);

  const lerpTop = lerp(tlv, trv, x - xF);
  const lerpBottom = lerp(blv, brv, x - xF);
  const value = lerp(lerpTop, lerpBottom, y - yF);

  return value;
};

/**
 * @param {number} x
 * @param {number} y
 * @param {number} vx
 * @param {number} vy
 * @param {Vector} vector
 * @returns {number}
 */
const dotProduct = (vector, x, y, vx, vy) => {
  if (!vector.vectors[vy]?.[vx]) updateVector(vy, vx, vector);
  return dot({ x: x - vx, y: y - vy }, vector.vectors[vy][vx]);
};

/**
 * @param {Point} v1
 * @param {Point} v2
 * @returns {number}
 */
const dot = (v1, v2) => v1.x * v2.x + v1.y * v2.y;

/**
 * @param {number} a
 * @param {number} b
 * @param {number} c
 * @returns {number}
 */
const lerp = (a, b, c) => a + smootherstep(c) * (b - a);

/**
 * @param {number} x
 * @returns {number}
 */
const smootherstep = (x) => 6 * x ** 5 - 15 * x ** 4 + 10 * x ** 3;
