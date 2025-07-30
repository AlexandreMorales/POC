import { POLY_INFO } from "../configs/infos.js";
import {
  CONFIG,
  CANVAS_CONFIG,
  MAP_CONFIG,
  MENU_CONFIG,
  GRID,
} from "../configs/configs.js";
import { calculatePointBasedOnPos, getGridCell } from "../grid/grid.js";
import {
  debounce,
  getMod,
  isPointOutsideCanvas,
  tweakColor,
} from "../utils.js";
import { updateEntities } from "../entities/entities.js";
import { MAP_INFO } from "../grid/infos.js";
import { drawItem, drawWall, drawWallTop } from "./utils.js";

const spinContainer = document.getElementById("spin-container");
const container = document.getElementById("draw-container");
const canvasContainer = document.getElementById("canvas-container");

const containers = [spinContainer, container, canvasContainer];

const canvasLayers = /** @type {HTMLCanvasElement[]} */ ([]);
const contextsLayers = /** @type {CanvasRenderingContext2D[]} */ ([]);

for (let i = 0; i < CONFIG.maxLayer; i++) {
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
  const polyInfo = POLY_INFO[MAP_INFO.currentPoly];
  setCanvasSize(polyInfo.canvasHeight, polyInfo.canvasWidth);
};

export const updateCanvasCss = () => {
  if (MENU_CONFIG.usePerspective) {
    canvasContainer.style.transform = "perspective(50px) rotateX(1deg)";
    canvasContainer.style.marginTop = "-70px";
  } else {
    canvasContainer.style.transform = null;
    canvasContainer.style.marginTop = null;
  }
};

let filledThisRound =
  /** @type {Set<import("../configs/infos.js").CellPos>} */ (new Set());

/**
 * @param {import("../configs/infos.js").Cell} baseCell
 */
export const drawEveryCell = (baseCell) => {
  wallLayers = [];
  fluids = [];
  filledThisRound = new Set();

  const offsetCell = baseCell.pos.j % 2;
  const { rows, columns, shouldIntercalate } = POLY_INFO[MAP_INFO.currentPoly];
  // More range to encapsulate rotation
  const size = rows + columns;

  for (let i = -columns; i < size; i++) {
    const baseI = i + MAP_INFO.iOffset;
    for (let j = -rows; j < size; j++) {
      let nI = baseI;
      const nJ = j + MAP_INFO.jOffset;

      if (shouldIntercalate && offsetCell && nJ % 2 === 0) nI = nI + 1;

      drawCell(getGridCell(nI, nJ), contextsLayers[0], baseCell);
    }
  }

  drawWalls();
  updateEntities();
  tweakFluids();
};

let wallLayers = /** @type {Wall[][]} */ ([]);
const drawWalls = () => {
  for (let i = 1; i < CONFIG.maxLayer; i++) {
    const walls = wallLayers[i];
    // reset canvas
    canvasLayers[i].width = POLY_INFO[MAP_INFO.currentPoly].canvasWidth;
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
 * @param {import("../configs/infos.js").Cell} cell
 * @param {CanvasRenderingContext2D} context
 * @param {import("../configs/infos.js").Cell} baseCell
 */
const drawCell = (cell, context, baseCell) => {
  const polyInfo = POLY_INFO[MAP_INFO.currentPoly];
  const isInverted = polyInfo.hasInverted && cell.isInverted;

  const point = calculatePointBasedOnPos(cell.pos, isInverted, baseCell);

  if (isPointOutsideCanvas(point, polyInfo.canvasHeight, polyInfo.canvasWidth))
    return;

  const points = isInverted ? polyInfo.invertedPoints : polyInfo.points;
  const aCells = cell.adjacentPos[MAP_INFO.currentPoly].map(
    ({ i, j }) => GRID[i]?.[j]
  );

  const shoulApplyDark =
    cell !== baseCell && aCells.every((c) => c !== baseCell);

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
        let index = i - MAP_INFO.rotationTurns;
        if (shouldOffset) index = MAP_INFO.currentPoly - 1 - index;
        acc[getMod(index, MAP_INFO.currentPoly)] = !c?.wall;
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
  });

  if (cell.block?.isFluid) fluids.push(drawable);

  drawItem(context, drawable);
};

/**
 * @param {number} deg
 */
export const rotateCanvas = (deg) => {
  updateHtmlEntities((img) => rotateElement(img, -deg));
  rotateElement(container, deg);
  spinContainer.style.background = canvasLayers
    .map((c) => `url(${c.toDataURL()})`)
    .join(", ");
};

export const resetRotateCanvas = () => {
  updateHtmlEntities((img) => rotateElement(img));
  rotateElement(container);
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
 */
const rotateElement = (element, deg) => {
  element.style.transitionDuration = deg
    ? `${MAP_CONFIG.rotateDelay + 6000 / CONFIG.cellHeight}ms`
    : null;
  element.style.transitionProperty = deg ? "transform" : null;
  element.style.transform = deg ? `rotate(${deg}deg)` : null;
};
