import { POLY_INFO, KNOWN_POLYGONS, MAP_INFO, CIRCLE_INFO } from "./infos.js";
import { CONFIG, CANVAS_CONFIG } from "./configs.js";
import { GRID, getRows, getNumCellsPerRow, loadChunk } from "./grid.js";
import { tweakColor } from "./utils.js";

const canvas = /** @type {HTMLCanvasElement} */ (
  document.getElementById("init")
);
const context = canvas.getContext("2d");

/**
 * @param {number} height
 * @param {number} width
 */
export const setCanvasSize = (height, width) => {
  canvas.height = height;
  canvas.width = width;
};

export const resetCanvasSize = () => {
  setCanvasSize(
    POLY_INFO[CONFIG.polySides].canvasHeight,
    POLY_INFO[CONFIG.polySides].canvasWidth
  );
};

export const drawEveryCell = () => {
  const offsetPolygon =
    !CONFIG.isMaze &&
    CONFIG.polySides > KNOWN_POLYGONS.SQUARE &&
    MAP_INFO.currentCell.pos.j % 2;
  const rows = getRows();
  for (let i = 0; i < rows; i++) {
    const numCells = getNumCellsPerRow(i);
    const baseI = i + MAP_INFO.iOffset;
    for (let j = 0; j < numCells; j++) {
      let nI = baseI;
      const nJ = j + MAP_INFO.jOffset;

      if (offsetPolygon && nJ % 2 === 0) nI = nI + 1;

      if (!GRID[nI]?.[nJ]) {
        const [cI, cJ] = getChunkStart(nI, nJ);
        loadChunk(cI, cJ);
      }

      drawCell(GRID[nI][nJ]);
    }
  }
};

/**
 * @param {import("./infos.js").Cell} cell
 */
export const drawCell = (cell) => {
  let { x, y } = cell.dPos[CONFIG.polySides];

  if (!CONFIG.isMaze) {
    x += MAP_INFO.xOffset[CONFIG.polySides] || 0;
    y += MAP_INFO.yOffset[CONFIG.polySides] || 0;
  }

  if (x <= 0 || y <= 0 || x >= canvas.width || y > canvas.height) return;

  if (CONFIG.isMaze) {
    context.fillStyle = CANVAS_CONFIG.defaultColor;

    if (cell.visited) context.fillStyle = CANVAS_CONFIG.visitedColor;
    if (cell.path) context.fillStyle = CANVAS_CONFIG.pathColor;
  } else {
    context.fillStyle = cell.type.isFluid ? tweakColor(cell.color) : cell.color;
  }

  if (cell === MAP_INFO.currentCell)
    context.fillStyle = CANVAS_CONFIG.currentColor;

  if (CONFIG.isCircle) drawCellCircle(cell);
  else drawPolygon(cell, x, y);
};

/**
 * @param {import("./infos.js").Cell} cell
 * @param {number} x
 * @param {number} y
 */
const drawPolygon = (cell, x, y) => {
  const isInverted = CONFIG.polySides % 2 && cell.isInverted;
  const polyInfo = POLY_INFO[CONFIG.polySides];
  const points = isInverted ? polyInfo.invertedPoints : polyInfo.points;

  if (
    CONFIG.polySides > KNOWN_POLYGONS.SQUARE &&
    (cell.pos.j + MAP_INFO.jOffset) % 2
  )
    y +=
      !CONFIG.isMaze && MAP_INFO.currentCell.pos.j % 2
        ? -polyInfo.ySide
        : polyInfo.ySide;

  fillPolygon(x, y, points);

  if (CANVAS_CONFIG.showPos) {
    context.fillStyle = "black";
    context.font = `bold ${CONFIG.cellHeight / 5}px Arial`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(
      `${cell.pos.i},${cell.pos.j}`,
      x,
      isInverted ? y + polyInfo.ySide / 2 : y
    );
  }

  if (!CONFIG.isMaze) {
    const shouldApplyDark =
      cell !== MAP_INFO.currentCell &&
      cell.adjacentIndexes[CONFIG.polySides]
        .map(([ai, aj]) => GRID[ai]?.[aj])
        .every((c) => c !== MAP_INFO.currentCell);

    if (shouldApplyDark) {
      context.fillStyle = `rgba(0, 0, 0, ${MAP_INFO.timeOfDay / 100})`;
      fillPolygon(x, y, points);
    }
    return;
  }

  // BORDERS
  context.strokeStyle = CANVAS_CONFIG.strokeColor;
  context.lineWidth = CANVAS_CONFIG.border;

  for (let i = 0; i < CONFIG.polySides; i++) {
    if (cell.borders[i]) {
      let point = points[i];
      let nextPoint = points[i + 1];

      context.beginPath();
      context.moveTo(x + point.x, y + point.y);
      context.lineTo(x + nextPoint.x, y + nextPoint.y);
      context.stroke();
    }
  }
};

/**
 * @param {number} x
 * @param {number} y
 * @param {{ x: number, y: number }[]} points
 */
const fillPolygon = (x, y, points) => {
  context.beginPath();

  for (let i = 0; i < CONFIG.polySides; i++) {
    context.lineTo(x + points[i].x, y + points[i].y);
  }

  context.closePath();
  context.fill();
};

/**
 * @param {number} n
 * @param {number} range
 */
const getRange = (n, range) => Math.floor(n / range) * range;

/**
 * @param {number} i
 * @param {number} j
 */
const getChunkStart = (i, j) => [
  getRange(i, CONFIG.initialRows),
  getRange(j, CONFIG.initialColumns),
];

/**
 * @param {import("./infos.js").Cell} cell
 */
const drawCellCircle = (cell) => {
  const { x, y } = cell.dPos[CONFIG.polySides];
  const {
    radius,
    downCellRadius,
    x1,
    y1,
    x2,
    y2,
    beginTopAngle,
    endTopAngle,
    downCellX,
    downCellY,
    beginBottomAngle,
    endBottomAngle,
  } = cell.pos;

  // FILL
  context.beginPath();
  context.moveTo(x, y);

  context.arc(
    CIRCLE_INFO.centerX,
    CIRCLE_INFO.centerY,
    radius,
    beginTopAngle,
    endTopAngle
  );
  context.lineTo(downCellX, downCellY);
  context.arc(
    CIRCLE_INFO.centerX,
    CIRCLE_INFO.centerY,
    downCellRadius,
    beginBottomAngle,
    endBottomAngle,
    true
  );
  context.lineTo(x, y);

  context.closePath();
  context.fill();

  // BORDERS
  context.strokeStyle = CANVAS_CONFIG.strokeColor;
  context.lineWidth = CANVAS_CONFIG.border;

  if (cell.borders[0]) {
    context.beginPath();
    context.moveTo(x, y);
    context.arc(
      CIRCLE_INFO.centerX,
      CIRCLE_INFO.centerY,
      radius,
      beginTopAngle,
      endTopAngle
    );
    context.stroke();
  }

  if (cell.borders[1]) {
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(downCellX, downCellY);
    context.stroke();
  }

  if (cell.borders[2]) {
    context.beginPath();
    context.moveTo(downCellX, downCellY);
    context.arc(
      CIRCLE_INFO.centerX,
      CIRCLE_INFO.centerY,
      downCellRadius,
      beginBottomAngle,
      endBottomAngle,
      true
    );
    context.stroke();
  }

  if (cell.borders[3]) {
    context.beginPath();
    context.moveTo(x2, y2);
    context.lineTo(x, y);
    context.stroke();
  }
};