import { CONFIG, MENU_CONFIG } from "../0 - configs/configs.js";
import { POLY_INFO } from "../0 - configs/infos.js";
import { GRID_INFO } from "../2 - grid/infos.js";
import { DRAW_INFO } from "./infos.js";

const DRAW_CONFIG = {
  strokeColor: "black",
  emptyColor: "black",
  lineWidth: 1,
  wallDarkness: 0.5,
};

/**
 * @param {import("./infos.js").Wall} wall
 * @param {CanvasRenderingContext2D} context
 */
export const drawWall = (wall, context) => {
  // Only draw if there is a gap, if is sorrounded by walls it doesnt need
  if (wall.borderMap.find((b) => !!b))
    drawItem(context, wall, DRAW_CONFIG.wallDarkness);
};

/**
 * @param {import("./infos.js").Wall} wall
 * @param {CanvasRenderingContext2D} context
 */
export const drawWallTop = (wall, context) => {
  drawItem(context, wall.topInfo);

  context.strokeStyle = DRAW_CONFIG.strokeColor;
  context.lineWidth = DRAW_CONFIG.lineWidth;
  applyBorders(
    context,
    wall.topInfo.point,
    wall.topInfo.points,
    wall.borderMap
  );
};

/**
 * @param {CanvasRenderingContext2D} context
 * @param {import("./infos.js").Drawable} drawable
 * @param {number} [modifier]
 */
export const drawItem = (
  context,
  { point, points, pos, isInverted, color, shoulApplyDark },
  modifier
) => {
  context.fillStyle = color
    ? getFillStyle(color, shoulApplyDark, modifier)
    : DRAW_CONFIG.emptyColor;

  fillPolygon(context, point, points);

  if (MENU_CONFIG.showPos)
    showPos(context, pos, point, isInverted, POLY_INFO[GRID_INFO.currentPoly]);

  if (MENU_CONFIG.showChunks) showChunks(context, pos, point, points);
};

/**
 * @param {import("../0 - configs/infos.js").Color} color
 * @param {boolean} shoulApplyDark
 * @param {number} modifier
 * @return {string}
 */
const getFillStyle = ({ r, g, b }, shoulApplyDark, modifier = 1) => {
  if (DRAW_INFO.timeOfDay && shoulApplyDark)
    modifier = (1 - DRAW_INFO.timeOfDay / 100) * modifier;

  return `rgb(${r * modifier}, ${g * modifier}, ${b * modifier})`;
};

/**
 * @param {CanvasRenderingContext2D} context
 * @param {import("../0 - configs/infos.js").Point} point
 * @param {import("../0 - configs/infos.js").Point[]} points
 */
const fillPolygon = (context, { x, y }, points) => {
  context.beginPath();

  for (const point of points) {
    context.lineTo(x + point.x, y + point.y);
  }

  context.closePath();
  context.fill();
};

/**
 * @param {CanvasRenderingContext2D} context
 * @param {import("../0 - configs/infos.js").Point} point
 * @param {import("../0 - configs/infos.js").Point[]} points
 * @param {boolean[]} [map]
 */
const applyBorders = (context, { x, y }, points, map) => {
  for (let i = 0; i < points.length; i++) {
    if (!map || map[i]) {
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
 * @param {CanvasRenderingContext2D} context
 * @param {import("../0 - configs/infos.js").CellPos} pos
 * @param {import("../0 - configs/infos.js").Point} point
 * @param {boolean} isInverted
 * @param {import("../0 - configs/infos.js").PolyInfoProp} polyInfo
 */
const showPos = (context, pos, point, isInverted, polyInfo) => {
  context.fillStyle = "black";
  context.font = `bold ${DRAW_INFO.cellHeight / 5}px Arial`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(
    `${pos.i},${pos.j}`,
    point.x,
    isInverted ? point.y + polyInfo.ySide / 2 : point.y
  );
};

/**
 * @param {CanvasRenderingContext2D} context
 * @param {import("../0 - configs/infos.js").CellPos} pos
 * @param {import("../0 - configs/infos.js").Point} point
 * @param {import("../0 - configs/infos.js").Point[]} points
 */
const showChunks = (context, pos, point, points) => {
  if (pos.i % CONFIG.chunkRows === 0 || pos.j % CONFIG.chunkColumns === 0) {
    context.strokeStyle = DRAW_CONFIG.strokeColor;
    context.lineWidth = DRAW_CONFIG.lineWidth;
    applyBorders(context, point, points);
  }
};
