import { POLY_INFO, KNOWN_POLYGONS, MAP_INFO } from "./infos.js";
import { CONFIG, CANVAS_CONFIG } from "./configs.js";
import { GRID, loadChunk } from "./grid.js";
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
  canvas.height = height || canvas.height;
  canvas.width = width || canvas.width;
  context.strokeStyle = CANVAS_CONFIG.strokeColor;
  context.lineWidth = Math.round(CONFIG.cellHeight / 20);
};

export const resetCanvasSize = () => {
  setCanvasSize(
    POLY_INFO[CONFIG.polySides].canvasHeight,
    POLY_INFO[CONFIG.polySides].canvasWidth
  );
};

export const drawEveryCell = () => {
  const offsetPolygon =
    CONFIG.polySides > KNOWN_POLYGONS.SQUARE && MAP_INFO.currentCell.pos.j % 2;
  const { rows, columns } = POLY_INFO[CONFIG.polySides];
  for (let i = 0; i < rows; i++) {
    const baseI = i + MAP_INFO.iOffset;
    for (let j = 0; j < columns; j++) {
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

  x += MAP_INFO.xOffset[CONFIG.polySides] || 0;
  y += MAP_INFO.yOffset[CONFIG.polySides] || 0;

  if (x <= 0 || y <= 0 || x >= canvas.width || y > canvas.height) return;

  context.fillStyle = cell.type.isFluid ? tweakColor(cell.color) : cell.color;

  if (cell === MAP_INFO.currentCell)
    context.fillStyle = CANVAS_CONFIG.currentColor;

  drawPolygon(cell, x, y);
};

/**
 * @param {import("./infos.js").Cell} cell
 * @param {number} x
 * @param {number} y
 */
const drawPolygon = (cell, x, y) => {
  const polyInfo = POLY_INFO[CONFIG.polySides];

  if (
    CONFIG.polySides > KNOWN_POLYGONS.SQUARE &&
    (cell.pos.j + MAP_INFO.jOffset) % 2
  )
    y += MAP_INFO.currentCell.pos.j % 2 ? -polyInfo.ySide : polyInfo.ySide;

  if (cell.aboveCell) {
  } else {
    drawPolyCell(x, y, cell, polyInfo);
  }
};

/**
 * @param {number} x
 * @param {number} y
 * @param {import("./infos.js").Cell} cell
 * @param {import("./infos.js").PolyInfoProp} polyInfo
 * @param {boolean} [isAbove]
 */
function drawPolyCell(x, y, cell, polyInfo, isAbove = false) {
  const isInverted = CONFIG.polySides % 2 && cell.isInverted;
  const points = isInverted ? polyInfo.invertedPoints : polyInfo.points;

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

  const shouldApplyDark =
    cell !== MAP_INFO.currentCell &&
    cell.adjacentIndexes[CONFIG.polySides]
      .map(([ai, aj]) => GRID[ai]?.[aj])
      .every((c) => c !== MAP_INFO.currentCell);

  if (shouldApplyDark) {
    context.fillStyle = `rgba(0, 0, 0, ${MAP_INFO.timeOfDay / 100})`;
    fillPolygon(x, y, points);
  }

  if (!isAbove) return;

  // BORDERS
  const borders = points.map(() => true);
  for (let i = 0; i < points.length; i++) {
    if (borders[i]) {
      let point = points[i];
      let nextPoint = points[i + 1] || points[0];

      context.beginPath();
      context.moveTo(x + point.x, y + point.y);
      context.lineTo(x + nextPoint.x, y + nextPoint.y);
      context.stroke();
    }
  }
}

/**
 * @param {number} x
 * @param {number} y
 * @param {import("./infos.js").Points[]} points
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
