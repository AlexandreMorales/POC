/**
 * @param {number} n
 * @param {number} range
 * @returns {number}
 */
const getRange = (n, range) => Math.floor(n / range) * range;

/**
 * @param {number} i
 * @param {number} j
 * @param {number} height
 * @param {number} width
 * @returns {number[]}
 */
export const getChunkStart = (i, j, height, width) => [
  getRange(i, height),
  getRange(j, width),
];
