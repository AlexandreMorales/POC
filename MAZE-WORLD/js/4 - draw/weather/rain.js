import { POLY_INFO, MENU_CONFIG } from "../../1 - polygones/index.js";
import { getRandomFloat } from "../../utils.js";

const rainContainer = document.getElementById("rain-container");

const rainAudio = new Audio("sounds/weather/rain.mp3");
rainAudio.volume = 0.25;
rainAudio.loop = true;
const lightningAudio = new Audio("sounds/weather/lightning.mp3");
lightningAudio.volume = 0.25;

export const updateRain = () => {
  clearLightning();
  if (MENU_CONFIG.rain) {
    rainAudio.play();
    rainContainer.classList.remove("hide");
    const size = POLY_INFO.cellHeight * 10;
    rainContainer.style.setProperty("--rain-size", `${size}px`);
    createLightining();
  } else {
    rainAudio.pause();
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
    lightningAudio.play();
    createLightining();
  }, secs);
};

const clearLightning = () => {
  clearTimeout(lightningInterval);
  rainContainer.classList.remove("lightning");
};
