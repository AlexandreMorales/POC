import { INITIAL_POS } from "../0 - grid/index.js";
import {
  configPoly,
  KNOWN_POLYGONS,
  KNOWN_POLYGONS_VALUES,
  RENDER_INFO,
} from "../1 - polygones/index.js";
import { getRandomInt } from "../_utils";

import { createCellProps } from "./generation.js";

/**
 * @typedef {Object} MazePropsInfo
 * @property {number} cellHeight
 * @property {number} rows
 * @property {number} columns
 */

/**
 * @param {MazePropsInfo} mazeInfos
 * @param {MazePropsInfo} [mazeCircleInfos]
 * @returns {MazeObj}
 */
export const createMazeObj = (mazeInfos, mazeCircleInfos) => {
  let MAZE_GRID = /** @type {CellMaze[][]} */ ([]);

  const MAZE_POLYS_INFO = /** @type {{ [k: number]: PolyInfoProp }} */ ({});
  const getMazePolyInfo = () => MAZE_POLYS_INFO[RENDER_INFO.currentPoly];

  /**
   * @typedef {Object} MazeCircleInfo
   * @property {number} cellHeight
   * @property {Point} center
   * @property {number} rows
   * @property {number} columns
   */
  const CIRCLE_INFO = /** @type {MazeCircleInfo} */ ({
    cellHeight: 0,
    center: null,
    rows: 0,
    columns: 0,
  });

  /**
   * @typedef {Object} MazeInfo
   * @property {number} rows
   * @property {number} columns
   * @property {boolean} isCircle
   * @property {CellMaze} currentCell
   * @property {symbol} state
   * @property {Pos[]} queue
   */
  const MAZE_INFO = /** @type {MazeInfo} */ ({
    rows: 0,
    columns: 0,
    isCircle: false,
    currentCell: null,
    queue: [],
  });

  // GRID
  /**
   * @param {Pos} pos
   * @return {CellMaze}
   */
  const getMazeCell = ({ i, j }) => MAZE_GRID[i]?.[j];

  const createMazeGrid = () => {
    MAZE_GRID = [];
    const rows = getMazeRows();

    for (let i = 0; i < rows; i++) {
      const numCells = getNumCellsPerMazeRow(i);
      for (let j = 0; j < numCells; j++) {
        MAZE_GRID[i] = MAZE_GRID[i] || [];
        MAZE_GRID[i][j] = createCellMaze({ i, j });
      }
    }
  };

  // GENERATION
  /**
   * @param {Pos} pos
   * @returns {CellMaze}
   */
  const createCellMaze = (pos) => {
    const cell = /** @type {CellMaze} */ (createCellProps(pos));

    cell.visited = false;
    cell.solved = false;
    cell.path = false;

    cell.borders = [...new Array(RENDER_INFO.currentPoly)].map(() => true);

    if (MAZE_INFO.isCircle) createCircleCellMaze(cell);
    else cell.point = calculateMazePoint(pos);

    return cell;
  };

  /**
   * @param {Pos} pos
   * @return {Point}
   */
  const calculateMazePoint = ({ i, j }) => {
    const { calcX, calcY, ySide, shouldIntercalate } = getMazePolyInfo();

    const x = calcX(j);
    let y = calcY(i);

    if (shouldIntercalate && j % 2) y += ySide;

    return { x, y };
  };

  /**
   * @returns {number}
   */
  const getMazeRows = () =>
    MAZE_INFO.isCircle ? CIRCLE_INFO.rows : MAZE_INFO.rows;

  /**
   * @param {number} rowIndex
   * @returns {number}
   */
  const getNumCellsPerMazeRow = (rowIndex) =>
    MAZE_INFO.isCircle
      ? CIRCLE_INFO.columns - Math.floor((rowIndex + 1) / 2)
      : MAZE_INFO.columns;

  /**
   * @param {CellMaze} cell
   */
  const createCircleCellMaze = (cell) => {
    const { i, j } = cell.pos;
    const topRadius = (CIRCLE_INFO.rows - i) * CIRCLE_INFO.cellHeight;
    const bottomRadius = topRadius - CIRCLE_INFO.cellHeight;

    const topAngle = Math.atan2(-topRadius, 0);
    const bottomAngle = bottomRadius ? topAngle : 0;

    const numCells = getNumCellsPerMazeRow(i);

    const parts = (Math.PI * 1.5 - topAngle) / numCells;

    const leftBorder = j * parts;
    const rightBorder = (j + 1) * parts;

    const topLeftAngle = topAngle + leftBorder;
    const topRightAngle = topAngle + rightBorder;
    const bottomLeftAngle = bottomAngle + leftBorder;
    const bottomRightAngle = bottomAngle + rightBorder;

    const topLeftPoint = getMazePoint(
      CIRCLE_INFO.center,
      topRadius,
      topLeftAngle
    );
    const topRightPoint = getMazePoint(
      CIRCLE_INFO.center,
      topRadius,
      topRightAngle
    );
    const bottomLeftPoint = getMazePoint(
      CIRCLE_INFO.center,
      bottomRadius,
      bottomLeftAngle
    );
    const bottomRightPoint = getMazePoint(
      CIRCLE_INFO.center,
      bottomRadius,
      bottomRightAngle
    );
    const points = [
      topLeftPoint,
      topRightPoint,
      bottomLeftPoint,
      bottomRightPoint,
    ];

    const x = points.reduce((acc, p) => acc + p.x, 0) / points.length;
    const y = points.reduce((acc, p) => acc + p.y, 0) / points.length;

    cell.point = getMazePoint({ x, y }, CIRCLE_INFO.cellHeight, topAngle);
    cell.circleProps = {
      topLeftPoint,
      topRightPoint,
      bottomLeftPoint,
      bottomRightPoint,
      topRadius,
      bottomRadius,
      topLeftAngle,
      topRightAngle,
      bottomLeftAngle,
      bottomRightAngle,
      adjacentPos: cell.adjacentPos[KNOWN_POLYGONS.SQUARE].map((aPos) => ({
        i: aPos.i,
        j: aPos.j < 0 ? numCells - 1 : aPos.j >= numCells ? 0 : aPos.j,
      })),
    };
  };

  /**
   * @param {Point} center
   * @param {number} radius
   * @param {number} angle
   * @returns {Point}
   */
  const getMazePoint = (center, radius, angle) => ({
    x: center.x + Math.cos(angle) * radius,
    y: center.y + Math.sin(angle) * radius,
  });

  // BUILD
  const buildMaze = () => {
    createMazeGrid();
    MAZE_INFO.currentCell = getMazeCell(INITIAL_POS);

    while (MAZE_INFO.currentCell)
      MAZE_INFO.currentCell = buildCellMaze(MAZE_INFO.currentCell);

    MAZE_INFO.currentCell = getMazeCell(INITIAL_POS);
  };

  /**
   * @param {CellMaze} cell
   */
  const buildCellMaze = (cell) => {
    cell.visited = true;
    const nextCell = getNextCellMaze(cell, (c) => !!c && !c.visited, true);

    if (!nextCell) return null;

    const adjacentIndex = getNextCellMazeAdjacentIndex(cell, nextCell);
    const nextAdjacentIndex = getNextCellMazeAdjacentIndex(nextCell, cell);
    cell.borders[adjacentIndex] = false;
    nextCell.borders[nextAdjacentIndex] = false;

    return nextCell;
  };

  const getLastMazeCell = () =>
    getMazeCell({ i: MAZE_INFO.rows - 1, j: MAZE_INFO.columns - 1 });

  const isMazeSolved = () =>
    !MAZE_INFO.currentCell ||
    (MAZE_INFO.isCircle
      ? MAZE_INFO.currentCell.pos.i === CIRCLE_INFO.rows - 1
      : MAZE_INFO.currentCell === getLastMazeCell());

  const solveMaze = () => {
    while (!isMazeSolved())
      MAZE_INFO.currentCell = solveCellMaze(MAZE_INFO.currentCell);

    solveCellMaze(MAZE_INFO.currentCell);
    MAZE_INFO.currentCell = getMazeCell(INITIAL_POS);
  };

  /**
   * @param {CellMaze} cell
   * @returns {CellMaze}
   */
  const solveCellMaze = (cell) => {
    if (!cell) return;

    cell.solved = true;
    cell.path = true;
    const prevLength = MAZE_INFO.queue.length;

    const nextCell = getNextCellMaze(cell, (c) => {
      if (!c || c.solved) return false;
      const nextIndex = getNextCellMazeAdjacentIndex(cell, c);
      return !cell.borders[nextIndex];
    });

    if (prevLength > MAZE_INFO.queue.length) cell.path = false;

    return nextCell;
  };

  /**
   * @param {CellMaze} cell
   * @returns {Pos[]}
   */
  const getAdjPos = (cell) =>
    cell.circleProps?.adjacentPos || cell.adjacentPos[RENDER_INFO.currentPoly];

  /**
   * @param {CellMaze} cell
   * @param {(c: CellMaze) => boolean} cellFilter
   * @param {boolean} [isRandom]
   * @returns {CellMaze}
   */
  const getNextCellMaze = (cell, cellFilter, isRandom = false) => {
    const adjacentPos = getAdjPos(cell);
    const aCells = adjacentPos.map(getMazeCell).filter(cellFilter);

    if (!aCells.length) {
      if (!MAZE_INFO.queue.length) return null;
      const prevPos = MAZE_INFO.queue.pop();
      return getMazeCell(prevPos);
    }

    MAZE_INFO.queue.push(cell.pos);

    return aCells[isRandom ? getRandomInt(aCells.length) : aCells.length - 1];
  };

  /**
   * @param {CellMaze} cell
   * @param {CellMaze} nextCell
   * @returns {number}
   */
  const getNextCellMazeAdjacentIndex = (cell, nextCell) => {
    let nextIndex = 0;
    const adjacentPos = getAdjPos(cell);
    while (nextIndex < adjacentPos.length) {
      const { i, j } = adjacentPos[nextIndex];
      if (nextCell.pos.i === i && nextCell.pos.j === j) break;
      nextIndex++;
    }

    return nextIndex;
  };

  // MOVEMENT
  /**
   * @param {number} posIndex
   * @returns {CellMaze}
   */
  const mazeMove = (posIndex) => {
    if (posIndex === undefined || MAZE_INFO.currentCell.borders[posIndex])
      return;

    const nextPos = getAdjPos(MAZE_INFO.currentCell)[posIndex];
    if (!nextPos) return;

    const nextCell = getMazeCell(nextPos);
    if (!nextCell) return;

    const oldCell = MAZE_INFO.currentCell;
    MAZE_INFO.currentCell = nextCell;

    const prevCell = MAZE_INFO.queue[MAZE_INFO.queue.length - 1];

    if (nextCell.pos === prevCell) {
      oldCell.path = false;
      MAZE_INFO.queue.pop();
    } else {
      oldCell.path = true;
      MAZE_INFO.queue.push(oldCell.pos);
    }

    return MAZE_INFO.currentCell;
  };

  // CONFIGURE
  const initMaze = () => {
    for (const p of KNOWN_POLYGONS_VALUES) {
      MAZE_POLYS_INFO[p] = configPoly(p, mazeInfos.cellHeight);
    }

    MAZE_INFO.rows = mazeInfos.rows;
    MAZE_INFO.columns = mazeInfos.columns;

    CIRCLE_INFO.cellHeight =
      mazeCircleInfos?.cellHeight || mazeInfos.cellHeight;
    CIRCLE_INFO.rows = mazeCircleInfos?.rows || MAZE_INFO.rows * 2;
    CIRCLE_INFO.columns = mazeCircleInfos?.columns || MAZE_INFO.columns * 2;
    const center = (CIRCLE_INFO.rows * 2 * CIRCLE_INFO.cellHeight + 2) / 2;
    CIRCLE_INFO.center = { x: center, y: center };
  };

  /**
   * @returns {{ height: number, width: number  }}
   */
  const getMazeSize = () => {
    let { ySide, xSide, shouldIntercalate, hasInverted, polySide } =
      getMazePolyInfo();
    let height = MAZE_INFO.rows * mazeInfos.cellHeight;
    let width = MAZE_INFO.columns * (xSide * 2);
    if (MAZE_INFO.isCircle)
      height = width = CIRCLE_INFO.rows * 2 * CIRCLE_INFO.cellHeight + 2;
    else {
      if (hasInverted)
        width = (MAZE_INFO.columns * polySide) / 2 + polySide / 2 + 2;
      if (shouldIntercalate) {
        height += ySide;
        width = width * 0.8;
      }
    }

    return { height, width };
  };

  initMaze();

  return {
    getMazeSize,
    mazeMove,
    buildMaze,
    solveMaze,
    isMazeSolved,
    setIsCircle: (isCircle) => (MAZE_INFO.isCircle = isCircle),
    getCirclePoint: () => CIRCLE_INFO.center,
    getMazeRows,
    getNumCellsPerMazeRow,
    getMazeCell,
    getCurrentMazeCell: () => MAZE_INFO.currentCell,
    getLastMazeCell,
    getMazePolyInfo,
  };
};
