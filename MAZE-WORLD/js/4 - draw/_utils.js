import { getPolyInfo } from "../1 - polygones/index.js";

/**
 * @param {CellBlock} block
 * @param {Point} point
 * @param {Partial<Wall> & { layer?: number }} [wallParams]
 * @param {PolyInfoProp} [polyInfo]
 * @return {Wall}
 */
export const blockToWall = (block, point, wallParams = {}, polyInfo) => {
  polyInfo = polyInfo || getPolyInfo();
  const points = wallParams.isInverted
    ? polyInfo.invertedPoints
    : polyInfo.points;
  const layer = wallParams.layer || 0;

  const wallLayer = layer + 1;

  const wallPoints = wallParams.isInverted
    ? polyInfo.wallInvertedPoints
    : polyInfo.wallPoints;

  const commonInfos = {
    color: block.color,
    shoulApplyDark: wallParams.shoulApplyDark,
    pos: wallParams.pos,
    isInverted: wallParams.isInverted,
    isSelectedCell: wallParams.isSelectedCell,
  };

  return {
    ...commonInfos,
    point: { x: point.x, y: point.y - polyInfo.ySide * layer },
    points: wallPoints,
    topInfo: {
      ...commonInfos,
      point: { x: point.x, y: point.y - polyInfo.ySide * wallLayer },
      points,
    },
    borderMap: wallParams.borderMap,
  };
};
