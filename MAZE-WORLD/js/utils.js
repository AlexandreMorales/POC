/**
 * @param {number} max
 * @returns {number}
 */
export const getRandomInt = (max) => Math.floor(Math.random() * max);

/**
 * @param {function} fn
 * @param {number} timeout
 * @returns {function}
 */
export const debounce = (fn, timeout = 10) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, timeout);
  };
};

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

/**
 * @param {{ r: number, g: number, b: number }} color
 * @returns {{ r: number, g: number, b: number }}
 */
export const tweakColor = ({ r, g, b }) => {
  let randSaturation = Math.random() * 0.1 + 0.95;
  let randBrightness = Math.random() * 0.1 + 0.95;

  r = Math.round(Math.min(r * randSaturation * randBrightness, 255));
  g = Math.round(Math.min(g * randSaturation * randBrightness, 255));
  b = Math.round(Math.min(b * randSaturation * randBrightness, 255));

  return { r, g, b };
};
