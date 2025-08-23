import { MENU_CONFIG } from "../1 - polygones/index.js";
import { applyBorders, fillPolygon, getFillStyle, showPos } from "./render.js";

const MAZE_CANVAS_CONFIG = {
  defaultColor: "#cdcdcd",
};

/**
 * @param {CanvasRenderingContext2D} context
 * @param {MazeObj} mazeObj
 */
export const drawMaze = (context, mazeObj) => {
  for (const pos of mazeObj.iterateOverMaze()) {
    drawCellMaze(context, mazeObj, mazeObj.getMazeCell(pos));
  }
};

/**
 * @param {CanvasRenderingContext2D} context
 * @param {MazeObj} mazeObj
 * @param {CellMaze} cell
 * @param {Color} [color]
 */
export const drawCellMaze = (context, mazeObj, cell, color) => {
  context.fillStyle = color
    ? getFillStyle(color)
    : MAZE_CANVAS_CONFIG.defaultColor;

  if (cell.circleProps)
    drawCellMazeCircle(context, cell, mazeObj.getCirclePoint());
  else drawCellMazePolygon(context, mazeObj, cell);
};

/**
 * @param {CanvasRenderingContext2D} context
 * @param {MazeObj} mazeObj
 * @param {CellMaze} cell
 */
const drawCellMazePolygon = (context, mazeObj, cell) => {
  const polyInfo = mazeObj.getMazePolyInfo();
  const isInverted = polyInfo.hasInverted && cell.isInverted;
  const points = isInverted ? polyInfo.invertedPoints : polyInfo.points;
  const borders =
    polyInfo.hasInverted && !cell.isInverted
      ? cell.invertedBorders
      : cell.borders;

  fillPolygon(context, cell.point, points);
  applyBorders(context, cell.point, points, borders);

  if (MENU_CONFIG.showPos && cell.pos)
    showPos(context, cell.pos, cell.point, isInverted, polyInfo.ySide);
};

/**
 * @param {CanvasRenderingContext2D} context
 * @param {CellMaze} cell
 * @param {Point} circlePoint
 */
const drawCellMazeCircle = (context, cell, circlePoint) => {
  const {
    topRadius,
    bottomRadius,

    topLeftPoint,
    topRightPoint,
    bottomLeftPoint,
    bottomRightPoint,

    topLeftAngle,
    topRightAngle,
    bottomLeftAngle,
    bottomRightAngle,
  } = cell.circleProps;

  // FILL
  context.beginPath();
  context.moveTo(topLeftPoint.x, topLeftPoint.y);

  context.arc(
    circlePoint.x,
    circlePoint.y,
    topRadius,
    topLeftAngle,
    topRightAngle
  );
  context.lineTo(bottomRightPoint.x, bottomRightPoint.y);
  context.arc(
    circlePoint.x,
    circlePoint.y,
    bottomRadius,
    bottomRightAngle,
    bottomLeftAngle,
    true
  );
  context.lineTo(topLeftPoint.x, topLeftPoint.y);

  context.closePath();
  context.fill();

  // BORDERS
  if (cell.borders[0]) {
    context.beginPath();
    context.moveTo(topLeftPoint.x, topLeftPoint.y);
    context.arc(
      circlePoint.x,
      circlePoint.y,
      topRadius,
      topLeftAngle,
      topRightAngle
    );
    context.stroke();
  }

  if (cell.borders[1]) {
    context.beginPath();
    context.moveTo(topRightPoint.x, topRightPoint.y);
    context.lineTo(bottomRightPoint.x, bottomRightPoint.y);
    context.stroke();
  }

  if (cell.borders[2]) {
    context.beginPath();
    context.moveTo(bottomRightPoint.x, bottomRightPoint.y);
    context.arc(
      circlePoint.x,
      circlePoint.y,
      bottomRadius,
      bottomRightAngle,
      bottomLeftAngle,
      true
    );
    context.stroke();
  }

  if (cell.borders[3]) {
    context.beginPath();
    context.moveTo(bottomLeftPoint.x, bottomLeftPoint.y);
    context.lineTo(topLeftPoint.x, topLeftPoint.y);
    context.stroke();
  }
};
