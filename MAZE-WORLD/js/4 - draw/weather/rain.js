import { POLY_INFO, MENU_CONFIG } from "../../1 - polygones/index.js";
import { getRandomFloat } from "../../utils.js";

const rainContainer = document.getElementById("rain-container");

export const updateRain = () => {
  clearLightning();
  if (MENU_CONFIG.rain) {
    rainContainer.classList.remove("hide");
    const size = POLY_INFO.cellHeight * 10;
    rainContainer.style.setProperty("--rain-size", `${size}px`);
    createLightining();
  } else {
    rainContainer.classList.add("hide");
  }
};

let lightningInterval = null;
const createLightining = () => {
  clearTimeout(lightningInterval);
  // Between 10s and 30s
  const secs = getRandomFloat(10000, 30000);
  lightningInterval = setTimeout(() => {
    rainContainer.classList.remove("lightning");
    // trigger reflow
    rainContainer.offsetHeight;
    rainContainer.classList.add("lightning");
    createLightining();
  }, secs);
};

const clearLightning = () => {
  clearTimeout(lightningInterval);
  rainContainer.classList.remove("lightning");
};
