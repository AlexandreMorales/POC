import { applyBorders, fillPolygon } from "./render.js";

const MAZE_CANVAS_CONFIG = {
  strokeColor: "black",
  defaultColor: "transparent",
  visitedColor: "#cdcdcd",
  pathColor: "#6e79d6",
  currentColor: "cyan",
};

/**
 * @param {CanvasRenderingContext2D} context
 * @param {MazeObj} mazeObj
 */
export const drawMaze = (context, mazeObj) => {
  context.strokeStyle = MAZE_CANVAS_CONFIG.strokeColor;
  context.lineWidth = 1;

  const rows = mazeObj.getMazeRows();
  for (let i = 0; i < rows; i++) {
    const numCells = mazeObj.getNumCellsPerMazeRow(i);
    for (let j = 0; j < numCells; j++)
      drawCellMaze(context, mazeObj, mazeObj.getMazeCell({ i, j }));
  }
};

/**
 * @param {CanvasRenderingContext2D} context
 * @param {MazeObj} mazeObj
 * @param {CellMaze} cell
 */
const drawCellMaze = (context, mazeObj, cell) => {
  context.fillStyle = MAZE_CANVAS_CONFIG.defaultColor;

  if (cell.visited) context.fillStyle = MAZE_CANVAS_CONFIG.visitedColor;
  if (cell.path) context.fillStyle = MAZE_CANVAS_CONFIG.pathColor;
  if (cell === mazeObj.getCurrentMazeCell())
    context.fillStyle = MAZE_CANVAS_CONFIG.currentColor;

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
  const points =
    polyInfo.hasInverted && cell.isInverted
      ? polyInfo.invertedPoints
      : polyInfo.points;

  fillPolygon(context, cell.point, points);
  applyBorders(context, cell.point, points, cell.borders);
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
