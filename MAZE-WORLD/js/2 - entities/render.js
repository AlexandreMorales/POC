import { getCell } from "../0 - grid/index.js";
import {
  calculatePointBasedOnPos,
  getPolyInfo,
  getPosByIndex,
  RENDER_INFO,
} from "../1 - polygones/index.js";

import { PLAYER_CONFIG, PLAYER_ENTITY } from "./entities/index.js";
import { isPointOutside } from "../_utils.js";
import { ENTITY_IMAGES_MAP, IMG_MAP_TYPES, MOVEMENT } from "./_configs.js";

const CUT_MOVEMENTS_MAP = {
  [MOVEMENT.DOWN]: "marginTop",
  [MOVEMENT.LEFT]: "marginLeft",
  [MOVEMENT.RIGHT]: "marginRight",
  [MOVEMENT.UP]: "marginTop",
};

const container = document.getElementById("entities");

/**
 * @returns {HTMLElement}
 */
const createImageElement = () => {
  const img = document.createElement("div");
  img.className = "image";
  return img;
};

/**
 * @param {Entity} entity
 */
export const createEntityImage = (entity) => {
  const img = createImageElement();
  img.id = entity.id;
  img.style.zIndex = `${entity.zIndex || 2}`;
  container.appendChild(img);

  entity.img = img;
  setEntitySize(entity);
};

/**
 * @param {Entity} entity
 * @param {Pos} itemPos
 * @returns {() => void}
 */
export const displayWinAnimation = (entity, itemPos) => {
  const { hasInverted, ySide } = getPolyInfo();
  const point = calculatePointBasedOnPos(
    entity.cell.pos,
    hasInverted && entity.cell.isInverted,
    PLAYER_ENTITY.cell
  );

  const img = createImageElement();
  img.classList.add("won-item");
  img.style.marginTop = `-${ySide}px`;

  setImagePos(img, itemPos);
  container.appendChild(img);

  setEntityImageSize(img, ySide / 2);
  setImagePoint(img, point, false, ySide / 2);

  return () => {
    container.removeChild(img);
  };
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
 * @param {Entity} entity
 */
export const updateEntityOpacity = (entity) => {
  if (!entity?.img || entity?.deleted) return;

  entity.img.style.setProperty(
    "--entity-opacity",
    `${entity.cell.modifier || 1}`
  );
};

/**
 * @param {number} [ySide]
 * @returns {number}
 */
const getEntitySize = (ySide) =>
  Math.round((ySide || getPolyInfo().ySide) * 2.5);

/**
 * @param {HTMLElement} img
 * @param {Pos} pos
 */
export const setImagePos = (img, pos) => {
  img.style.setProperty("--entity-position-i", `${pos.i}`);
  img.style.setProperty("--entity-position-j", `${pos.j}`);
};

/**
 * @param {HTMLElement} img
 * @param {number} [ySide]
 */
export const setEntityImageSize = (img, ySide) => {
  if (!img) return;
  const size = getEntitySize(ySide);
  img.style.setProperty("--entity-size", `${size}px`);
};

/**
 * @param {Entity} entity
 * @param {number} [ySide]
 */
export const setEntitySize = (entity, ySide) => {
  if (!entity?.img) return;
  setEntityImageSize(entity.img, ySide);
  setEntityImageInfo(entity);
};

/**
 * @param {Entity} entity
 */
const setEntityImageInfo = (entity) => {
  const imgInfo = getEntityImageInfo(entity);

  if (!imgInfo.src) {
    entity.img.style.removeProperty("--entity-img");
    entity.img.classList.remove("dont-use-spritesheet");
  }

  if (imgInfo.pos) {
    setImagePos(entity.img, imgInfo.pos);
  } else if (imgInfo.posFn) {
    const pos = imgInfo.posFn(!!entity.leftFootWalk);
    entity.leftFootWalk = !entity.leftFootWalk;
    setImagePos(entity.img, pos);
  } else if (imgInfo.src) {
    entity.img.style.setProperty("--entity-img", `url(${imgInfo.src})`);
    entity.img.classList.add("dont-use-spritesheet");
    setImagePos(entity.img, { i: 0, j: 0 });
  }
};

/**
 * @param {HTMLElement} img
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

  entity.img.classList.remove("not-inverted-both-walls");
  entity.img.classList.remove("not-inverted-right-wall");
  entity.img.classList.remove("not-inverted-left-wall");
  entity.img.classList.remove("behind-wall");

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

  if (Object.values(entity.connectedEntities).length)
    entity.img.classList.add("behind-wall");
};

/**
 * @param {Entity} entity
 * @returns {ImageInfo}
 */
const getEntityImageInfo = (entity) => {
  const typeMap = ENTITY_IMAGES_MAP[entity.type];
  const mapType =
    typeMap[entity.currentImgType] || typeMap[IMG_MAP_TYPES.DEFAULT];

  return (
    mapType[entity.currentDirection || MOVEMENT.DOWN] || mapType[MOVEMENT.DOWN]
  );
};

/**
 * @param {Entity} entity
 * @param {symbol} direction
 * @param {string} [imgMapType]
 */
export const updateEntityImage = (entity, direction, imgMapType) => {
  if (!entity?.img) return;

  entity.currentImgType = imgMapType;
  entity.currentDirection = direction;
  setEntityImageInfo(entity);

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

const playerHealthContainer = document.getElementById("health-container");

export const updatePlayerHearts = () => {
  let currentHealth = PLAYER_ENTITY.health;
  for (let i = 0; i < PLAYER_CONFIG.maxHealth; i++) {
    const heartImg = playerHealthContainer.children[i];
    if (currentHealth) {
      heartImg.classList.add("filled");
      currentHealth--;
    } else {
      heartImg.classList.remove("filled");
    }
  }
};
const initPlayerHealth = () => {
  for (let i = 0; i < PLAYER_CONFIG.maxHealth; i++) {
    const heartImg = createImageElement();
    playerHealthContainer.appendChild(heartImg);
  }
  updatePlayerHearts();
};

initPlayerHealth();
