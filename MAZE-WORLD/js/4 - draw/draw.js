import { getCell } from "../0 - grid/grid.js";
import {
  calculatePointBasedOnPos,
  getPolyInfo,
  MENU_CONFIG,
  RENDER_INFO,
} from "../1 - polygones/index.js";
import { getSelectedCell, updateEntities } from "../2 - entities/index.js";
import { loadAndGetCell } from "../3 - generation/index.js";
import { debounce, getMod, isPointOutside, tweakColor } from "../_utils.js";

import { DRAW_CONFIG } from "./_config.js";
import { blockToWall } from "./_utils.js";
import {
  canvasLayers,
  contextsLayers,
  drawItem,
  drawWall,
  drawWallTop,
  clearCanvas,
  setCanvasSize,
  setFavicon,
  updateConfigs,
} from "./render.js";
import { updateTracks } from "./sounds.js";
import { updateBiomeMap } from "./toolbar/index.js";
import { updateWeather } from "./weather/index.js";
import { updateWidgets } from "./widgets/index.js";

export const resetCanvas = () => {
  const polyInfo = getPolyInfo();
  setCanvasSize(polyInfo.canvasHeight, polyInfo.canvasWidth);
  setFavicon();
};

export const updateCanvasCss = () => {
  updateConfigs();
  updateWeather();
  updateWidgets();
};

let filledThisRound = /** @type {Set<Pos>} */ (new Set());
let tracksCount = /** @type {{ [k: string]: number }} */ ({});

/**
 * @param {Block} block
 */
const addToTrackCount = (block) => {
  if (block?.trackType)
    tracksCount[block.trackType] = (tracksCount[block.trackType] || 0) + 1;
};

/**
 * @param {Entity} baseEntity
 */
export const drawEveryCell = (baseEntity) => {
  wallLayers = [];
  fluids = [];
  filledThisRound = new Set();
  tracksCount = {};

  const offsetCell = baseEntity.cell.pos.j % 2;
  const { rows, columns, shouldIntercalate } = getPolyInfo();
  // More range to encapsulate rotation
  const size = rows + columns;

  for (let i = -columns; i < size; i++) {
    const baseI = i + RENDER_INFO.iOffset;
    for (let j = -rows; j < size; j++) {
      let nI = baseI;
      const nJ = j + RENDER_INFO.jOffset;
      const pos = { i: nI, j: nJ };

      if (shouldIntercalate && offsetCell && nJ % 2 === 0) nI = nI + 1;

      drawCell(loadAndGetCell(pos), contextsLayers[0], baseEntity);
    }
  }

  drawWalls();
  updateEntities();
  tweakFluids();
  updateBiomeMap();
  updateTracks(tracksCount);
};

let wallLayers = /** @type {Wall[][]} */ ([]);
const drawWalls = () => {
  for (let i = 1; i < DRAW_CONFIG.maxLayer; i++) {
    const walls = wallLayers[i];
    clearCanvas(canvasLayers[i]);
    if (!walls) continue;
    walls.forEach((w) => drawWall(w, contextsLayers[i]));
    walls.forEach((w) => drawWallTop(w, contextsLayers[i]));
  }
  wallLayers = [];
};

let fluidInterval = null;
let fluids = /** @type {Drawable[]} */ ([]);
const tweakFluids = debounce(() => {
  clearInterval(fluidInterval);
  if (!fluids.length) return;
  const context = contextsLayers[0];

  fluidInterval = setInterval(() => {
    fluids.forEach((fluid) => {
      drawItem(context, {
        ...fluid,
        color: tweakColor(fluid.color),
      });
    });
  }, DRAW_CONFIG.fluidSpeed);
}, DRAW_CONFIG.fluidSpeed);

/**
 * @param {Cell} cell
 * @param {CanvasRenderingContext2D} context
 * @param {Entity} baseEntity
 */
const drawCell = (cell, context, baseEntity) => {
  const polyInfo = getPolyInfo();
  const isInverted = polyInfo.hasInverted && cell.isInverted;

  const point = calculatePointBasedOnPos(cell.pos, isInverted, baseEntity.cell);

  if (isPointOutside(point, polyInfo.canvasHeight, polyInfo.canvasWidth))
    return;

  const points = isInverted ? polyInfo.invertedPoints : polyInfo.points;
  const aCells = cell.adjacentPos[RENDER_INFO.currentPoly].map(getCell);
  const shoulApplyDark =
    cell !== baseEntity.cell && aCells.every((c) => c !== baseEntity.cell);
  const isSelectedCell =
    MENU_CONFIG.showSelectedCell && cell === getSelectedCell(baseEntity);

  addToTrackCount(cell.wall?.block || cell.block);

  if (cell.wall) {
    const wallLayer = cell.layer + 1;

    const shouldOffset = polyInfo.hasInverted && !cell.isInverted;

    if (!wallLayers[wallLayer]) wallLayers[wallLayer] = [];

    wallLayers[wallLayer].push(
      blockToWall(cell.wall, point, {
        layer: cell.layer,
        isInverted,
        shoulApplyDark,
        isSelectedCell,
        pos: cell.pos,
        borderMap: aCells.reduce((acc, c, i) => {
          let index = i - RENDER_INFO.rotationTurns;
          if (shouldOffset) index = RENDER_INFO.currentPoly - 1 - index;
          acc[getMod(index, RENDER_INFO.currentPoly)] = !c?.wall;
          return acc;
        }, []),
      })
    );

    return;
  }

  // Near fluid cells should take over
  if (!cell.block) {
    const aFluid = aCells.find((c) => c?.block?.isFluid);
    if (aFluid && !filledThisRound.has(aFluid.pos)) {
      filledThisRound.add(cell.pos);
      cell.block = aFluid.block;
      cell.color = aFluid.color;
    }
  }

  const drawable = /** @type {Drawable} */ ({
    point,
    points,
    isInverted,
    pos: cell.pos,
    color: cell.color,
    shoulApplyDark,
    isSelectedCell,
  });

  if (cell.block?.isFluid) fluids.push(drawable);

  drawItem(context, drawable);
};
