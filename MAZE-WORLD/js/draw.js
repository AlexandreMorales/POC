import { POLY_INFO, MAP_INFO } from "./infos.js";
import { CONFIG, CANVAS_CONFIG } from "./configs.js";
import { GRID, calculatePointBasedOnPos, loadChunk } from "./grid.js";
import { getMod, tweakColor } from "./utils.js";
import { verifyPlayerHeight } from "./entities.js";

const container = document.getElementById("draw-container");
const canvasGround = /** @type {HTMLCanvasElement} */ (
  document.getElementById("canvas-ground")
);
const canvasWall = /** @type {HTMLCanvasElement} */ (
  document.getElementById("canvas-wall")
);
const contextGround = canvasGround.getContext("2d");
const contextWall = canvasWall.getContext("2d");

/**
 * @param {number} height
 * @param {number} width
 */
export const setCanvasSize = (height, width) => {
  if (height) {
    container.style.height = `${height}px`;
    canvasGround.height = canvasWall.height = height;
  }
  if (width) {
    container.style.width = `${width}px`;
    canvasGround.width = canvasWall.width = width;
  }
};

export const resetCanvasSize = () => {
  const polyInfo = POLY_INFO[CONFIG.polySides];
  setCanvasSize(polyInfo.canvasHeight, polyInfo.canvasWidth);
};

const resetWallCanvas = () => {
  canvasWall.width = POLY_INFO[CONFIG.polySides].canvasWidth;
};

let walls = /** @type {import("./infos.js").Wall[]} */ ([]);
export const drawEveryCell = () => {
  walls = [];

  const offsetCell = MAP_INFO.currentCell.pos.j % 2;
  const { rows, columns, shouldIntercalate } = POLY_INFO[CONFIG.polySides];
  const selectedCellPos =
    MAP_INFO.currentCell.adjacentPos[CONFIG.polySides][
      MAP_INFO.selectedCellIndex
    ];

  // More range to encapsulate rotation
  for (let i = -columns; i < rows + columns; i++) {
    const baseI = i + MAP_INFO.iOffset;
    for (let j = -rows; j < rows + columns; j++) {
      let nI = baseI;
      const nJ = j + MAP_INFO.jOffset;

      if (shouldIntercalate && offsetCell && nJ % 2 === 0) nI = nI + 1;

      if (!GRID[nI]?.[nJ]) loadChunk(nI, nJ);

      drawCell(
        GRID[nI][nJ],
        selectedCellPos.i === nI && selectedCellPos.j === nJ
      );
    }
  }

  drawWalls();
  verifyPlayerHeight();
};

const drawWalls = () => {
  resetWallCanvas();
  walls.forEach(drawWall);
  walls.forEach(drawWallTop);
  walls = [];
};

/**
 * @param {import("./infos.js").Wall} wall
 */
const drawWall = (wall) => {
  // Only draw if there is a gap, if is sorrounded by walls it doesnt need
  if (wall.borderMap.find((b) => !!b)) {
    contextWall.fillStyle = colorToRGB(
      wall.color,
      wall.isSelectedCell
        ? CANVAS_CONFIG.selectedWallBrightness
        : CANVAS_CONFIG.wallDarkness
    );
    fillPolygon(contextWall, wall.point, wall.points);
    applyDark(contextWall, wall.point, wall.points);
  }
};

/**
 * @param {import("./infos.js").Wall} wall
 */
const drawWallTop = (wall) => {
  contextWall.fillStyle = colorToRGB(wall.color);
  fillPolygon(contextWall, wall.topPoint, wall.topPoints);
  contextWall.strokeStyle = wall.isSelectedCell
    ? CANVAS_CONFIG.selectedStrokeColor
    : CANVAS_CONFIG.strokeColor;
  contextWall.lineWidth = wall.isSelectedCell
    ? CANVAS_CONFIG.selectedLineWidth
    : CANVAS_CONFIG.lineWidth;
  applyBorders(
    contextWall,
    wall.topPoint,
    wall.topPoints,
    wall.isSelectedCell ? null : wall.borderMap
  );
  applyDark(contextWall, wall.topPoint, wall.topPoints);
};

/**
 * @param {import("./infos.js").Cell} cell
 * @param {boolean} [isSelectedCell]
 */
