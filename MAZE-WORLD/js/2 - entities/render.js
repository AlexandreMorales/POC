import { getCell } from "../0 - grid/index.js";
import {
  calculatePointBasedOnPos,
  getPolyInfo,
  getPosByIndex,
  RENDER_INFO,
} from "../1 - polygones/index.js";

import { isPointOutside } from "../_utils.js";
import { IMG_MAP_TYPES, MOVEMENT } from "./_configs.js";
import { PLAYER_ENTITY } from "./entities/player.js";

const CUT_MOVEMENTS_MAP = {
  [MOVEMENT.UP]: "marginTop",
  [MOVEMENT.DOWN]: "marginTop",
  [MOVEMENT.LEFT]: "marginLeft",
  [MOVEMENT.RIGHT]: "marginRight",
};

const container = document.getElementById("entities");

/**
 * @param {Entity} entity
 */
export const createEntityImage = (entity) => {
  const img = document.createElement("img");
  img.id = entity.id;
  img.style.zIndex = `${entity.zIndex || 2}`;
  img.src = getImgMap(entity, entity.defaultImgMapType)[
    entity.defaultDirection || MOVEMENT.RIGHT
  ];
  img.className = "image";
  container.appendChild(img);
  setEntitySize(img);
  entity.img = img;
};

/**
 * @param {Entity} entity
 */
export const removeEntityImage = (entity) => {
  if (entity.img) container.removeChild(entity.img);
  entity.img = null;
};

/**
 * @param {Entity} entity
 * @param {Point} [parentPoint]
 */
export const updateEntityPoint = (entity, parentPoint) => {
  if (!parentPoint && entity.isConnected) return;

  const { hasInverted, canvasHeight, canvasWidth } = getPolyInfo();
  const point =
    parentPoint ||
    calculatePointBasedOnPos(
      entity.cell.pos,
      hasInverted && entity.cell.isInverted,
      PLAYER_ENTITY.cell
    );

  if (isPointOutside(point, canvasHeight, canvasWidth)) {
    if (entity.img) removeEntityImage(entity);
  } else if (!entity.img) {
    createEntityImage(entity);
  }

  if (entity.img) setImagePoint(entity.img, point);

  verifyEntityHeight(entity);

  Object.values(entity.connectedEntities).forEach((e) =>
    updateEntityPoint(e, point)
  );
};

/**
 * @param {number} [ySide]
 * @return {number}
 */
const getEntitySize = (ySide) =>
  Math.round((ySide || getPolyInfo().ySide) * 2.5);

/**
 * @param {HTMLImageElement} img
 * @param {number} [ySide]
 */
export const setEntitySize = (img, ySide) =>
  img?.style.setProperty("--entity-size", `${getEntitySize(ySide)}px`);

/**
 * @param {HTMLImageElement} img
 * @param {Point} point
 * @param {boolean} [shouldCenter]
 * @param {number} [ySide]
 */
export const setImagePoint = (img, point, shouldCenter, ySide) => {
  if (!point) return;
  const entitySize = getEntitySize(ySide);
  img.style.setProperty(
    "--entity-top",
    `${point.y - entitySize / (shouldCenter ? 2 : 1.25)}px`
  );
  img.style.setProperty("--entity-left", `${point.x - entitySize / 2}px`);
};

/**
 * @param {Entity} entity
 */
const verifyEntityHeight = (entity) => {
  if (!entity?.cell || !entity?.img) return;

  const { hasInverted } = getPolyInfo();

  const downI =
    hasInverted && entity.cell.isInverted
      ? RENDER_INFO.rotationTurns
      : RENDER_INFO.rotationTurns + Math.floor(RENDER_INFO.currentPoly / 2);
  const downPos = getPosByIndex(entity.cell, downI);
  const downCell = getCell(downPos);

  if (!downCell) return;

  entity.img.className = "image";

  const connectedEntities = Object.values(entity.connectedEntities);
  if (hasInverted && !entity.cell.isInverted) {
    const rightCell = downCell;

    const leftI = RENDER_INFO.rotationTurns + RENDER_INFO.currentPoly - 1;
    const leftPos = getPosByIndex(entity.cell, leftI);
    const leftCell = getCell(leftPos);

    if (rightCell.wall && leftCell.wall) {
      entity.img.classList.add("not-inverted-both-walls");
    } else if (rightCell.wall) {
      entity.img.classList.add("not-inverted-right-wall");
    } else if (leftCell.wall) {
      entity.img.classList.add("not-inverted-left-wall");
    }
  } else if (downCell.wall) {
    entity.img.classList.add("behind-wall");
  }

  if (connectedEntities.length) entity.img.classList.add("behind-wall");
};

/**
 * @param {Entity} entity
 * @param {string} imgMapType
 */
const getImgMap = (entity, imgMapType) =>
  entity.imageMap[imgMapType] || entity.imageMap[IMG_MAP_TYPES.DEFAULT];

/**
 * @param {Entity} entity
 * @param {symbol} direction
 * @param {string} [imgMapType]
 */
export const updateEntityImage = (entity, direction, imgMapType) => {
  if (!entity.img) return;

  const newSrc = getImgMap(entity, imgMapType)[direction] || entity.img.src;
  if (!entity.img.src.endsWith(newSrc)) entity.img.src = newSrc;

  entity.img.style.marginTop = null;
  entity.img.style.marginLeft = null;
  entity.img.style.marginRight = null;
};

/**
 * @param {Entity} entity
 * @param {symbol} direction
 */
export const cutEntityImage = (entity, direction) => {
  if (entity.movementsToCut?.length) {
    if (entity.movementsToCut.includes(direction)) {
      const { ySide } = getPolyInfo();
      entity.img.style[CUT_MOVEMENTS_MAP[direction]] = `${ySide}px`;
    }
  }
};
