import { CONFIG } from "./configs.js";
import {
  CIRCLE_INFO,
  KNOWN_POLYGONS,
  knownPolys,
  MAP_INFO,
  POLY_INFO,
} from "./infos.js";
import { resetCanvasSize, drawEveryCell, setCanvasSize } from "./draw.js";
import { GRID, loadChunk } from "./grid.js";
import "./movement.js";
import { startBuild } from "./maze.js";
import { getCenterCell, updateOffsets } from "./movement.js";

const start = () => {
  if (CONFIG.isCircle) {
    configCircle();
  } else {
    for (const p of knownPolys) {
      POLY_INFO[p] = configPoly(p);
    }
    resetCanvasSize();
    CONFIG.initialRows = POLY_INFO[CONFIG.polySides].rows;
    CONFIG.initialColumns = POLY_INFO[CONFIG.polySides].columns;
  }

  loadChunk(0, 0);
  MAP_INFO.currentCell = GRID[0][0];

  if (CONFIG.isMaze) {
    startBuild();
  } else {
    const centerCell = getCenterCell();
    updateOffsets(centerCell, MAP_INFO.currentCell);
    drawEveryCell();
  }
};

/**
 * @param {number} polySides
 * @param {number} radiusFromCorner
 * @param {number} coeficient
 * @param {number} yCoeficient
 * @returns {{ x: number, y: number }[]}
 */
const createPoints = (polySides, radiusFromCorner, coeficient, yCoeficient) => {
  const points = [];
  const sideRad = (2 * Math.PI) / polySides;

  for (let i = 0; i < polySides; i++) {
    const nI = i - coeficient;
    const x = radiusFromCorner * Math.cos(sideRad * nI);
    const y = radiusFromCorner * Math.sin(sideRad * nI) + yCoeficient;

    points.push({ x, y });
  }
  points.push(points[0]);
  return points;
};

/**
 * @param {number} polySides
 * @returns {import("./infos.js").PolyInfoProp}
 */
const configPoly = (polySides) => {
  let radiusFromSide = 0;
  let radiusFromCorner = 0;
  // The length of the side of the polygon
  let polySide = 0;
  const isOddPoly = polySides % 2;

  if (isOddPoly) {
    // Pythagoras of (height² + (side/2)² = side²)
    polySide = Math.sqrt(CONFIG.cellHeight ** 2 / (1 - 1 / 4));
    // (1/2)a cot(π/n);
    radiusFromSide = (polySide / 2) * (1 / Math.tan(Math.PI / polySides));
  } else {
    radiusFromSide = CONFIG.cellHeight / 2;
    // 2r tan(π/n)
    polySide = 2 * radiusFromSide * Math.tan(Math.PI / polySides);
  }
  // (r sec(π/n))
  radiusFromCorner = radiusFromSide * (1 / Math.cos(Math.PI / polySides));

  const shouldIntercalate = polySides > KNOWN_POLYGONS.SQUARE;

  const yCoeficient = isOddPoly ? CONFIG.cellHeight / 6 : 0;
  const points = createPoints(
    polySides,
    radiusFromCorner,
    (polySides / 2 + 1) / 2,
    -yCoeficient
  );
  const xSide = points.reduce((acc, { x }) => (x > acc ? x : acc), 0);
  const invertedPoints = createPoints(
    polySides,
    radiusFromCorner,
    (polySides / 2 + (polySides + 1)) / 2,
    yCoeficient
  );

  const ySide = CONFIG.cellHeight / 2;

  const slopSide = Math.sqrt(Math.abs(polySide ** 2 - radiusFromSide ** 2));

  let rows = CONFIG.initialRows;
  let columns = CONFIG.initialColumns;
  let canvasHeight = 0;
  let canvasWidth = 0;

  if (CONFIG.automaticRowsAndColumns) {
    canvasHeight = window.innerHeight - 100;
    canvasWidth = window.innerWidth;

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
  }

  if (rows % 2 === 0) rows -= 1;
  if (columns % 2 === 0) columns -= 1;

  canvasHeight = rows * CONFIG.cellHeight;
  if (shouldIntercalate) canvasHeight += ySide;

  canvasWidth = columns * (xSide * 2);

  if (isOddPoly) canvasWidth = (columns * polySide) / 2 + polySide / 2 + 2;

  if (shouldIntercalate)
    canvasWidth = (columns * (radiusFromCorner * 2 + polySide)) / 2 + slopSide;

  const bottomIndex = Math.floor(polySides / 2) % polySides;

  return {
    polySide,
    xSide,
    ySide,
    points,
    invertedPoints,
    bottomIndex,
    rows,
    columns,
    canvasHeight,
    canvasWidth,
  };
};

const configCircle = () => {
  CONFIG.polySides = KNOWN_POLYGONS.SQUARE;
  CIRCLE_INFO.rows = CONFIG.initialRows * 2;
  CIRCLE_INFO.columns = CONFIG.initialColumns * 2;

  const canvasWidth = CIRCLE_INFO.rows * 2 * CONFIG.cellHeight + 2;

  setCanvasSize(canvasWidth, canvasWidth);

  CIRCLE_INFO.centerX = CIRCLE_INFO.centerY = canvasWidth / 2;
};

start();
