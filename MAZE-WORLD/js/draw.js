import { POLY_INFO, MAP_INFO } from "./infos.js";
import { CONFIG, CANVAS_CONFIG } from "./configs.js";
import { GRID, calculatePointBasedOnPos, loadChunk } from "./grid.js";
import { getMod, tweakColor } from "./utils.js";

const canvas = /** @type {HTMLCanvasElement} */ (
  document.getElementById("init")
);
const context = canvas.getContext("2d");

/**
 * @param {number} height
 * @param {number} width
 */
export const setCanvasSize = (height, width) => {
  canvas.height = height || canvas.height;
  canvas.width = width || canvas.width;
  context.strokeStyle = CANVAS_CONFIG.strokeColor;
  context.lineWidth = 1;
};

export const resetCanvasSize = () => {
  setCanvasSize(
    POLY_INFO[CONFIG.polySides].canvasHeight,
    POLY_INFO[CONFIG.polySides].canvasWidth
  );
};

let walls = /** @type {import("./infos.js").Wall[]} */ ([]);
export const drawEveryCell = () => {
  walls = [];

  const offsetCell = MAP_INFO.currentCell.pos.j % 2;
  const { rows, columns, shouldIntercalate } = POLY_INFO[CONFIG.polySides];

  // More range to encapsulate rotation
  for (let i = -columns; i < rows + columns; i++) {
    const baseI = i + MAP_INFO.iOffset;
    for (let j = -rows; j < rows + columns; j++) {
      let nI = baseI;
      const nJ = j + MAP_INFO.jOffset;

      if (shouldIntercalate && offsetCell && nJ % 2 === 0) nI = nI + 1;

      if (!GRID[nI]?.[nJ]) loadChunk(nI, nJ);

      drawCell(GRID[nI][nJ]);
    }
  }

  walls.forEach(drawWall);
  walls.forEach(drawWallTop);
  walls = [];
};

/**
 * @param {import("./infos.js").Wall} wall
 */
export const drawWall = (wall) => {
  context.fillStyle = `rgb(${wall.color.r / CANVAS_CONFIG.wallDarkness}, ${
    wall.color.g / CANVAS_CONFIG.wallDarkness
  }, ${wall.color.b / CANVAS_CONFIG.wallDarkness})`;
  fillPolygon(wall.point, wall.points);
  applyDark(wall.point, wall.points);
};

/**
 * @param {import("./infos.js").Wall} wall
 */
export const drawWallTop = (wall) => {
  context.fillStyle = `rgb(${wall.color.r}, ${wall.color.g}, ${wall.color.b})`;
  fillPolygon(wall.topPoint, wall.topPoints);
  applyBorders(wall.topPoint, wall.topPoints, wall.borderMap);
  applyDark(wall.topPoint, wall.topPoints);
};

/**
 * @param {import("./infos.js").Cell} cell
 */
export const drawCell = (cell) => {
  const polyInfo = POLY_INFO[CONFIG.polySides];
  const isInverted = polyInfo.hasInverted && cell.isInverted;

  const point = calculatePointBasedOnPos(cell.pos, isInverted);

  if (
    point.x < 0.1 ||
    point.y < 0.1 ||
    point.x > canvas.width - 0.1 ||
    point.y > canvas.height - 0.1
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
    context.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;

    if (cell === MAP_INFO.currentCell)
      context.fillStyle = CANVAS_CONFIG.currentColor;
  } else {
    context.fillStyle = "black";
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
    });

    return;
  }

  fillPolygon(point, points);

  if (CANVAS_CONFIG.showPos) {
    context.fillStyle = "black";
    context.font = `bold ${CONFIG.cellHeight / 5}px Arial`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(
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
    applyDark(point, points);
};

/**
 * @param {import("./infos.js").Point} point
 * @param {import("./infos.js").Point[]} points
 */
const applyDark = (point, points) => {
  if (!MAP_INFO.timeOfDay) return;
  context.fillStyle = `rgba(0, 0, 0, ${MAP_INFO.timeOfDay / 100})`;
  fillPolygon(point, points);
};

/**
 * @param {import("./infos.js").Point} point
 * @param {import("./infos.js").Point[]} points
 */
const fillPolygon = ({ x, y }, points) => {
  context.beginPath();

  for (let i = 0; i < points.length; i++) {
    context.lineTo(x + points[i].x, y + points[i].y);
  }

  context.closePath();
  context.fill();
};

/**
 * @param {import("./infos.js").Point} point
 * @param {import("./infos.js").Point[]} points
 * @param {boolean[]} [map]
 */
const applyBorders = ({ x, y }, points, map) => {
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
