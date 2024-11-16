import { CONFIG } from "./configs.js";
import {
  CIRCLE_INFO,
  KNOWN_POLYGONS,
  knownPolys,
  MAP_INFO,
  POLI_INFO,
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
      POLI_INFO[p] = configPoli(p);
    }
    resetCanvasSize();
    CONFIG.initialRows = POLI_INFO[CONFIG.poliSizes].rows;
    CONFIG.initialColumns = POLI_INFO[CONFIG.poliSizes].columns;
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
 * @param {number} poliSizes
 * @param {number} polyRadius
 * @param {number} coeficient
 * @param {number} yCoeficient
 * @returns {{ x: number, y: number }[]}
 */
const createPoints = (poliSizes, polyRadius, coeficient, yCoeficient) => {
  const points = [];
  const sideRad = (2 * Math.PI) / poliSizes;

  for (let i = 0; i < poliSizes; i++) {
    const nI = i - coeficient;
    const x = polyRadius * Math.cos(sideRad * nI);
    const y = polyRadius * Math.sin(sideRad * nI) + yCoeficient;

    points.push({ x, y });
  }
  points.push(points[0]);
  return points;
};

/**
 * @param {number} poliSizes
 * @returns {import("./infos.js").PolyInfoProp}
 */
const configPoli = (poliSizes) => {
  const polyHeight = CONFIG.cellSize / 2;
  const polyRadius = polyHeight * (1 / Math.cos(Math.PI / poliSizes));

  const polySide = 2 * polyRadius * Math.sin(Math.PI / poliSizes);

  const shouldIntercalate = poliSizes > 4;

  const yCoeficient = {
    3: CONFIG.cellSize / 4,
    5: CONFIG.cellSize / 10,
    7: CONFIG.cellSize / 20,
    9: CONFIG.cellSize / 35,
    11: CONFIG.cellSize / 50,
  };
  const points = createPoints(
    poliSizes,
    polyRadius,
    (poliSizes / 2 + 1) / 2,
    -(yCoeficient[poliSizes] || 0)
  );
  const xSide = points.reduce((acc, { x }) => (x > acc ? x : acc), 0);
  const invertedPoints = createPoints(
    poliSizes,
    polyRadius,
    (poliSizes / 2 + (poliSizes + 1)) / 2,
    yCoeficient[poliSizes] || 0
  );

  const ySide = poliSizes % 2 ? (polyHeight + polyRadius) / 2 : polyHeight;

  const slopSide = Math.sqrt(Math.abs(polySide ** 2 - polyHeight ** 2));

  let rows = CONFIG.initialRows;
  let columns = CONFIG.initialColumns;
  let canvasHeight = 0;
  let canvasWidth = 0;

  if (CONFIG.automaticRowsAndColumns) {
    canvasHeight = window.innerHeight - 100;
    canvasWidth = window.innerWidth;

    rows = canvasHeight;
    if (shouldIntercalate) rows -= ySide;
    rows = rows / CONFIG.cellSize;

    columns = canvasWidth / (xSide * 2);

    if (shouldIntercalate) {
      columns = ((canvasWidth - slopSide) * 2) / (polyRadius * 2 + polySide);
    }

    if (poliSizes === KNOWN_POLYGONS.TRIANGLE) {
      rows = canvasHeight / (polyHeight + polyRadius);
      columns = ((canvasWidth - 2) * 2 - polySide) / polySide;
    }

    rows = Math.floor(rows);
    columns = Math.floor(columns);
  }

  if (rows % 2 === 0) rows -= 1;
  if (columns % 2 === 0) columns -= 1;

  canvasHeight = rows * CONFIG.cellSize;
  if (shouldIntercalate) canvasHeight += ySide;

  canvasWidth = columns * (xSide * 2);

  if (shouldIntercalate)
    canvasWidth = (columns * (polyRadius * 2 + polySide)) / 2 + slopSide;

  if (poliSizes === KNOWN_POLYGONS.TRIANGLE) {
    canvasHeight = rows * (polyHeight + polyRadius);
    canvasWidth = (columns * polySide) / 2 + polySide / 2 + 2;
  }

  const bottomIndex = Math.floor(poliSizes / 2) % poliSizes;

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
  CONFIG.poliSizes = 4;
  CIRCLE_INFO.rows = CONFIG.initialRows * 2;
  CIRCLE_INFO.columns = CONFIG.initialColumns * 2;

  const canvasWidth = CIRCLE_INFO.rows * 2 * CONFIG.cellSize + 2;

  setCanvasSize(canvasWidth, canvasWidth);

  CIRCLE_INFO.centerX = CIRCLE_INFO.centerY = canvasWidth / 2;
};

start();
