import { POLY_INFO, MENU_CONFIG } from "../../1 - polygones/index.js";

const RAIN_CONFIG = {
  lightningMaxSecs: 30,
};

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
  const secs = Math.floor(Math.random() * RAIN_CONFIG.lightningMaxSecs * 1000);
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
