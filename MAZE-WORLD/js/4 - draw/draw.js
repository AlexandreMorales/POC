import {
  calculatePointBasedOnPos,
  getPolyInfo,
  MENU_CONFIG,
  POLY_INFO,
} from "../1 - polygones/index.js";
import { getSelectedCell, updateEntities } from "../2 - entities/index.js";
import { getGridCell } from "../3 - generation/index.js";
import {
  debounce,
  getMod,
  isPointOutsideCanvas,
  tweakColor,
} from "../utils.js";

import { drawItem, drawWall, drawWallTop } from "./utils.js";

const CANVAS_CONFIG = {
  fluidSpeed: 500,
  maxLayer: 2,
};

const spinContainer = document.getElementById("spin-container");
const container = document.getElementById("draw-container");
const canvasContainer = document.getElementById("canvas-container");

const containers = [spinContainer, container, canvasContainer];

const canvasLayers = /** @type {HTMLCanvasElement[]} */ ([]);
const contextsLayers = /** @type {CanvasRenderingContext2D[]} */ ([]);

for (let i = 0; i < CANVAS_CONFIG.maxLayer; i++) {
  const canvas = document.createElement("canvas");
  canvas.style.zIndex = `${i}`;
  canvasContainer.appendChild(canvas);
  canvasLayers.push(canvas);
  contextsLayers.push(canvas.getContext("2d"));
}

/**
 * @param {number} height
 * @param {number} width
 */
export const setCanvasSize = (height, width) => {
  if (height) {
    containers.forEach((c) => (c.style.height = `${height}px`));
    canvasLayers.forEach((canvas) => (canvas.height = height));
  }
  if (width) {
    containers.forEach((c) => (c.style.width = `${width}px`));
    canvasLayers.forEach((canvas) => (canvas.width = width));
  }
};

export const resetCanvasSize = () => {
  const polyInfo = getPolyInfo();
  setCanvasSize(polyInfo.canvasHeight, polyInfo.canvasWidth);
};

export const updateCanvasCss = () => {
  if (MENU_CONFIG.usePerspective) {
    canvasContainer.style.transform = "perspective(50px) rotateX(1deg)";
    canvasContainer.style.marginTop = "-70px";
    return;
  }

  canvasContainer.style.transform = null;
  canvasContainer.style.marginTop = null;
};

let filledThisRound = /** @type {Set<Pos>} */ (new Set());

/**
 * @param {Cell} baseCell
 */
export const drawEveryCell = (baseCell) => {
  wallLayers = [];
  fluids = [];
  filledThisRound = new Set();

  const offsetCell = baseCell.pos.j % 2;
  const { rows, columns, shouldIntercalate } = getPolyInfo();
  // More range to encapsulate rotation
  const size = rows + columns;

  for (let i = -columns; i < size; i++) {
    const baseI = i + POLY_INFO.iOffset;
    for (let j = -rows; j < size; j++) {
      let nI = baseI;
      const nJ = j + POLY_INFO.jOffset;
      const pos = { i: nI, j: nJ };

      if (shouldIntercalate && offsetCell && nJ % 2 === 0) nI = nI + 1;

      drawCell(getGridCell(pos), contextsLayers[0], baseCell);
    }
  }

  drawWalls();
  updateEntities();
  tweakFluids();
};

let wallLayers = /** @type {Wall[][]} */ ([]);
const drawWalls = () => {
  for (let i = 1; i < CANVAS_CONFIG.maxLayer; i++) {
    const walls = wallLayers[i];
    // reset canvas
    canvasLayers[i].width = getPolyInfo().canvasWidth;
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
  }, CANVAS_CONFIG.fluidSpeed);
}, CANVAS_CONFIG.fluidSpeed);

/**
 * @param {Cell} cell
 * @param {CanvasRenderingContext2D} context
 * @param {Cell} baseCell
 */
const drawCell = (cell, context, baseCell) => {
  const polyInfo = getPolyInfo();
  const isInverted = polyInfo.hasInverted && cell.isInverted;

  const point = calculatePointBasedOnPos(cell.pos, isInverted, baseCell);

  if (isPointOutsideCanvas(point, polyInfo.canvasHeight, polyInfo.canvasWidth))
    return;

  const points = isInverted ? polyInfo.invertedPoints : polyInfo.points;
  const aCells = cell.adjacentPos[POLY_INFO.currentPoly].map(getGridCell);
  const shoulApplyDark =
    cell !== baseCell && aCells.every((c) => c !== baseCell);
  const isSelectedCell =
    MENU_CONFIG.showSelectedCell && cell === getSelectedCell();

  if (cell.wall) {
    const wallPoints = isInverted
      ? polyInfo.wallInvertedPoints
      : polyInfo.wallPoints;
    const wallLayer = cell.layer + 1;

    const shouldOffset = polyInfo.hasInverted && !cell.isInverted;

    if (!wallLayers[wallLayer]) wallLayers[wallLayer] = [];
    const commonInfos = {
      shoulApplyDark,
      color: cell.wall.color,
      pos: cell.pos,
      isInverted,
      isSelectedCell,
    };

    wallLayers[wallLayer].push({
      ...commonInfos,
      point: { x: point.x, y: point.y - polyInfo.ySide * cell.layer },
      points: wallPoints,
      topInfo: {
        ...commonInfos,
        point: { x: point.x, y: point.y - polyInfo.ySide * wallLayer },
        points,
      },
      borderMap: aCells.reduce((acc, c, i) => {
        let index = i - POLY_INFO.rotationTurns;
        if (shouldOffset) index = POLY_INFO.currentPoly - 1 - index;
        acc[getMod(index, POLY_INFO.currentPoly)] = !c?.wall;
        return acc;
      }, []),
    });

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

/**
 * @param {number} deg
 * @param {number} rotateDelay
 */
export const rotateCanvas = (deg, rotateDelay) => {
  updateHtmlEntities((img) => rotateElement(img, -deg, rotateDelay));
  rotateElement(
    container,
    deg,
    rotateDelay,
    MENU_CONFIG.rotationAnimationWithZoom
  );
  if (!MENU_CONFIG.rotationAnimationWithZoom)
    spinContainer.style.background = canvasLayers
      .map((c) => `url(${c.toDataURL()})`)
      .join(", ");
};

export const resetRotateCanvas = () => {
  updateHtmlEntities((img) => rotateElement(img));
  rotateElement(container);
  if (!MENU_CONFIG.rotationAnimationWithZoom)
    spinContainer.style.background = null;
};

/**
 * @param {(entity: HTMLElement) => void} callback
 */
const updateHtmlEntities = (callback) => {
  const entities = /** @type {HTMLElement[]} */ ([
    ...document.getElementById("entities").childNodes,
  ]);

  entities.forEach((entity) => {
    if (entity.style) callback(entity);
  });
};

/**
 * @param {HTMLElement} element
 * @param {number} [deg]
 * @param {number} [rotateDelay]
 * @param {boolean} [zoomIn]
 */
const rotateElement = (element, deg, rotateDelay, zoomIn) => {
  element.style.transitionDuration = `${rotateDelay}ms`;
  element.style.transitionProperty = deg ? "transform, scale" : "scale";

  element.style.scale = deg && zoomIn ? `2.5` : null;
  element.style.transform = deg ? `rotate(${deg}deg)` : null;
};
