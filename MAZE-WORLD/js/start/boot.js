import {
  KNOWN_POLYGONS,
  KNOWN_POLYGONS_VALUES,
} from "../0 - configs/configs.js";
import { POLY_INFO } from "../0 - configs/infos.js";
import { correctRoundError, debounce } from "../1 - utils/utils.js";
import { GRID_INFO } from "../2 - grid/infos.js";
import { resetGrid } from "../2 - grid/grid.js";
import { PLAYER_ENTITY } from "../3 - entities/player.js";
import { resetEntities } from "../3 - entities/entities.js";
import { getGridCell, getCenterCell } from "../4 - map/map.js";
import { DRAW_INFO } from "../5 - draw/infos.js";
import {
  resetCanvasSize,
  drawEveryCell,
  setCanvasSize,
  updateCanvasCss,
} from "../5 - draw/draw.js";
import { cellIsBlocked, moveCurrentCell } from "../6 - actions/movement.js";
import { resetDirection } from "../6 - actions/actions.js";

const configPolys = () => {
  for (const p of KNOWN_POLYGONS_VALUES) {
    POLY_INFO[p] = configPoly(p);
  }
};

/**
 * @param {import("../0 - configs/infos.js").Point[]} points
 * @param {number} height
 * @returns {import("../0 - configs/infos.js").Point[]}
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
 * @returns {import("../0 - configs/infos.js").PolyInfoProp}
 */
const configPoly = (polySides) => {
  let radiusFromSide = 0;
  let radiusFromCorner = 0;
  /**
   * The length of the side of the polygon
   */
  let polySide = 0;
  const hasInverted = polySides % 2 === 1;

  const ySide = correctRoundError(DRAW_INFO.cellHeight / 2);

  if (hasInverted) {
    // Pythagoras of (height² + (side/2)² = side²)
    polySide = correctRoundError(
      Math.sqrt(DRAW_INFO.cellHeight ** 2 / (1 - 1 / 4))
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
    ? correctRoundError(-DRAW_INFO.cellHeight / 6)
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
  rows = rows / DRAW_INFO.cellHeight;
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

  canvasHeight = rows * DRAW_INFO.cellHeight;
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
    rows,
    columns,
    canvasHeight,
    canvasWidth,
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
  resetGrid();
  resetEntities();
  resetCanvasSize();
  updateCanvasCss();
  resetDirection();

  moveCurrentCell(getCenterCell(), getGridCell(0, 0));
  while (cellIsBlocked(PLAYER_ENTITY.cell, PLAYER_ENTITY)) {
    moveCurrentCell(
      PLAYER_ENTITY.cell,
      getGridCell(PLAYER_ENTITY.cell.pos.i + 1, PLAYER_ENTITY.cell.pos.j)
    );
  }
  drawEveryCell(PLAYER_ENTITY.cell);
};

/**
 * @param {number} newSize
 */
export const resetSize = debounce((newSize) => {
  DRAW_INFO.cellHeight = newSize || DRAW_INFO.cellHeight;
  configPolys();
  resetEntities();
  setCanvasSize(null, POLY_INFO[GRID_INFO.currentPoly].canvasWidth);
  moveCurrentCell(getCenterCell(), PLAYER_ENTITY.cell);
  drawEveryCell(PLAYER_ENTITY.cell);
});
