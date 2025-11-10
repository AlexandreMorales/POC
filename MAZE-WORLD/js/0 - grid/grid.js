let GRID = /** @type {Cell[][]} */ ([]);

export const INITIAL_POS = /** @type {Pos} */ ({ i: 0, j: 0 });

/**
 * @param {Pos} pos
 * @returns {Cell}
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
