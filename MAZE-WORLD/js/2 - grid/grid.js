import { POLY_INFO } from "../0 - configs/infos.js";
import { correctRoundError } from "../1 - utils/utils.js";

import { GRID_INFO } from "./infos.js";

let GRID = /** @type {import("../0 - configs/infos.js").Cell[][]} */ ([]);

/**
 * @param {import("../0 - configs/infos.js").Pos} pos
 * @return {import("../0 - configs/infos.js").Cell}
 */
export const getCell = ({ i, j }) => GRID[i]?.[j];

/**
 * @param {import("../0 - configs/infos.js").Pos} pos
 * @param {import("../0 - configs/infos.js").Cell} cell
 */
export const addCell = ({ i, j }, cell) => {
  GRID[i] = GRID[i] || [];
  GRID[i][j] = cell;
};

export const resetGrid = () => (GRID = []);

/**
 * @param {import("../0 - configs/infos.js").Pos} pos
 * @param {boolean} isInverted
 * @param {import("../0 - configs/infos.js").Cell} baseCell
 * @return {import("../0 - configs/infos.js").Point}
 */
export const calculatePointBasedOnPos = ({ i, j }, isInverted, baseCell) => {
  const { calcX, calcY, ySide, shouldIntercalate } =
    POLY_INFO[GRID_INFO.currentPoly];
  i -= GRID_INFO.iOffset || 0;
  j -= GRID_INFO.jOffset || 0;

  let x = calcX(j);
  let y = calcY(i);

  if (shouldIntercalate && j % 2) y += baseCell?.pos.j % 2 ? -ySide : ySide;

  return applyRotation({ x, y }, isInverted, baseCell);
};

/**
 * @param {import("../0 - configs/infos.js").Point} points
 * @param {boolean} isInverted
 * @param {import("../0 - configs/infos.js").Cell} baseCell
 * @return {import("../0 - configs/infos.js").Point}
 */
const applyRotation = ({ x, y }, isInverted, baseCell) => {
  if (!GRID_INFO.rotationTurns) return { x, y };

  const { cx, cy, ySide, xSide, hasInverted } =
    POLY_INFO[GRID_INFO.currentPoly];

  const angle = (360 / GRID_INFO.currentPoly) * GRID_INFO.rotationTurns;
  const radians = (Math.PI / 180) * angle;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  // x' = x * cos(θ) - y * sin(θ)
  let nx = correctRoundError(cos * (x - cx) + sin * (y - cy) + cx);
  // y' = x * sin(θ) + y * cos(θ)
  let ny = correctRoundError(cos * (y - cy) - sin * (x - cx) + cy);

  if (hasInverted && isInverted !== baseCell?.isInverted && angle) {
    const oddTurn = !!(GRID_INFO.rotationTurns % 2);
    ny += ySide * (baseCell?.isInverted ? 1 : -1);
    nx += (xSide / 2) * (baseCell?.isInverted === oddTurn ? -1 : 1);
  }

  return { x: nx, y: ny };
};
