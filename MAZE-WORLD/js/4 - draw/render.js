import {
  getPolyInfo,
  MENU_CONFIG,
  RENDER_INFO,
  POLYGONS_FAVICONS,
} from "../1 - polygones/index.js";
import { ENTITY_INFO } from "../2 - entities/index.js";
import { GENERATION_CONFIG } from "../3 - generation/index.js";
import { DRAW_CONFIG } from "./config.js";

const RENDER_CONFIG = {
  selectedBorderColor: "white",
  borderColor: "black",
  emptyColor: "black",
  lineWidth: 1,
  wallDarkness: 0.5,
};

const drawContainer = document.getElementById("draw-container");
const canvasContainer = document.getElementById("canvas-container");

export const canvasLayers = /** @type {HTMLCanvasElement[]} */ ([]);
export const contextsLayers = /** @type {CanvasRenderingContext2D[]} */ ([]);

for (let i = 0; i < DRAW_CONFIG.maxLayer; i++) {
  const canvas = document.createElement("canvas");
  canvasContainer.appendChild(canvas);
  canvasLayers.push(canvas);
  contextsLayers.push(canvas.getContext("2d"));
}

/**
 * @param {number} height
 * @param {number} width
 */
export const setCanvasSize = (height, width) => {
  drawContainer.style.setProperty("--canvas-height", `${height}px`);
  canvasLayers.forEach((canvas) => (canvas.height = height));
  drawContainer.style.setProperty("--canvas-width", `${width}px`);
  canvasLayers.forEach((canvas) => (canvas.width = width));
};

export const setFavicon = () => {
  const link = /** @type {HTMLLinkElement} */ (
    document.querySelector("link[rel~='icon']")
  );
  link.href = POLYGONS_FAVICONS[RENDER_INFO.currentPoly];
};

export const updateConfigs = () => {
  canvasContainer.classList[MENU_CONFIG.usePerspective ? "add" : "remove"](
    "perspective"
  );
};

/**
 * @param {HTMLCanvasElement} canvas
 */
export const clearCanvas = (canvas) => {
  canvas.width = getPolyInfo().canvasWidth;
};

/**
 * @param {Wall} wall
 * @param {CanvasRenderingContext2D} context
 */
export const drawWall = (wall, context) => {
  // Only draw if there is a gap, if is sorrounded by walls it doesnt need
  if (wall.borderMap.find((b) => !!b))
    drawItem(context, wall, RENDER_CONFIG.wallDarkness);
};

/**
 * @param {Wall} wall
 * @param {CanvasRenderingContext2D} context
 */
export const drawWallTop = (wall, context) => {
  drawItem(context, wall.topInfo);

  context.strokeStyle = wall.isSelectedCell
    ? RENDER_CONFIG.selectedBorderColor
    : RENDER_CONFIG.borderColor;
  context.lineWidth = RENDER_CONFIG.lineWidth;
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
    : RENDER_CONFIG.emptyColor;

  fillPolygon(context, point, points);

  if (MENU_CONFIG.showPos)
    showPos(context, pos, point, isInverted, getPolyInfo().ySide);

  if (isSelectedCell) {
    context.strokeStyle = RENDER_CONFIG.selectedBorderColor;
    context.lineWidth = RENDER_CONFIG.lineWidth;
    applyBorders(context, point, points);
  } else if (MENU_CONFIG.showChunks) showChunks(context, pos, point, points);
};

/**
 * @param {Color} color
 * @param {boolean} shoulApplyDark
 * @param {number} modifier
 * @return {string}
 */
export const getFillStyle = ({ r, g, b }, shoulApplyDark, modifier = 1) => {
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
 * @param {number} ySide
 */
const showPos = (context, pos, point, isInverted, ySide) => {
  context.fillStyle = "black";
  context.font = `bold ${ySide / 2}px Arial`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(
    `${pos.i},${pos.j}`,
    point.x,
    isInverted ? point.y + ySide / 2 : point.y
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
    pos.i % GENERATION_CONFIG.chunkSize === 0 ||
    pos.j % GENERATION_CONFIG.chunkSize === 0
  ) {
    context.strokeStyle = RENDER_CONFIG.borderColor;
    context.lineWidth = RENDER_CONFIG.lineWidth;
    applyBorders(context, point, points);
  }
};
