import { getCell } from "../0 - grid/index.js";
import {
  calculatePointBasedOnPos,
  getPolyInfo,
  getPosByIndex,
  POLY_INFO,
} from "../1 - polygones/index.js";
import { isPointOutside } from "../utils.js";
import { MOVEMENT } from "./configs.js";
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
  img.src = entity.imageMap[entity.defaultDirection || MOVEMENT.RIGHT];
  container.appendChild(img);
  entity.img = img;
  setEntitySize(entity);
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
 * @return {number}
 */
const getEntitySize = () => Math.round(getPolyInfo().ySide * 2.5);

/**
 * @param {Entity} entity
 */
export const setEntitySize = (entity) =>
  entity.img?.style.setProperty("--entity-size", `${getEntitySize()}px`);

/**
 * @param {HTMLImageElement} img
 * @param {Point} point
 */
const setImagePoint = (img, point) => {
  const entitySize = getEntitySize();
  img.style.setProperty("--entity-top", `${point.y - entitySize / 1.25}px`);
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
      ? POLY_INFO.rotationTurns
      : POLY_INFO.rotationTurns + Math.floor(POLY_INFO.currentPoly / 2);
  const downPos = getPosByIndex(entity.cell, downI);
  const downCell = getCell(downPos);

  if (!downCell) return;

  while (entity.img.classList.length > 0)
    entity.img.classList.remove(entity.img.classList.item(0));

  const connectedEntities = /** @type {Entity[]} */ (
    Object.values(entity.connectedEntities)
  );
  if (hasInverted && !entity.cell.isInverted) {
    const rightCell = downCell;

    const leftI = POLY_INFO.rotationTurns + POLY_INFO.currentPoly - 1;
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
 * @param {symbol} direction
 * @param {boolean} [isRunning]
 */
export const updateEntityImage = (entity, direction, isRunning) => {
  if (!entity.img) return;

  let map = entity.imageRunningMap;
  if (!isRunning || !map) map = entity.imageMap;
  entity.img.src = map[direction] || entity.img.src;

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
