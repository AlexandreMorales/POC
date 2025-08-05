import { POLY_INFO } from "../../1 - polygones/index.js";
import { GENERATION_CONFIG, getBiomeMap } from "../../3 - generation/index.js";
import { getFillStyle } from "../render.js";

const MAP_CONFIG = {
  posRatio: 10,
  playerColor: /** @type {Color} */ ({
    r: 212,
    g: 172,
    b: 156,
  }),
  xRatio: 0,
  yRatio: 0,
};

const mapContainer = document.getElementById("map-container");
const mapCanvas = /** @type {HTMLCanvasElement} */ (
  document.getElementById("map-canvas")
);
const mapContext = mapCanvas.getContext("2d");

export const resetBiomeMap = () => {
  mapCanvas.width = mapContainer.offsetWidth;
  mapCanvas.height = mapContainer.offsetHeight;

  MAP_CONFIG.xRatio = mapCanvas.width / (MAP_CONFIG.posRatio * 2 + 1);
  MAP_CONFIG.yRatio = mapCanvas.height / (MAP_CONFIG.posRatio * 2 + 1);
};

export const updateBiomeMap = () => {
  const { iOffset, jOffset } = POLY_INFO;
  const biomes = getBiomeMap();

  for (let i = -MAP_CONFIG.posRatio; i <= MAP_CONFIG.posRatio; i++) {
    for (let j = -MAP_CONFIG.posRatio; j <= MAP_CONFIG.posRatio; j++) {
      const biome = biomes[i]?.[j];
      if (!biome) continue;
      createRect({ i, j }, biome.mapColor);
    }
  }

  createRect(
    {
      i: Math.round(iOffset / GENERATION_CONFIG.chunkSize),
      j: Math.round(jOffset / GENERATION_CONFIG.chunkSize),
    },
    MAP_CONFIG.playerColor
  );
};

/**
 * @param {Pos} pos
 * @param {Color} color
 */
const createRect = (pos, color) => {
  mapContext.fillStyle = getFillStyle(color, false);
  mapContext.fillRect(
    (MAP_CONFIG.posRatio + pos.j) * MAP_CONFIG.xRatio,
    (MAP_CONFIG.posRatio + pos.i) * MAP_CONFIG.yRatio,
    MAP_CONFIG.xRatio,
    MAP_CONFIG.yRatio
  );
};
