import { getCell } from "../0 - grid/index.js";
import {
  calculatePointBasedOnPos,
  getPolyInfo,
  getPosByIndex,
  POLY_INFO,
} from "../1 - polygones/index.js";
import { isPointOutside } from "../utils.js";
import { MOVEMENT } from "./configs.js";
import { PLAYER_ENTITY } from "./player.js";

const ENTITIES_RENDER_CONFIG = {
  notInvertedBothClipPath: "polygon(0 0, 50% 75%, 100% 0)",
  notInvertedRightClipPath: "polygon(0 0, 0 100%, 35% 100%, 100% 0)",
  notInvertedLeftClipPath: "polygon(0 0, 65% 100%, 100% 100%, 100% 0)",

  defaultSizeRatio: 2.5,
  wallSizeRatio: 2,
};

const container = document.getElementById("entities");

/**
 * @param {string} id
 * @param {ImageMap} imageMap
 * @param {Partial<Entity>} entityParams
 * @returns {HTMLImageElement}
 */
export const createEntityImage = (id, imageMap, entityParams) =>
  createImage(
    id,
    `${entityParams.zIndex || 2}`,
    imageMap[entityParams.defaultDirection || MOVEMENT.RIGHT]
  );

/**
 * @param {string} id
 * @param {string} zIndex
 * @param {string} src
 * @returns {HTMLImageElement}
 */
const createImage = (id, zIndex, src) => {
  const img = document.createElement("img");
  img.id = id;
  img.style.zIndex = zIndex;
  img.src = src;
  container.appendChild(img);
  setImgSize(img);
  return img;
};

/**
 * @param {Entity} entity
 */
export const removeEntityImage = (entity) => {
  if (entity.img) removeImage(entity.img);
  entity.img = null;
};

/**
 * @param {HTMLImageElement} img
 */
export const removeImage = (img) => container.removeChild(img);
/**
 * @param {Entity} entity
 */
export const updateEntityPoint = (entity) => {
  const { hasInverted, canvasHeight, canvasWidth } = getPolyInfo();
  const point = calculatePointBasedOnPos(
    entity.cell.pos,
    hasInverted && entity.cell.isInverted,
    PLAYER_ENTITY.cell
  );

  if (isPointOutside(point, canvasHeight, canvasWidth)) {
    if (entity.img) removeEntityImage(entity);
  } else if (!entity.img) {
    entity.img = createEntityImage(entity.id, entity.imageMap, entity);
  }

  if (entity.img) setEntityPoint(entity.img, point);
};

/**
 * @param {HTMLImageElement} img
 */
export const setImgSize = (img) => {
  if (!img) return;
  const { ySide } = getPolyInfo();
  img.style.height = img.style.width = `${Math.round(
    ySide * ENTITIES_RENDER_CONFIG.defaultSizeRatio
  )}px`;
};

/**
 * @param {Entity} entity
 */
export const setEntityToCenter = (entity) => {
  const { cx, cy } = getPolyInfo();
  setEntityPoint(entity.img, { x: cx, y: cy });
};

/**
 * @param {HTMLImageElement} img
 * @param {Point} point
 */
export const setEntityPoint = (img, point) => {
  const { ySide } = getPolyInfo();
  img.style.top = `${point.y - ySide * 2}px`;
  img.style.left = `${point.x - ySide * 1.25}px`;
};

/**
 * @param {Entity} entity
 */
export const verifyEntityHeight = (entity) => {
  if (!entity?.cell || !entity?.img) return;

  const { ySide, hasInverted } = getPolyInfo();

  const downI =
    hasInverted && entity.cell.isInverted
      ? POLY_INFO.rotationTurns
      : POLY_INFO.rotationTurns + Math.floor(POLY_INFO.currentPoly / 2);
  const downPos = getPosByIndex(entity.cell, downI);
  const downCell = getCell(downPos);

  if (!downCell) return;

  let height = ySide * ENTITIES_RENDER_CONFIG.defaultSizeRatio;
  entity.img.style.clipPath = null;

  const connectedEntities = /** @type {Entity[]} */ (
    Object.values(entity.connectedEntities)
  );
  if (hasInverted && !entity.cell.isInverted) {
    const rightCell = downCell;

    const leftI = POLY_INFO.rotationTurns + POLY_INFO.currentPoly - 1;
    const leftPos = getPosByIndex(entity.cell, leftI);
    const leftCell = getCell(leftPos);

    let clipPath = null;

    if (rightCell.wall && leftCell.wall) {
      clipPath = ENTITIES_RENDER_CONFIG.notInvertedBothClipPath;
    } else if (rightCell.wall) {
      clipPath = ENTITIES_RENDER_CONFIG.notInvertedRightClipPath;
    } else if (leftCell.wall) {
      clipPath = ENTITIES_RENDER_CONFIG.notInvertedLeftClipPath;
    }

    entity.img.style.clipPath = clipPath;
  } else if (downCell.wall) {
    height = ySide * ENTITIES_RENDER_CONFIG.wallSizeRatio;
  }

  if (connectedEntities.length)
    height = ySide * ENTITIES_RENDER_CONFIG.wallSizeRatio;

  entity.img.style.height = `${Math.round(height)}px`;
};
