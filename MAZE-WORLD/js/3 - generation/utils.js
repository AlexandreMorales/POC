/**
 * @param {number} n
 * @param {number} range
 * @returns {number}
 */
const getRange = (n, range) => Math.floor(n / range) * range;

/**
 * @param {Pos} pos
 * @param {number} height
 * @param {number} width
 * @returns {Pos}
 */
export const getChunkStart = (pos, height, width) => ({
  i: getRange(pos.i, height),
  j: getRange(pos.j, width),
});
