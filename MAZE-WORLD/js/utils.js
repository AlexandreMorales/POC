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
 * @param {number} num
 * @param {number} estimation
 * @returns {number}
 */
export const correctRoundError = (num, estimation = 4) =>
  Math.round(num * 10 ** estimation) / 10 ** estimation;

/**
 * @param {import("./biomes").Color} color
 * @returns {import("./biomes").Color}
 */
export const tweakColor = ({ r, g, b }) => {
  const randSaturation = Math.random() * 0.1 + 0.95;
  const randBrightness = Math.random() * 0.1 + 0.95;

  r = Math.round(r * randSaturation * randBrightness);
  g = Math.round(g * randSaturation * randBrightness);
  b = Math.round(b * randSaturation * randBrightness);

  return { r, g, b };
};
