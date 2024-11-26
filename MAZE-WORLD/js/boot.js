import { BIOMES } from "./biomes.js";
import { CONFIG } from "./configs.js";
import { resetCanvasSize, drawEveryCell, setCanvasSize } from "./draw.js";
import { loadChunk, GRID, configCellPos } from "./grid.js";
import { KNOWN_POLYGONS, MAP_INFO, POLY_INFO, knownPolys } from "./infos.js";
import { getCenterCell, cellIsBlocked, updateOffsets } from "./movement.js";
import { correctRoundError } from "./utils.js";

const configPolys = () => {
  for (const p of knownPolys) {
    POLY_INFO[p] = configPoly(p);
  }
};

/**
 * @param {import("./infos.js").Points[]} points
 * @param {number} height
 * @returns {import("./infos.js").Points[]}
 */
const createWallPoints = (points, height) => {
  let bottomPoints = points.filter((p) => p.y >= 0);
  if (bottomPoints.length <= 1) bottomPoints = points.sort((a, b) => a.x - b.x);
  const firstBottomPoint = bottomPoints[0];
  const lastBottomPoint = bottomPoints[bottomPoints.length - 1];
  return [
    { x: firstBottomPoint.x, y: firstBottomPoint.y - height },
    ...bottomPoints,
    { x: lastBottomPoint.x, y: lastBottomPoint.y - height },
  ];
};

/**
 * @param {number} polySides
 * @returns {import("./infos.js").PolyInfoProp}
 */
const configPoly = (polySides) => {
  let radiusFromSide = 0;
  let radiusFromCorner = 0;
  /**
   * The length of the side of the polygon
   */
  let polySide = 0;
  const isOddPoly = polySides % 2;

  const ySide = correctRoundError(CONFIG.cellHeight / 2);

  if (isOddPoly) {
    // Pythagoras of (height² + (side/2)² = side²)
    polySide = correctRoundError(
      Math.sqrt(CONFIG.cellHeight ** 2 / (1 - 1 / 4))
    );
    // (1/2)a cot(π/n);
    radiusFromSide = correctRoundError(
      (polySide / 2) * (1 / Math.tan(Math.PI / polySides))
    );
  } else {
    radiusFromSide = ySide;
    // 2r tan(π/n)
    polySide = correctRoundError(
      2 * radiusFromSide * Math.tan(Math.PI / polySides)
    );
  }

  // (r sec(π/n))
  radiusFromCorner = correctRoundError(
    radiusFromSide * (1 / Math.cos(Math.PI / polySides))
  );

  const shouldIntercalate = polySides > KNOWN_POLYGONS.SQUARE;

  const yCoeficient = isOddPoly ? correctRoundError(-CONFIG.cellHeight / 6) : 0;
  const coeficient = (polySides / 2 + 1) / 2;
  const points = [];

  const sideRad = (2 * Math.PI) / polySides;

  for (let i = 0; i < polySides; i++) {
    const nI = i - coeficient;
    const rad = sideRad * nI;
    const x = correctRoundError(radiusFromCorner * Math.cos(rad));
    const y = correctRoundError(
      radiusFromCorner * Math.sin(rad) + yCoeficient,
      1
    );
    points.push({ x, y });
  }

  const xSide = points.reduce((acc, { x }) => (x > acc ? x : acc), 0);
  const invertedPoints = points.map((p) => ({ x: -p.x, y: -p.y }));
  const wallPoints = createWallPoints(points, ySide);
  const wallInvertedPoints = createWallPoints(invertedPoints, ySide);

  /**
   * Length the upper right point x to the rightmost point x
   */
  const slopSide = correctRoundError(
    Math.sqrt(Math.abs(polySide ** 2 - radiusFromSide ** 2))
  );

  let rows = CONFIG.initialRows;
  let columns = CONFIG.initialColumns;
  let canvasHeight = window.innerHeight;
  let canvasWidth = window.innerWidth;

  rows = canvasHeight;
  if (shouldIntercalate) rows -= ySide;
  rows = rows / CONFIG.cellHeight;

  columns = canvasWidth / (xSide * 2);

  if (isOddPoly) columns = ((canvasWidth - 2) * 2 - polySide) / polySide;

  if (shouldIntercalate) {
    columns =
      ((canvasWidth - slopSide) * 2) / (radiusFromCorner * 2 + polySide);
  }

  rows = Math.floor(rows);
  columns = Math.floor(columns);

  if (rows % 2 === 0) rows -= 1;
  if (columns % 2 === 0) columns -= 1;
  // When itercalating the first and last column should be an up column
  if (shouldIntercalate && ((columns + 1) / 2) % 2 === 0) columns -= 2;

  canvasHeight = rows * CONFIG.cellHeight;
  // To always have the same height because of the shouldIntercalate polys
  canvasHeight += ySide;

  canvasWidth = columns * (xSide * 2);

  if (isOddPoly) canvasWidth = (columns * polySide) / 2 + polySide / 2 + 2;

  if (shouldIntercalate)
    canvasWidth = (columns * (radiusFromCorner * 2 + polySide)) / 2 + slopSide;

  return {
    polySide,
    xSide,
    ySide,
    points,
    invertedPoints,
    wallPoints,
    wallInvertedPoints,
    rows: Math.round(rows),
    columns: Math.round(columns),
    canvasHeight: Math.round(canvasHeight),
    canvasWidth: Math.round(canvasWidth),
  };
};

export const start = () => {
  configPolys();
  resetCanvasSize();

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
