import { POLY_INFO, POLYS_INFO } from "./infos.js";
import { correctRoundError } from "../utils.js";

export const getPolyInfo = () => POLYS_INFO[POLY_INFO.currentPoly];

/**
 * @param {Pos} pos
 * @param {boolean} isInverted
 * @param {Cell} baseCell
 * @return {Point}
 */
export const calculatePointBasedOnPos = ({ i, j }, isInverted, baseCell) => {
  const { calcX, calcY, ySide, shouldIntercalate } = getPolyInfo();
  i -= POLY_INFO.iOffset || 0;
  j -= POLY_INFO.jOffset || 0;

  let x = calcX(j);
  let y = calcY(i);

  if (shouldIntercalate && j % 2) y += baseCell?.pos.j % 2 ? -ySide : ySide;

  return applyRotation({ x, y }, isInverted, baseCell);
};

/**
 * @param {Point} points
 * @param {boolean} isInverted
 * @param {Cell} baseCell
 * @return {Point}
 */
const applyRotation = ({ x, y }, isInverted, baseCell) => {
  if (!POLY_INFO.rotationTurns) return { x, y };

  const { cx, cy, ySide, xSide, hasInverted } = getPolyInfo();

  const angle = (360 / POLY_INFO.currentPoly) * POLY_INFO.rotationTurns;
  const radians = (Math.PI / 180) * angle;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  // x' = x * cos(θ) - y * sin(θ)
  let nx = correctRoundError(cos * (x - cx) + sin * (y - cy) + cx);
  // y' = x * sin(θ) + y * cos(θ)
  let ny = correctRoundError(cos * (y - cy) - sin * (x - cx) + cy);

  if (hasInverted && isInverted !== baseCell?.isInverted && angle) {
    const oddTurn = !!(POLY_INFO.rotationTurns % 2);
    ny += ySide * (baseCell?.isInverted ? 1 : -1);
    nx += (xSide / 2) * (baseCell?.isInverted === oddTurn ? -1 : 1);
  }

  return { x: nx, y: ny };
};
