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
};

const mapContainer = document.getElementById("map-container");
const mapCanvas = /** @type {HTMLCanvasElement} */ (
  document.getElementById("map-canvas")
);
mapCanvas.width = mapContainer.offsetWidth;
mapCanvas.height = mapContainer.offsetHeight;
const mapContext = mapCanvas.getContext("2d");

const xRatio = mapCanvas.width / (MAP_CONFIG.posRatio * 2 + 1);
const yRatio = mapCanvas.height / (MAP_CONFIG.posRatio * 2 + 1);

export const updateMap = () => {
  const { iOffset, jOffset } = POLY_INFO;
  const biomes = getBiomeMap();

  for (let i = -MAP_CONFIG.posRatio; i <= MAP_CONFIG.posRatio; i++) {
    for (let j = -MAP_CONFIG.posRatio; j <= MAP_CONFIG.posRatio; j++) {
      const biome = biomes[i]?.[j];
      if (!biome) continue;

      mapContext.fillStyle = getFillStyle(biome.mapColor, false);
      mapContext.fillRect(
        (MAP_CONFIG.posRatio + j) * xRatio,
        (MAP_CONFIG.posRatio + i) * yRatio,
        xRatio,
        yRatio
      );
    }
  }

  mapContext.fillStyle = getFillStyle(MAP_CONFIG.playerColor, false);
  mapContext.fillRect(
    (MAP_CONFIG.posRatio + Math.round(jOffset / GENERATION_CONFIG.chunkSize)) *
      xRatio,
    (MAP_CONFIG.posRatio + Math.round(iOffset / GENERATION_CONFIG.chunkSize)) *
      yRatio,
    xRatio,
    yRatio
  );
};
