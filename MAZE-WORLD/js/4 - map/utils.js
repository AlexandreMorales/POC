/**
 * @param {number} n
 * @param {number} range
 * @returns {number}
 */
const getRange = (n, range) => Math.floor(n / range) * range;

/**
 * @param {import("../0 - configs/infos.js").Pos} pos
 * @param {number} height
 * @param {number} width
 * @returns {number[]}
 */
export const getChunkStart = (pos, height, width) => [
  getRange(pos.i, height),
  getRange(pos.j, width),
];
