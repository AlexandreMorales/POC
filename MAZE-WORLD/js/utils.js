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
 * @param {string} hexColor
 * @returns {string}
 */
export const tweakColor = (hexColor) => {
  if (!hexColor) return;
  let { r, g, b } = hexToRgb(hexColor);

  let randSaturation = Math.random() * 0.1 + 0.95;
  let randBrightness = Math.random() * 0.1 + 0.95;

  r = Math.round(Math.min(r * randSaturation * randBrightness, 255));
  g = Math.round(Math.min(g * randSaturation * randBrightness, 255));
  b = Math.round(Math.min(b * randSaturation * randBrightness, 255));

  return rgbToHex(r, g, b);
};

/**
 * @param {string} hexColor
 * @returns {{ r: number, g: number, b: number }}
 */
export const hexToRgb = (hexColor) => {
  let hex = hexColor.slice(1);
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  return { r, g, b };
};

/**
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @returns {string}
 */
const rgbToHex = (r, g, b) => {
  r = Math.round(r);
  g = Math.round(g);
  b = Math.round(b);
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
};

/**
 * @param {number} c
 * @returns {string}
 */
const componentToHex = (c) => {
  let hex = c.toString(16);
  return hex.length === 1 ? "0" + hex : hex;
};
