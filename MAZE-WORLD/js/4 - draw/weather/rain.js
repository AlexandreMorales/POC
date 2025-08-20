import { RENDER_INFO, MENU_CONFIG } from "../../1 - polygones/index.js";
import { BIOME_TYPES, PLAYER_ENTITY } from "../../2 - entities/index.js";
import { getRandomFloat } from "../../_utils.js";

const rainContainer = document.getElementById("rain-container");

const BIOME_RAIN_MAP = {
  DEFAULT: "../images/weather/rain.gif",
  [BIOME_TYPES.SNOW]: "../images/weather/snow.gif",
};

const rainAudio = new Audio("sounds/weather/rain.mp3");
rainAudio.volume = 0.25;
rainAudio.loop = true;
const lightningAudio = new Audio("sounds/weather/lightning.mp3");
lightningAudio.volume = 0.25;

let isRainOn = false;

export const updateRain = () => {
  if (MENU_CONFIG.rain) {
    if (!isRainOn) {
      clearLightning();
      isRainOn = true;
      rainAudio.play();
      rainContainer.classList.remove("hide");
      const size = RENDER_INFO.cellHeight * 10;
      rainContainer.style.setProperty("--rain-size", `${size}px`);
      createLightining();
    }

    updateRainImg();
  } else {
    if (isRainOn) {
      clearLightning();
      isRainOn = false;
      rainAudio.pause();
      rainContainer.classList.add("hide");
    }
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

const updateRainImg = () => {
  const gif = `url("${
    BIOME_RAIN_MAP[PLAYER_ENTITY.cell.block.biomeType] || BIOME_RAIN_MAP.DEFAULT
  }")`;
  const currentGif = rainContainer.style.getPropertyValue("--rain-img");
  if (gif !== currentGif) rainContainer.style.setProperty("--rain-img", gif);
};
