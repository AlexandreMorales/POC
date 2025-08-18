import { RENDER_INFO } from "../../1 - polygones/index.js";
import { GENERATION_CONFIG, getBiomeMap } from "../../3 - generation/index.js";
import { clearCanvas, getFillStyle } from "../render.js";

const MAP_CONFIG = {
  currentPosRatio: 5,
  posRatio: 5,
  fullScreenPosRatio: 50,
  playerColor: /** @type {Color} */ ({
    r: 212,
    g: 172,
    b: 156,
  }),
  xRatio: 0,
  yRatio: 0,
};

const mapCanvas = /** @type {HTMLCanvasElement} */ (
  document.getElementById("map-canvas")
);
const mapContext = mapCanvas.getContext("2d");

export const resetBiomeMap = () => {
  let size = 0;
  if (fullMap) {
    size = Math.min(window.innerWidth, window.innerHeight) * 0.96;
    MAP_CONFIG.currentPosRatio = MAP_CONFIG.fullScreenPosRatio;
  } else {
    size = mapCanvas.parentElement.offsetWidth;
    MAP_CONFIG.currentPosRatio = MAP_CONFIG.posRatio;
  }
  mapCanvas.width = size;
  mapCanvas.height = size;

  MAP_CONFIG.xRatio = mapCanvas.width / (MAP_CONFIG.currentPosRatio * 2 + 1);
  MAP_CONFIG.yRatio = mapCanvas.height / (MAP_CONFIG.currentPosRatio * 2 + 1);
};

export const updateBiomeMap = () => {
  clearCanvas(mapCanvas);
  const biomes = getBiomeMap();
  const iOffset = Math.round(RENDER_INFO.iOffset / GENERATION_CONFIG.chunkSize);
  const jOffset = Math.round(RENDER_INFO.jOffset / GENERATION_CONFIG.chunkSize);
  const iNegLimit = iOffset - MAP_CONFIG.currentPosRatio;
  const iPosLimit = iOffset + MAP_CONFIG.currentPosRatio + 1;
  const jNegLimit = jOffset - MAP_CONFIG.currentPosRatio;
  const jPosLimit = jOffset + MAP_CONFIG.currentPosRatio + 1;

  for (let i = iNegLimit; i <= iPosLimit; i++) {
    const nI = i - iOffset;
    for (let j = jNegLimit; j <= jPosLimit; j++) {
      const nJ = j - jOffset;

      const biome = biomes[i]?.[j];
      if (!biome) continue;
      createRect({ i: nI, j: nJ }, biome.mapColor);
    }
  }

  createRect({ i: 0, j: 0 }, MAP_CONFIG.playerColor);
};

let fullMap = false;

/**
 * @param {boolean} toggle
 */
export const toggleFullMap = (toggle = !fullMap) => {
  fullMap = toggle;

  if (toggle) {
    mapCanvas.classList.add("full-screen");
    resetBiomeMap();
    updateBiomeMap();
  } else {
    mapCanvas.classList.remove("full-screen");
    resetBiomeMap();
    updateBiomeMap();
  }
};

/**
 * @param {Pos} pos
 * @param {Color} color
 */
const createRect = (pos, color) => {
  mapContext.fillStyle = getFillStyle(color);
  mapContext.fillRect(
    (MAP_CONFIG.currentPosRatio + pos.j) * MAP_CONFIG.xRatio,
    (MAP_CONFIG.currentPosRatio + pos.i) * MAP_CONFIG.yRatio,
    MAP_CONFIG.xRatio,
    MAP_CONFIG.yRatio
  );
};
