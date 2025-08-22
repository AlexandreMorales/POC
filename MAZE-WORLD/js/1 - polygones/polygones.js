import { correctRoundError, getMod } from "../_utils.js";

import { RENDER_INFO } from "./_infos.js";
import { KNOWN_POLYGONS, KNOWN_POLYGONS_VALUES } from "./_configs.js";

const POLYS_INFO = /** @type {{ [k: number]: PolyInfoProp }} */ ({});
export const getPolyInfo = () => POLYS_INFO[RENDER_INFO.currentPoly];

/**
 * @param {Pos} pos
 * @param {boolean} isInverted
 * @param {Cell} baseCell
 * @return {Point}
 */
export const calculatePointBasedOnPos = ({ i, j }, isInverted, baseCell) => {
  const { calcX, calcY, ySide, shouldIntercalate } = getPolyInfo();
  i -= RENDER_INFO.iOffset || 0;
  j -= RENDER_INFO.jOffset || 0;

  let x = calcX(j);
  let y = calcY(i);

  // To always have columns static (since horizontal hexagones are not on the same level)
  if (shouldIntercalate && j % 2) y += baseCell?.pos.j % 2 ? -ySide : ySide;

  return applyRotation({ x, y }, isInverted, baseCell);
};

/**
 * @param {Cell} cell
 * @param {number} index
 * @returns {Pos}
 */
export const getPosByIndex = (cell, index) =>
  cell.adjacentPos[RENDER_INFO.currentPoly][
    getMod(index || 0, RENDER_INFO.currentPoly)
  ];

/**
 * @param {Point} points
 * @param {boolean} isInverted
 * @param {Cell} baseCell
 * @return {Point}
 */
const applyRotation = ({ x, y }, isInverted, baseCell) => {
  if (!RENDER_INFO.rotationTurns) return { x, y };

  const { cx, cy, ySide, xSide, hasInverted } = getPolyInfo();

  const angle = (360 / RENDER_INFO.currentPoly) * RENDER_INFO.rotationTurns;
  const radians = (Math.PI / 180) * angle;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  // x' = x * cos(θ) - y * sin(θ)
  let nx = correctRoundError(cos * (x - cx) + sin * (y - cy) + cx);
  // y' = x * sin(θ) + y * cos(θ)
  let ny = correctRoundError(cos * (y - cy) - sin * (x - cx) + cy);

  if (hasInverted && isInverted !== baseCell?.isInverted && angle) {
    const oddTurn = !!(RENDER_INFO.rotationTurns % 2);
    ny += ySide * (baseCell?.isInverted ? 1 : -1);
    nx += (xSide / 2) * (baseCell?.isInverted === oddTurn ? -1 : 1);
  }

  return { x: nx, y: ny };
};

/**
 * @param {Point[]} points
 * @param {number} height
 * @returns {Point[]}
 */
const createWallPoints = (points, height) => {
  let centerAndBottomPoints = points.filter((p) => p.y >= 0);
  // only for inverted triangles
  if (centerAndBottomPoints.length <= 1)
    centerAndBottomPoints = points.sort((a, b) => a.x - b.x);
  const firstPoint = centerAndBottomPoints[0];
  const lastPoint = centerAndBottomPoints[centerAndBottomPoints.length - 1];
  return [
    { x: firstPoint.x, y: firstPoint.y - height },
    ...centerAndBottomPoints,
    { x: lastPoint.x, y: lastPoint.y - height },
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
 * @param {number} cellHeight
 * @returns {PolyInfoProp}
 */
export const configPoly = (polySides, cellHeight) => {
  let radiusFromSide = 0;
  let radiusFromCorner = 0;
  /**
   * The length of the side of the polygon
   */
  let polySide = 0;
  const hasInverted = polySides % 2 === 1;

  const ySide = correctRoundError(cellHeight / 2);

  if (hasInverted) {
    // Pythagoras of (height² + (side/2)² = side²)
    polySide = correctRoundError(Math.sqrt(cellHeight ** 2 / (1 - 1 / 4)));
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

  const yCoeficient = hasInverted ? correctRoundError(-cellHeight / 6) : 0;
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

  const { innerHeight, innerWidth } = window;
  const rows = Math.floor(innerHeight / cellHeight);
  let columns = innerWidth / (xSide * 2);
  if (hasInverted) columns = ((innerWidth - 2) * 2 - polySide) / polySide;
  if (shouldIntercalate)
    columns = ((innerWidth - slopSide) * 2) / (radiusFromCorner * 2 + polySide);
  columns = Math.floor(columns);

  if (columns % 2 === 0) columns -= 1;
  // When itercalating the first and last column should be an up column
  if (shouldIntercalate && ((columns + 1) / 2) % 2 === 0) columns -= 2;

  const canvasHeight = innerHeight;
  let canvasWidth = columns * (xSide * 2);
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
    cy: correctRoundError((canvasHeight - ySide * 3) / 2),
    shouldIntercalate,
    hasInverted,
  };
};

export const configPolys = () => {
  for (const p of KNOWN_POLYGONS_VALUES) {
    POLYS_INFO[p] = configPoly(p, RENDER_INFO.cellHeight);
  }
};
