import { CONFIG } from "./configs.js";
import { MAP_INFO, POLY_INFO } from "./infos.js";
import { resetCanvasSize, drawEveryCell, setCanvasSize } from "./draw.js";
import { configCellPos, GRID, loadChunk } from "./grid.js";
import "./movement.js";
import {
  cellIsBlocked,
  changePolySides,
  getCenterCell,
  updateOffsets,
} from "./movement.js";
import { configPolys } from "./boot.js";
import { BIOMES } from "./biomes.js";

const start = () => {
  configPolys();
  resetCanvasSize();
  CONFIG.initialRows = POLY_INFO[CONFIG.polySides].rows;
  CONFIG.initialColumns = POLY_INFO[CONFIG.polySides].columns;

  loadChunk(0, 0, BIOMES.FOREST);
  MAP_INFO.currentCell = getCenterCell();
  while (cellIsBlocked(MAP_INFO.currentCell)) {
    const nextCell =
      GRID[MAP_INFO.currentCell.pos.i + 1][MAP_INFO.currentCell.pos.j];
    updateOffsets(MAP_INFO.currentCell, nextCell);
    MAP_INFO.currentCell = nextCell;
  }
  drawEveryCell();
  drawEveryCell();
};

/**
 * @param {number} newSize
 */
export const resetSize = (newSize) => {
  CONFIG.cellHeight = newSize;
  configPolys();
  GRID.flat().map((c) => configCellPos(c));
  setCanvasSize(null, POLY_INFO[CONFIG.polySides].canvasWidth);
  const oldOffsets = {
    xOffset: MAP_INFO.xOffset,
    yOffset: MAP_INFO.yOffset,
    iOffset: MAP_INFO.iOffset,
    jOffset: MAP_INFO.jOffset,
  };
  updateOffsets(getCenterCell(), MAP_INFO.currentCell);
  drawEveryCell();
  Object.assign(MAP_INFO, oldOffsets);
};

start();

const heightSlider = /** @type {HTMLInputElement} */ (
  document.getElementById("cell-height")
);
if (CONFIG.showZoom) {
  heightSlider.value = heightSlider.min = `${CONFIG.cellHeight}`;
  heightSlider.oninput = () => resetSize(+heightSlider.value);
} else {
  heightSlider.style.display = "none";
}

const changePolyBtn = /** @type {HTMLButtonElement} */ (
  document.getElementById("change-poly")
);
changePolyBtn.onclick = changePolySides;
