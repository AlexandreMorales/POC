import { BIOMES } from "./biomes.js";
import { CONFIG } from "./configs.js";
import { resetCanvasSize, drawEveryCell, setCanvasSize } from "./draw.js";
import { loadChunk, GRID } from "./grid.js";
import { KNOWN_POLYGONS, MAP_INFO, POLY_INFO, knownPolys } from "./infos.js";
import { getCenterCell, cellIsBlocked, updateOffsets } from "./movement.js";
import { correctRoundError, debounce } from "./utils.js";

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
 * @param {number} polySide
 * @param {number} xSide
 * @returns {(j: number) => number}
 */
const getXFn = (polySides, polySide, xSide) => {
  switch (polySides) {
    case KNOWN_POLYGONS.TRIANGLE:
      return (j) => j * (polySide / 2) + xSide;

    case KNOWN_POLYGONS.HEXAGON:
      return (j) => j * (xSide + polySide / 2) + xSide;

    case KNOWN_POLYGONS.SQUARE:
    default:
      return (j) => j * xSide * 2 + xSide;
  }
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
  const hasInverted = polySides % 2 === 1;

  const ySide = correctRoundError(CONFIG.cellHeight / 2);

  if (hasInverted) {
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

  const yCoeficient = hasInverted
    ? correctRoundError(-CONFIG.cellHeight / 6)
    : 0;
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

  let canvasHeight = window.innerHeight;
  let canvasWidth = window.innerWidth;

  let rows = canvasHeight;
  // To always have the same height because of the shouldIntercalate polys
  rows -= ySide;
  rows = rows / CONFIG.cellHeight;
  rows = Math.floor(rows);

  let columns = canvasWidth / (xSide * 2);
  if (hasInverted) columns = ((canvasWidth - 2) * 2 - polySide) / polySide;
  if (shouldIntercalate)
    columns =
      ((canvasWidth - slopSide) * 2) / (radiusFromCorner * 2 + polySide);
  columns = Math.floor(columns);

  if (rows % 2 === 0) rows -= 1;
  if (columns % 2 === 0) columns -= 1;
  // When itercalating the first and last column should be an up column
  if (shouldIntercalate && ((columns + 1) / 2) % 2 === 0) columns -= 2;

  canvasHeight = rows * CONFIG.cellHeight;
  // To always have the same height because of the shouldIntercalate polys
  canvasHeight += ySide;
  canvasHeight = Math.round(canvasHeight);

  canvasWidth = columns * (xSide * 2);
  if (hasInverted) canvasWidth = (columns * polySide) / 2 + polySide / 2 + 2;
  if (shouldIntercalate)
    canvasWidth = (columns * (radiusFromCorner * 2 + polySide)) / 2 + slopSide;
  canvasWidth = Math.round(canvasWidth);

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
    calcX: getXFn(polySides, polySide, xSide),
    calcY: (i) => i * ySide * 2 + ySide,
    cx: correctRoundError(canvasWidth / 2),
    cy: correctRoundError((canvasHeight - ySide) / 2),
    shouldIntercalate,
    hasInverted,
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
export const resetSize = debounce((newSize) => {
  CONFIG.cellHeight = newSize;
  configPolys();
  setCanvasSize(null, POLY_INFO[CONFIG.polySides].canvasWidth);
  updateOffsets(getCenterCell(), MAP_INFO.currentCell);
  drawEveryCell();
});
