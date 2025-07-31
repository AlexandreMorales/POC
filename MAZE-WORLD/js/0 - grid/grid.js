let GRID = /** @type {Cell[][]} */ ([]);

/**
 * @param {Pos} pos
 * @return {Cell}
 */
export const getCell = ({ i, j }) => GRID[i]?.[j];

/**
 * @param {Pos} pos
 * @param {Cell} cell
 */
export const addCell = ({ i, j }, cell) => {
  GRID[i] = GRID[i] || [];
  GRID[i][j] = cell;
};

export const resetGrid = () => (GRID = []);
