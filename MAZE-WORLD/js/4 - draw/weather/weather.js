import { updateClouds } from "./clouds.js";
import { updateRain } from "./rain.js";

/**
 * @param {symbol} [direction]
 */
export const updateWeather = (direction) => {
  updateRain();
  updateClouds(direction);
};
