import { MAZE_CONFIG, CONFIG } from "./configs.js";
import { drawCell, drawEveryCell } from "./draw.js";
import { getRows, getNumCellsPerRow, GRID } from "./grid.js";
import {
  MAP_INFO,
  TIME,
  CIRCLE_INFO,
  POLI_INFO,
  STATES,
  MAZE_INFO,
} from "./infos.js";
import { getRandomInt } from "./utils.js";

export const startBuild = () => {
  if (MAZE_CONFIG.buildTime) {
    const intr = setInterval(() => {
      const oldCell = MAP_INFO.currentCell;
      MAP_INFO.currentCell = build(MAP_INFO.currentCell);
      if (!MAP_INFO.currentCell) {
        finishBuild();
        return clearInterval(intr);
      }
      drawCell(oldCell);
      drawCell(MAP_INFO.currentCell);
    }, MAZE_CONFIG.buildTime);
  } else {
    while (MAP_INFO.currentCell) {
      MAP_INFO.currentCell = build(MAP_INFO.currentCell);
    }
    finishBuild();
  }
};

const finishBuild = () => {
  if (MAZE_CONFIG.clearRandomCells) clearRandomCells();
  console.log(
    `built in ${new Date().getTime() - TIME.lastTime.getTime()} milliseconds`
  );
  startSolve();
};

/**
 * @param {import("./infos.js").Cell} c
 */
const buildFilter = (c) => !!c && !c.visited;

/**
 * @param {import("./infos.js").Cell} cell
 */
const build = (cell) => {
  cell.visited = true;
  const nextCell = getNextCell(cell, buildFilter);

  if (!nextCell) return null;

  const adjacentIndex = getNextCellAdjacentIndex(cell, nextCell);
  const nextAdjacentIndex = getNextCellAdjacentIndex(nextCell, cell);
  cell.borders[adjacentIndex] = false;
  nextCell.borders[nextAdjacentIndex] = false;

  return nextCell;
};

const clearRandomCells = () => {
  const rows = getRows();
  const columns = getNumCellsPerRow(0);

  const numCells = Math.ceil((rows * columns) / ((rows + columns) / 1.25));

  for (let i = 0; i <= numCells; i++) {
    const randomI = getRandomInt(rows - 2) + 1;
    const randomJ = getRandomInt(getNumCellsPerRow(randomI) - 2) + 1;
    const cell = GRID[randomI][randomJ];

    const indexes = cell.adjacentIndexes[CONFIG.poliSizes];
    for (let index = 0; index < indexes.length; index++) {
      const [aI, aJ] = indexes[index];
      const nextCell = GRID[aI]?.[aJ];
      if (nextCell) {
        const nextAdjacentIndex = getNextCellAdjacentIndex(nextCell, cell);
        cell.borders[index] = false;
        nextCell.borders[nextAdjacentIndex] = false;
        if (MAZE_CONFIG.solveTime) {
          drawCell(cell);
          drawCell(nextCell);
        }
      }
    }
  }
};

const getLastCell = () =>
  GRID[POLI_INFO[CONFIG.poliSizes].rows - 1][
    POLI_INFO[CONFIG.poliSizes].columns - 1
  ];

const isSolved = () =>
  !MAP_INFO.currentCell ||
  (CONFIG.isCircle
    ? MAP_INFO.currentCell.pos.i === CIRCLE_INFO.rows - 1
    : MAP_INFO.currentCell === getLastCell());

const startSolve = () => {
  TIME.lastTime = new Date();

  MAZE_INFO.state = STATES.solve;
  MAP_INFO.currentCell = GRID[0][0];

  if (CONFIG.moveManually) {
    if (!MAZE_CONFIG.buildTime) drawEveryCell();
    return;
  }

  if (MAZE_CONFIG.solveTime) {
    if (!MAZE_CONFIG.buildTime) drawEveryCell();
    const intr = setInterval(() => {
      const oldCell = MAP_INFO.currentCell;
      MAP_INFO.currentCell = solve(MAP_INFO.currentCell);
      if (isSolved()) {
        finish();
        return clearInterval(intr);
      }
      drawCell(oldCell);
      drawCell(MAP_INFO.currentCell);
    }, MAZE_CONFIG.solveTime);
  } else {
    while (!isSolved()) {
      MAP_INFO.currentCell = solve(MAP_INFO.currentCell);
    }
    finish();
  }
};

