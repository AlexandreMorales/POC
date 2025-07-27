/**
 * @param {import("./configs/infos").CellPos} param
 * @returns {boolean}
 */
export const isCellInverted = ({ i, j }) => (i + j) % 2 !== 0;

/**
 * @param {number} num
 * @param {number} estimation
 * @returns {number}
 */
export const correctRoundError = (num, estimation = 4) =>
  Math.round(num * 10 ** estimation) / 10 ** estimation;

/**
 * @param {import("./configs/biomes").Color} color
 * @returns {import("./configs/biomes").Color}
 */
export const tweakColor = ({ r, g, b }) => {
  const randSaturation = Math.random() * 0.1 + 0.95;
  const randBrightness = Math.random() * 0.1 + 0.95;

  r = Math.round(r * randSaturation * randBrightness);
  g = Math.round(g * randSaturation * randBrightness);
  b = Math.round(b * randSaturation * randBrightness);

  return { r, g, b };
};

/**
 * @param {import("./configs/biomes.js").Color} color
 * @param {number} modifier
 * @returns {string}
 */
export const colorToRGB = ({ r, g, b }, modifier = 1) => {
  return `rgb(${r * modifier}, ${g * modifier}, ${b * modifier})`;
};

/**
 * @param {number} number
 * @param {number} mod
 * @returns {number}
 */
export const getMod = (number, mod) => (mod + (number % mod)) % mod;

/**
 * @param {function} fn
 * @param {number} timeout
 * @returns {(p: any) => void}
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
 * @param {number} n
 * @param {number} range
 */
export const getRange = (n, range) => Math.floor(n / range) * range;
