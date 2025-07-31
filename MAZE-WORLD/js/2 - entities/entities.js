import { getCell } from "../0 - grid/index.js";
import {
  calculatePointBasedOnPos,
  getPolyInfo,
  POLY_INFO,
} from "../1 - polygones/index.js";
import { getMod, isPointOutsideCanvas } from "../utils.js";

import { MOVEMENT } from "./configs.js";
import { PLAYER_ENTITY } from "./player.js";

const ENTITIES_CONFIG = {
  notInvertedBothClipPath: "polygon(0 0, 50% 75%, 100% 0)",
  notInvertedRightClipPath: "polygon(0 0, 0 100%, 35% 100%, 100% 0)",
  notInvertedLeftClipPath: "polygon(0 0, 65% 100%, 100% 100%, 100% 0)",

  defaultSizeRatio: 2.5,
  wallSizeRatio: 2,
};

const container = document.getElementById("entities");

const ENTITIES = /** @type {Set<Entity>} */ (new Set());

/**
 * @param {string} id
 * @param {ImageMap} imageMap
 * @param {Partial<Entity>} entityParams
 * @returns {HTMLImageElement}
 */
const createEntityImage = (id, imageMap, entityParams) => {
  const img = document.createElement("img");
  img.id = id;
  img.style.zIndex = entityParams.movementsToCut ? "1" : "2";
  img.src = imageMap[MOVEMENT.RIGHT];
  container.appendChild(img);
  setImgSize(img);
  return img;
};

/**
 * @param {Entity} entity
 * @param {Cell} cell
 */
export const moveEntityToCell = (entity, cell) => {
  const previousType = entity.cell?.entityType || cell.entityType;
  if (entity.cell) entity.cell.entityType = null;
  entity.cell = cell;
  entity.cell.entityType = previousType || entity.type;
  updateEntityPoint(entity);
  verifyEntityHeight(entity);
};

/**
 * @param {Entity} entity
 */
export const removeEntityImage = (entity) => {
  container.removeChild(entity.img);
  entity.img = null;
};

/**
 * @param {Entity} entity
 */
export const removeEntity = (entity) => {
  entity.cell.entityType = null;
  removeEntityImage(entity);
  ENTITIES.delete(entity);
};

/**
 * @param {Cell} cell
 * @returns {Entity[]}
 */
export const removeEntitiesFromCell = (cell) => {
  const removedEntities = /** @type {Entity[]} */ ([]);
  ENTITIES.forEach((entity) => {
    if (entity.cell === cell) {
      removeEntity(entity);
      removedEntities.push(entity);
    }
  });
  return removedEntities;
};

/**
 * @param {Cell} cell
 * @param {string} id
 * @param {string} type
 * @param {ImageMap} imageMap
 * @param {Partial<Entity>} entityParams
 * @returns {Entity}
 */
export const createEntity = (cell, id, type, imageMap, entityParams = {}) => {
  id = `${type}_${id}`;
  const entity = /** @type {Entity} */ ({
    img: createEntityImage(id, imageMap, entityParams),
    id,
    type,
    imageMap,
    connectedEntities: {},
    ...entityParams,
  });
  moveEntityToCell(entity, cell);
  ENTITIES.add(entity);
  return entity;
};

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

  if (isPointOutsideCanvas(point, canvasHeight, canvasWidth)) {
    if (entity.img) removeEntityImage(entity);
  } else if (!entity.img) {
    entity.img = createEntityImage(entity.id, entity.imageMap, entity);
  }

  if (entity.img) setEntityPoint(entity, point);
};

/**
 * @param {HTMLImageElement} img
 */
const setImgSize = (img) => {
  if (!img) return;
  const { ySide } = getPolyInfo();
  img.style.height = img.style.width = `${Math.round(
    ySide * ENTITIES_CONFIG.defaultSizeRatio
  )}px`;
};

/**
 * @param {Entity} entity
 */
const setEntityToCenter = (entity) => {
  const { cx, cy } = getPolyInfo();
  setEntityPoint(entity, { x: cx, y: cy });
};

/**
 * @param {Entity} entity
 * @param {Point} point
 */
const setEntityPoint = (entity, point) => {
  const { ySide } = getPolyInfo();
  entity.img.style.top = `${point.y - ySide * 2}px`;
  entity.img.style.left = `${point.x - ySide * 1.25}px`;
};

export const resetEntities = () =>
  [PLAYER_ENTITY, ...ENTITIES].forEach((e) => {
    setImgSize(e.img);
  });

export const updateEntities = () => {
  const connectedEntities = /** @type {Set<Entity>} */ (
    new Set(Object.values(PLAYER_ENTITY.connectedEntities))
  );
  setEntityToCenter(PLAYER_ENTITY);
  verifyEntityHeight(PLAYER_ENTITY);

  connectedEntities.forEach((e) => {
    setEntityToCenter(e);
  });
  ENTITIES.forEach((e) => {
    if (!connectedEntities.has(e)) updateEntityPoint(e);
    verifyEntityHeight(e);
  });
};

/**
 * @param {Entity} entity
 * @param {number} index
 * @returns {Pos}
 */
const getPos = (entity, index) =>
  entity.cell.adjacentPos[POLY_INFO.currentPoly][
    getMod(index, POLY_INFO.currentPoly)
  ];

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
  const downPos = getPos(entity, downI);
  const downCell = getCell(downPos);

  if (!downCell) return;

  let height = ySide * ENTITIES_CONFIG.defaultSizeRatio;
  entity.img.style.clipPath = null;

  const connectedEntities = /** @type {Entity[]} */ (
    Object.values(entity.connectedEntities)
  );
  if (hasInverted && !entity.cell.isInverted) {
    const rightCell = downCell;

    const leftI = POLY_INFO.rotationTurns + POLY_INFO.currentPoly - 1;
    const leftPos = getPos(entity, leftI);
    const leftCell = getCell(leftPos);

    let clipPath = null;

    if (rightCell.wall && leftCell.wall) {
      clipPath = ENTITIES_CONFIG.notInvertedBothClipPath;
    } else if (rightCell.wall) {
      clipPath = ENTITIES_CONFIG.notInvertedRightClipPath;
    } else if (leftCell.wall) {
      clipPath = ENTITIES_CONFIG.notInvertedLeftClipPath;
    }

    entity.img.style.clipPath = clipPath;
  } else if (downCell.wall) {
    height = ySide * ENTITIES_CONFIG.wallSizeRatio;
  }

  if (connectedEntities.length) height = ySide * ENTITIES_CONFIG.wallSizeRatio;

  entity.img.style.height = `${Math.round(height)}px`;
};