/**
 * @param {import("./infos.js").Cell} cell
 */
const solveFilterMaker = (cell) => (c) => {
  if (!c || c.solved) return false;
  const nextIndex = getNextCellAdjacentIndex(cell, c);
  return !cell.borders[nextIndex];
};

/**
 * @param {import("./infos.js").Cell} cell
 */
const solve = (cell) => {
  if (!cell) return;

  cell.solved = true;
  cell.path = true;
  const prevLength = MAZE_INFO.queue.length;

  const nextCell = getNextCell(cell, solveFilterMaker(cell));
  if (prevLength > MAZE_INFO.queue.length) {
    cell.path = false;
  }

  return nextCell;
};

const finish = () => {
  const rows = getRows();
  const columns = getNumCellsPerRow(0);
  const steps = MAZE_INFO.queue.length;
  const percentage = (steps * 100) / (rows * columns);

  console.log(
    `solved in ${
      new Date().getTime() - TIME.lastTime.getTime()
    } milliseconds (total ${
      new Date().getTime() - TIME.startTime.getTime()
    }), with ${steps} steps ${percentage}% of the maze`
  );
  TIME.lastTime = new Date();

  MAP_INFO.currentCell = MAP_INFO.currentCell || getLastCell();

  MAZE_INFO.state = STATES.show;
  drawEveryCell();

  console.log(
    `showed in ${
      new Date().getTime() - TIME.lastTime.getTime()
    } milliseconds (total ${new Date().getTime() - TIME.startTime.getTime()})`
  );
  TIME.lastTime = new Date();
};

/**
 * @param {import("./infos.js").Cell} cell
 * @param {(c: import("./infos.js").Cell) => boolean} cellFilter
 */
const getNextCell = (cell, cellFilter) => {
  const aCells = cell.adjacentIndexes[CONFIG.poliSizes]
    .map(([ai, aj]) => GRID[ai]?.[aj])
    .filter(cellFilter);

  if (!aCells.length) {
    if (!MAZE_INFO.queue.length) return null;
    const prevPos = MAZE_INFO.queue.pop();
    return GRID[prevPos.i][prevPos.j];
  }

  MAZE_INFO.queue.push(cell.pos);

  return aCells[
    MAZE_INFO.state === STATES.build
      ? getRandomInt(aCells.length)
      : aCells.length - 1
  ];
};

/**
 * @param {import("./infos.js").Cell} cell
 * @param {import("./infos.js").Cell} nextCell
 */
const getNextCellAdjacentIndex = (cell, nextCell) => {
  let nextIndex = 0;
  const indexes = cell.adjacentIndexes[CONFIG.poliSizes];
  while (nextIndex < indexes.length) {
    const [i, j] = indexes[nextIndex];
    if (nextCell.pos.i === i && nextCell.pos.j === j) {
      break;
    }
    nextIndex++;
  }

  return nextIndex;
};

/**
 * @param {import("./infos.js").Cell} oldCell
 * @param {import("./infos.js").Cell} nextCell
 */
export const move = (oldCell, nextCell) => {
  const prevCell = MAZE_INFO.queue[MAZE_INFO.queue.length - 1];

  if (nextCell.pos === prevCell) {
    oldCell.path = false;
    MAZE_INFO.queue.pop();
  } else {
    oldCell.path = true;
    MAZE_INFO.queue.push(oldCell.pos);
  }

  drawCell(oldCell);
  drawCell(MAP_INFO.currentCell);
  if (isSolved()) finish();
};
