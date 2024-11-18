import { CONFIG } from "./configs.js";
import { KNOWN_POLYGONS, knownPolys, MAP_INFO, POLY_INFO } from "./infos.js";
import { resetCanvasSize, drawEveryCell, setCanvasSize } from "./draw.js";
import { configCellPos, GRID, loadChunk } from "./grid.js";
import "./movement.js";
import { changePolySides, getCenterCell, updateOffsets } from "./movement.js";
import { correctRoundError } from "./utils.js";

const start = () => {
  configPolys();
  resetCanvasSize();
  CONFIG.initialRows = POLY_INFO[CONFIG.polySides].rows;
  CONFIG.initialColumns = POLY_INFO[CONFIG.polySides].columns;

  loadChunk(0, 0);

  MAP_INFO.currentCell = getCenterCell();
  drawEveryCell();
};

const configPolys = () => {
  for (const p of knownPolys) {
    POLY_INFO[p] = configPoly(p);
  }
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
    const x = correctRoundError(radiusFromCorner * Math.cos(sideRad * nI));
    const y = correctRoundError(
      radiusFromCorner * Math.sin(sideRad * nI) + yCoeficient
    );

    points.push({ x, y });
  }

  const xSide = points.reduce((acc, { x }) => (x > acc ? x : acc), 0);
  const invertedPoints = points.map((p) => ({ x: -p.x, y: -p.y }));

  // Length the upper right point x to the rightmost point x
  const slopSide = correctRoundError(
    Math.sqrt(Math.abs(polySide ** 2 - radiusFromSide ** 2))
  );

  let rows = CONFIG.initialRows;
  let columns = CONFIG.initialColumns;
  let canvasHeight = 0;
  let canvasWidth = 0;

  if (CONFIG.automaticRowsAndColumns) {
    canvasHeight = window.innerHeight * 0.9;
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
  // When itercalating the first and last column should be an up column
  if (shouldIntercalate && ((columns + 1) / 2) % 2 === 0) columns -= 2;

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
    rows: Math.round(rows),
    columns: Math.round(columns),
    canvasHeight: Math.round(canvasHeight),
    canvasWidth: Math.round(canvasWidth),
  };
};

/**
 * @param {number} newSize
 */
export const resetSize = (newSize) => {
  CONFIG.cellHeight = newSize;
  configPolys();
  GRID.flatMap((c) => c.flat()).map((c) => configCellPos(c));
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

start();

const cellHeightInput = /** @type {HTMLInputElement} */ (
  document.getElementById("cell-height")
);
if (CONFIG.showZoom) {
  cellHeightInput.value = cellHeightInput.min = `${CONFIG.cellHeight}`;
  cellHeightInput.oninput = () => resetSize(+cellHeightInput.value);
} else {
  cellHeightInput.style.display = "none";
}

const changePolyBtn = /** @type {HTMLButtonElement} */ (
  document.getElementById("change-poly")
);
changePolyBtn.onclick = changePolySides;
