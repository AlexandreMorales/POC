import { POLY_INFO, KNOWN_POLYGONS, MAP_INFO } from "./infos.js";
import { CONFIG, CANVAS_CONFIG } from "./configs.js";
import { GRID, loadChunk } from "./grid.js";
import { correctRoundError, getMod, tweakColor } from "./utils.js";

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

export const drawEveryCell = () => {
  MAP_INFO.walls = [];

  const offsetCell = MAP_INFO.currentCell.pos.j % 2;
  const { rows, columns, shouldIntercalate, ySide } =
    POLY_INFO[CONFIG.polySides];

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

  MAP_INFO.walls.forEach(drawWall);
  MAP_INFO.walls.forEach((w) => drawWallRoof(w, ySide));
};

/**
 * @param {import("./infos.js").Wall} wall
 */
export const drawWall = (wall) => {
  context.fillStyle = `rgb(${wall.color.r / CANVAS_CONFIG.wallDarkness}, ${
    wall.color.g / CANVAS_CONFIG.wallDarkness
  }, ${wall.color.b / CANVAS_CONFIG.wallDarkness})`;
  fillPolygon(wall.x, wall.y, wall.points);
  applyDark(wall.x, wall.y, wall.points);
};

/**
 * @param {import("./infos.js").Wall} wall
 * @param {number} ySide
 */
export const drawWallRoof = (wall, ySide) => {
  context.fillStyle = `rgb(${wall.color.r}, ${wall.color.g}, ${wall.color.b})`;
  fillPolygon(wall.x, wall.y - ySide, wall.topPoints);
  applyBorders(wall.x, wall.y - ySide, wall.topPoints, wall.map);
  applyDark(wall.x, wall.y - ySide, wall.topPoints);
};

/**
 * @param {import("./infos.js").Cell} cell
 */
export const drawCell = (cell) => {
  const polyInfo = POLY_INFO[CONFIG.polySides];
  const isInverted = polyInfo.hasInverted && cell.isInverted;
  const points = isInverted ? polyInfo.invertedPoints : polyInfo.points;

  let { i, j } = cell.pos;
  i -= MAP_INFO.iOffset || 0;
  j -= MAP_INFO.jOffset || 0;

  let x = polyInfo.calcX(j);
  let y = polyInfo.calcY(i);

  if (polyInfo.shouldIntercalate && j % 2)
    y += MAP_INFO.currentCell.pos.j % 2 ? -polyInfo.ySide : polyInfo.ySide;

  [x, y] = applyRotation(x, y, isInverted);

  if (x < 0.1 || y < 0.1 || x > canvas.width - 0.1 || y > canvas.height - 0.1)
    return;

  const aCells = cell.adjacentIndexes[CONFIG.polySides].map(
    ([ai, aj]) => GRID[ai]?.[aj]
  );

  // Near fluid cells should take over
  if (!cell.value) {
    const aFluid = aCells.find((c) => c?.block?.isFluid);
    if (aFluid) {
      cell.value = aFluid.value;
      cell.block = aFluid.block;
      cell.color = tweakColor(aFluid.color);
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

    MAP_INFO.walls.push({
      color: cell.wall.color,
      x,
      y,
      points: wallPoints,
      topPoints: points,
      map: aCells.reduce((acc, c, i) => {
        let index = i - MAP_INFO.rotationTurns;
        if (shouldOffset) index = CONFIG.polySides - 1 - index;
        acc[getMod(index, CONFIG.polySides)] = !c.wall;
        return acc;
      }, []),
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

  if (
    cell.value &&
    cell !== MAP_INFO.currentCell &&
    aCells.every((c) => c !== MAP_INFO.currentCell)
  )
    applyDark(x, y, points);
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
 * @param {boolean[]} map
 */
const applyBorders = (x, y, points, map) => {
  for (let i = 0; i < points.length; i++) {
    if (map[i]) {
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
 * @param {number} x
 * @param {number} y
 * @param {boolean} isInverted
 * @returns {number[]}
 */
const applyRotation = (x, y, isInverted) => {
  if (!MAP_INFO.rotationTurns) return [x, y];
  const turns = getMod(MAP_INFO.rotationTurns, CONFIG.polySides);
  if (!turns) return [x, y];

  const { cx, cy, ySide, xSide, hasInverted } = POLY_INFO[CONFIG.polySides];

  const angle = (360 / CONFIG.polySides) * turns;
  const radians = (Math.PI / 180) * angle;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  let nx = correctRoundError(cos * (x - cx) + sin * (y - cy) + cx);
  let ny = correctRoundError(cos * (y - cy) - sin * (x - cx) + cy);

  if (hasInverted && isInverted !== MAP_INFO.currentCell.isInverted && angle) {
    const oddTurn = !!(turns % 2);
    ny += ySide * (MAP_INFO.currentCell.isInverted ? 1 : -1);
    nx += (xSide / 2) * (MAP_INFO.currentCell.isInverted === oddTurn ? -1 : 1);
  }

  return [nx, ny];
};
