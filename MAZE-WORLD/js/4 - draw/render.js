import { getPolyInfo, MENU_CONFIG } from "../1 - polygones/index.js";
import { ENTITY_INFO } from "../2 - entities/index.js";
import { GENERATION_CONFIG } from "../3 - generation/index.js";

const DRAW_CONFIG = {
  selectedBorderColor: "white",
  borderColor: "black",
  emptyColor: "black",
  lineWidth: 1,
  wallDarkness: 0.5,
};

/**
 * @param {Wall} wall
 * @param {CanvasRenderingContext2D} context
 */
export const drawWall = (wall, context) => {
  // Only draw if there is a gap, if is sorrounded by walls it doesnt need
  if (wall.borderMap.find((b) => !!b))
    drawItem(context, wall, DRAW_CONFIG.wallDarkness);
};

/**
 * @param {Wall} wall
 * @param {CanvasRenderingContext2D} context
 */
export const drawWallTop = (wall, context) => {
  drawItem(context, wall.topInfo);

  context.strokeStyle = wall.isSelectedCell
    ? DRAW_CONFIG.selectedBorderColor
    : DRAW_CONFIG.borderColor;
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
 * @param {Drawable} drawable
 * @param {number} [modifier]
 */
export const drawItem = (
  context,
  { point, points, pos, isInverted, color, shoulApplyDark, isSelectedCell },
  modifier
) => {
  context.fillStyle = color
    ? getFillStyle(color, shoulApplyDark, modifier)
    : DRAW_CONFIG.emptyColor;

  fillPolygon(context, point, points);

  if (MENU_CONFIG.showPos)
    showPos(context, pos, point, isInverted, getPolyInfo());

  if (isSelectedCell) {
    context.strokeStyle = DRAW_CONFIG.selectedBorderColor;
    context.lineWidth = DRAW_CONFIG.lineWidth;
    applyBorders(context, point, points);
  } else if (MENU_CONFIG.showChunks) showChunks(context, pos, point, points);
};

/**
 * @param {Color} color
 * @param {boolean} shoulApplyDark
 * @param {number} modifier
 * @return {string}
 */
const getFillStyle = ({ r, g, b }, shoulApplyDark, modifier = 1) => {
  if (ENTITY_INFO.timeOfDay && shoulApplyDark)
    modifier = (1 - ENTITY_INFO.timeOfDay / 100) * modifier;

  return `rgb(${r * modifier}, ${g * modifier}, ${b * modifier})`;
};

/**
 * @param {CanvasRenderingContext2D} context
 * @param {Point} point
 * @param {Point[]} points
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
 * @param {Point} point
 * @param {Point[]} points
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
 * @param {Pos} pos
 * @param {Point} point
 * @param {boolean} isInverted
 * @param {PolyInfoProp} polyInfo
 */
const showPos = (context, pos, point, isInverted, polyInfo) => {
  context.fillStyle = "black";
  context.font = `bold ${polyInfo.ySide / 2}px Arial`;
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
 * @param {Pos} pos
 * @param {Point} point
 * @param {Point[]} points
 */
const showChunks = (context, pos, point, points) => {
  if (
    pos.i % GENERATION_CONFIG.chunkRows === 0 ||
    pos.j % GENERATION_CONFIG.chunkColumns === 0
  ) {
    context.strokeStyle = DRAW_CONFIG.borderColor;
    context.lineWidth = DRAW_CONFIG.lineWidth;
    applyBorders(context, point, points);
  }
};