const drawCell = (cell, isSelectedCell) => {
  const polyInfo = POLY_INFO[CONFIG.polySides];
  const isInverted = polyInfo.hasInverted && cell.isInverted;

  const point = calculatePointBasedOnPos(cell.pos, isInverted);

  if (
    point.x < 1 ||
    point.y < 1 ||
    point.x > polyInfo.canvasWidth - 1 ||
    point.y > polyInfo.canvasHeight - 1
  )
    return;

  const points = isInverted ? polyInfo.invertedPoints : polyInfo.points;
  const aCells = cell.adjacentPos[CONFIG.polySides].map(
    ({ i, j }) => GRID[i]?.[j]
  );

  // Near fluid cells should take over
  if (!cell.value) {
    const aFluid = aCells.find((c) => c?.block?.isFluid);
    if (aFluid) {
      cell.value = aFluid.value;
      cell.block = aFluid.block;
      cell.color = aFluid.color;
    }
  }

  if (cell.value) {
    const color = cell.block.isFluid ? tweakColor(cell.color) : cell.color;
    contextGround.fillStyle = colorToRGB(color);
  } else {
    contextGround.fillStyle = "black";
  }

  if (cell.wall) {
    const wallPoints = isInverted
      ? polyInfo.wallInvertedPoints
      : polyInfo.wallPoints;

    const shouldOffset = polyInfo.hasInverted && !cell.isInverted;

    walls.push({
      color: cell.wall.color,
      point,
      topPoint: { x: point.x, y: point.y - polyInfo.ySide },
      points: wallPoints,
      topPoints: points,
      borderMap: aCells.reduce((acc, c, i) => {
        let index = i - MAP_INFO.rotationTurns;
        if (shouldOffset) index = CONFIG.polySides - 1 - index;
        acc[getMod(index, CONFIG.polySides)] = !c.wall;
        return acc;
      }, []),
      isSelectedCell,
    });

    return;
  }

  fillPolygon(contextGround, point, points);

  if (CANVAS_CONFIG.showPos) {
    contextGround.fillStyle = "black";
    contextGround.font = `bold ${CONFIG.cellHeight / 5}px Arial`;
    contextGround.textAlign = "center";
    contextGround.textBaseline = "middle";
    contextGround.fillText(
      `${cell.pos.i},${cell.pos.j}`,
      point.x,
      isInverted ? point.y + polyInfo.ySide / 2 : point.y
    );
  }

  if (
    cell.value &&
    cell !== MAP_INFO.currentCell &&
    aCells.every((c) => c !== MAP_INFO.currentCell)
  )
    applyDark(contextGround, point, points);

  if (isSelectedCell) {
    contextGround.strokeStyle = CANVAS_CONFIG.selectedStrokeColor;
    contextGround.lineWidth = CANVAS_CONFIG.selectedLineWidth;
    applyBorders(contextGround, point, points);
  }
};

/**
 * @param {CanvasRenderingContext2D} context
 * @param {import("./infos.js").Point} point
 * @param {import("./infos.js").Point[]} points
 */
const applyDark = (context, point, points) => {
  if (!MAP_INFO.timeOfDay) return;
  context.fillStyle = `rgba(0, 0, 0, ${MAP_INFO.timeOfDay / 100})`;
  fillPolygon(context, point, points);
};

/**
 * @param {CanvasRenderingContext2D} context
 * @param {import("./infos.js").Point} point
 * @param {import("./infos.js").Point[]} points
 */
const fillPolygon = (context, { x, y }, points) => {
  context.beginPath();

  for (const point of points) {
    context.lineTo(x + point.x, y + point.y);
  }

  context.closePath();
  context.fill();
};

/**
 * @param {CanvasRenderingContext2D} context
 * @param {import("./infos.js").Point} point
 * @param {import("./infos.js").Point[]} points
 * @param {boolean[]} [map]
 */
const applyBorders = (context, { x, y }, points, map) => {
  for (let i = 0; i < points.length; i++) {
    if (!map || map[i]) {
      let point = points[i];
      let nextPoint = points[i + 1] || points[0];

      context.beginPath();
      context.moveTo(x + point.x, y + point.y);
      context.lineTo(x + nextPoint.x, y + nextPoint.y);
      context.stroke();
    }
  }
};

/**
 * @param {import("./biomes").Color} color
 * @param {number} modifier
 * @returns {string}
 */
const colorToRGB = ({ r, g, b }, modifier = 1) => {
  return `rgb(${r * modifier}, ${g * modifier}, ${b * modifier})`;
};
