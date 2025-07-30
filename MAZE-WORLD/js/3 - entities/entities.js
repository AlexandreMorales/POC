import { POLY_INFO } from "../0 - configs/infos.js";
import { getMod, isPointOutsideCanvas } from "../1 - utils/utils.js";
import { GRID_INFO } from "../2 - grid/infos.js";
import { calculatePointBasedOnPos, GRID } from "../2 - grid/grid.js";

import { MOVEMENT } from "./infos.js";
import { PLAYER_ENTITY } from "./player.js";

const ENTITIES_CONFIG = {
  notInvertedBothClipPath: "polygon(0 0, 50% 75%, 100% 0)",
  notInvertedRightClipPath: "polygon(0 0, 0 100%, 35% 100%, 100% 0)",
  notInvertedLeftClipPath: "polygon(0 0, 65% 100%, 100% 100%, 100% 0)",

  defaultSizeRatio: 2.5,
  wallSizeRatio: 2,
};

const container = document.getElementById("entities");

const ENTITIES = /** @type {Set<import("./infos.js").Entity>} */ (new Set());

/**
 * @param {string} name
 * @param {import("./infos.js").ImageMap} imageMap
 * @returns {HTMLImageElement}
 */
const createEntityImage = (name, imageMap) => {
  const img = document.createElement("img");
  img.id = name;
  img.style.zIndex = "1";
  img.src = imageMap[MOVEMENT.RIGHT];
  container.appendChild(img);
  setImgSize(img);
  return img;
};

/**
 * @param {import("./infos.js").Entity} entity
 * @param {import("../0 - configs/infos.js").Cell} cell
 */
export const moveEntityToCell = (entity, cell) => {
  if (entity.cell) entity.cell.entityName = null;
  entity.cell = cell;
  entity.cell.entityName = entity.name;
};

/**
 * @param {import("../0 - configs/infos.js").Cell} cell
 * @param {string} name
 * @param {import("./infos.js").ImageMap} imageMap
 * @param {Partial<import("./infos.js").Entity>} entityParams
 * @returns {import("./infos.js").Entity}
 */
export const createEntity = (cell, name, imageMap, entityParams = {}) => {
  const entity = /** @type {import("./infos.js").Entity} */ ({
    img: createEntityImage(name, imageMap),
    name,
    imageMap,
    connectedEntities: {},
    ...entityParams,
  });
  moveEntityToCell(entity, cell);
  ENTITIES.add(entity);
  return entity;
};

/**
 * @param {import("./infos.js").Entity} entity
 */
export const updateEntityPoint = (entity) => {
  const { hasInverted, canvasHeight, canvasWidth } =
    POLY_INFO[GRID_INFO.currentPoly];
  const point = calculatePointBasedOnPos(
    entity.cell.pos,
    hasInverted && entity.cell.isInverted,
    PLAYER_ENTITY.cell
  );

  if (isPointOutsideCanvas(point, canvasHeight, canvasWidth)) {
    if (entity.img) {
      container.removeChild(entity.img);
      entity.img = null;
    }
  } else if (!entity.img) {
    entity.img = createEntityImage(entity.name, entity.imageMap);
  }

  if (entity.img) setEntityPoint(entity, point);
};

/**
 * @param {HTMLImageElement} img
 */
const setImgSize = (img) => {
  if (!img) return;
  const { ySide } = POLY_INFO[GRID_INFO.currentPoly];
  img.style.height = img.style.width = `${Math.round(
    ySide * ENTITIES_CONFIG.defaultSizeRatio
  )}px`;
};

/**
 * @param {import("./infos.js").Entity} entity
 */
const setEntityToCenter = (entity) => {
  const { cx, cy } = POLY_INFO[GRID_INFO.currentPoly];
  setEntityPoint(entity, { x: cx, y: cy });
};

/**
 * @param {import("./infos.js").Entity} entity
 * @param {import("../0 - configs/infos.js").Point} point
 */
const setEntityPoint = (entity, point) => {
  const { ySide } = POLY_INFO[GRID_INFO.currentPoly];
  entity.img.style.top = `${point.y - ySide * 2}px`;
  entity.img.style.left = `${point.x - ySide * 1.25}px`;
};

export const resetEntities = () =>
  [PLAYER_ENTITY, ...ENTITIES].forEach((e) => {
    setImgSize(e.img);
  });

export const updateEntities = () => {
  const connectedEntities = /** @type {Set<import("./infos.js").Entity>} */ (
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
 * @param {import("./infos.js").Entity} entity
 */
export const verifyEntityHeight = (entity) => {
  if (!entity?.cell || !entity?.img) return;

  const { ySide, hasInverted } = POLY_INFO[GRID_INFO.currentPoly];

  let downI = GRID_INFO.rotationTurns + Math.floor(GRID_INFO.currentPoly / 2);
  if (hasInverted && entity.cell.isInverted) downI = GRID_INFO.rotationTurns;
  downI = getMod(downI, GRID_INFO.currentPoly);
  const downPos = entity.cell.adjacentPos[GRID_INFO.currentPoly][downI];
  const downCell = GRID[downPos.i]?.[downPos.j];

  let height = ySide * ENTITIES_CONFIG.defaultSizeRatio;
  entity.img.style.clipPath = null;

  const connectedEntities = /** @type {import("./infos.js").Entity[]} */ (
    Object.values(entity.connectedEntities)
  );
  if (hasInverted && !entity.cell.isInverted) {
    const rightCell = downCell;

    let leftI = GRID_INFO.rotationTurns + GRID_INFO.currentPoly - 1;
    leftI = getMod(leftI, GRID_INFO.currentPoly);
    const leftPos = entity.cell.adjacentPos[GRID_INFO.currentPoly][leftI];
    const leftCell = GRID[leftPos.i]?.[leftPos.j];

    let clipPath = null;

    if (rightCell.wall && leftCell.wall) {
      clipPath = ENTITIES_CONFIG.notInvertedBothClipPath;
    } else if (rightCell.wall) {
      clipPath = ENTITIES_CONFIG.notInvertedRightClipPath;
    } else if (leftCell.wall) {
      clipPath = ENTITIES_CONFIG.notInvertedLeftClipPath;
    }

    entity.img.style.clipPath = clipPath;
    // TODO: Implement direction on entity to know where to cut
  } else if (downCell.wall || connectedEntities.length) {
    height = ySide * ENTITIES_CONFIG.wallSizeRatio;
  }

  entity.img.style.height = `${Math.round(height)}px`;
};
