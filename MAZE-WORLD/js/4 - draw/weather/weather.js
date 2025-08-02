import { updateClouds } from "./clouds.js";
import { updateRain } from "./rain.js";

export const updateWeather = () => {
  updateClouds();
  updateRain();
};
