import { POLY_INFO, KNOWN_POLYGONS, MAP_INFO } from "./infos.js";
import { CONFIG, CANVAS_CONFIG } from "./configs.js";
import { GRID, loadChunk } from "./grid.js";
import { correctRoundError, getRotationIndex, tweakColor } from "./utils.js";

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
  MAP_INFO.walls = [];

  const shouldIntercalate = CONFIG.polySides > KNOWN_POLYGONS.SQUARE;
  const offsetCell = MAP_INFO.currentCell.pos.j % 2;
  const { rows, columns, ySide } = POLY_INFO[CONFIG.polySides];

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

  // Draw wall of wall
  for (let i = 0; i < MAP_INFO.walls.length; i++) {
    const wall = MAP_INFO.walls[i];
    context.fillStyle = `rgb(${wall.color.r / CANVAS_CONFIG.wallDarkness}, ${
      wall.color.g / CANVAS_CONFIG.wallDarkness
    }, ${wall.color.b / CANVAS_CONFIG.wallDarkness})`;
    fillPolygon(wall.x, wall.y, wall.points);
    applyBorders(wall.x, wall.y, wall.points);
    applyDark(wall.x, wall.y, wall.points);
  }

  // Draw roof of wall
  for (let i = 0; i < MAP_INFO.walls.length; i++) {
    const wall = MAP_INFO.walls[i];
    context.fillStyle = `rgb(${wall.color.r}, ${wall.color.g}, ${wall.color.b})`;
    fillPolygon(wall.x, wall.y - ySide, wall.topPoints);
    applyBorders(wall.x, wall.y - ySide, wall.topPoints);
    applyDark(wall.x, wall.y - ySide, wall.topPoints);
  }
};

/**
 * @param {import("./infos.js").Cell} cell
 */
export const drawCell = (cell) => {
  let { x, y } = cell.dPos[CONFIG.polySides];
  const polyInfo = POLY_INFO[CONFIG.polySides];
  const isInverted = CONFIG.polySides % 2 && cell.isInverted;
  const points = isInverted ? polyInfo.invertedPoints : polyInfo.points;
  const shouldIntercalate = CONFIG.polySides > KNOWN_POLYGONS.SQUARE;

  x += MAP_INFO.xOffset[CONFIG.polySides] || 0;
  y += MAP_INFO.yOffset[CONFIG.polySides] || 0;

  if (shouldIntercalate && (cell.pos.j + MAP_INFO.jOffset) % 2)
    y += MAP_INFO.currentCell.pos.j % 2 ? -polyInfo.ySide : polyInfo.ySide;

  [x, y] = applyRotation(x, y, isInverted);

  if (x < 0.1 || y < 0.1 || x > canvas.width - 0.1 || y > canvas.height - 0.1)
    return;

  const color = cell.block.isFluid ? tweakColor(cell.color) : cell.color;
  context.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;

  if (cell === MAP_INFO.currentCell)
    context.fillStyle = CANVAS_CONFIG.currentColor;

  if (cell.wall) {
    const wallPoints = isInverted
      ? polyInfo.wallInvertedPoints
      : polyInfo.wallPoints;

    MAP_INFO.walls.push({
      color: cell.wall.color,
      x,
      y,
      points: wallPoints,
      topPoints: points,
    });

    return;
  }

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

  if (shouldApplyDark) applyDark(x, y, points);
};

/**
 * @param {number} x
 * @param {number} y
 * @param {import("./infos.js").Points[]} points
 */
const applyDark = (x, y, points) => {
  context.fillStyle = `rgba(0, 0, 0, ${MAP_INFO.timeOfDay / 100})`;
  fillPolygon(x, y, points);
};

/**
 * @param {number} x
 * @param {number} y
 * @param {import("./infos.js").Points[]} points
 */
const fillPolygon = (x, y, points) => {
  context.beginPath();

  for (let i = 0; i < points.length; i++) {
    context.lineTo(x + points[i].x, y + points[i].y);
  }

  context.closePath();
  context.fill();
};

/**
 * @param {number} x
 * @param {number} y
 * @param {import("./infos.js").Points[]} points
 */
const applyBorders = (x, y, points) => {
  for (let i = 0; i < points.length; i++) {
    let point = points[i];
    let nextPoint = points[i + 1] || points[0];

    context.beginPath();
    context.moveTo(x + point.x, y + point.y);
    context.lineTo(x + nextPoint.x, y + nextPoint.y);
    context.stroke();
  }
};

/**
 * @param {number} x
 * @param {number} y
 * @param {boolean} isInverted
 * @returns {number[]}
 */
const applyRotation = (x, y, isInverted) => {
  if (!MAP_INFO.rotationTurns || !CONFIG.useRotation) return [x, y];
  const polyInfo = POLY_INFO[CONFIG.polySides];

  const turns = getRotationIndex(MAP_INFO.rotationTurns, CONFIG.polySides);
  const angle = (360 / CONFIG.polySides) * turns;
  const cx =
    MAP_INFO.currentCell.dPos[CONFIG.polySides].x +
    (MAP_INFO.xOffset[CONFIG.polySides] || 0);
  const cy =
    MAP_INFO.currentCell.dPos[CONFIG.polySides].y +
    (MAP_INFO.yOffset[CONFIG.polySides] || 0);

  const radians = (Math.PI / 180) * angle;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  let nx = correctRoundError(cos * (x - cx) + sin * (y - cy) + cx);
  let ny = correctRoundError(cos * (y - cy) - sin * (x - cx) + cy);

  if (
    CONFIG.polySides % 2 &&
    isInverted !== MAP_INFO.currentCell.isInverted &&
    angle
  ) {
    const oddTurn = !!(turns % 2);
    ny += polyInfo.ySide * (MAP_INFO.currentCell.isInverted ? 1 : -1);
    nx +=
      (polyInfo.xSide / 2) *
      (MAP_INFO.currentCell.isInverted === oddTurn ? -1 : 1);
  }

  return [nx, ny];
};
