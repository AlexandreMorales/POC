/**
 * @param {number} num
 * @param {number} estimation
 * @returns {number}
 */
export const correctRoundError = (num, estimation = 4) =>
  Math.round(num * 10 ** estimation) / 10 ** estimation;

/**
 * @param {import("./configs/infos").Color} color
 * @returns {import("./configs/infos").Color}
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
 * @param {import("./configs/infos").Point} point
 * @param {number} canvasHeight
 * @param {number} canvasWidth
 * @returns {boolean}
 */
export const isPointOutsideCanvas = (point, canvasHeight, canvasWidth) =>
  point.x < 1 ||
  point.y < 1 ||
  point.x > canvasWidth - 1 ||
  point.y > canvasHeight - 1;
