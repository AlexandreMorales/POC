/**
 * @param {number} max
 * @returns {number}
 */
export const getRandomInt = (max) => Math.floor(Math.random() * max);

/**
 * @param {{ i: number, j: number }} param
 * @returns {boolean}
 */
export const isCellInverted = ({ i, j }) => (i + j) % 2 !== 0;

/**
 * @param {number} number
 * @param {number} estimation
 * @returns {number}
 */
export const correctRoundError = (number, estimation = 6) =>
  +number.toFixed(estimation);
