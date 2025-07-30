import { calculatePointBasedOnPos, GRID } from "../grid/grid.js";
import { POLY_INFO } from "../configs/infos.js";
import { getMod, isPointOutsideCanvas } from "../utils.js";
import { MOVEMENT } from "./infos.js";
import { MAP_INFO } from "../grid/infos.js";
import { PLAYER_ENTITY, PLAYER_NAME } from "./player.js";

const ENTITIES_CONFIG = {
  notInvertedBothClipPath: "polygon(0 0, 50% 75%, 100% 0)",
  notInvertedRightClipPath: "polygon(0 0, 0 100%, 35% 100%, 100% 0)",
  notInvertedLeftClipPath: "polygon(0 0, 65% 100%, 100% 100%, 100% 0)",

  defaultSizeRatio: 2.5,
  wallSizeRatio: 2,
};

const container = document.getElementById("entities");

const ENTITIES =
  /** @type {{ [k: string]: import("./infos.js").Entity }} */ ({});

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
  return img;
};

/**
 * @param {import("../configs/infos.js").Cell} cell
 * @param {string} name
 * @param {import("./infos.js").ImageMap} imageMap
 * @param {Partial<import("./infos.js").Entity>} entityParams
 * @returns {import("./infos.js").Entity}
 */
export const createEntity = (cell, name, imageMap, entityParams = {}) => {
  const entity = /** @type {import("./infos.js").Entity} */ ({
    img: createEntityImage(name, imageMap),
    name,
    cell,
    imageMap,
    connectedEntities: {},
    ...entityParams,
  });
  ENTITIES[entity.name] = entity;
  return entity;
};

/**
 * @param {import("./infos.js").Entity} entity
 */
export const updateEntityPoint = (entity) => {
  const { ySide, hasInverted, cx, cy, canvasHeight, canvasWidth } =
    POLY_INFO[MAP_INFO.currentPoly];
  let point = { x: cx, y: cy };
  const entityName = entity.name.replace(`${PLAYER_NAME}_`, "");

  if (!PLAYER_ENTITY.connectedEntities[entityName]) {
    point = calculatePointBasedOnPos(
      entity.cell.pos,
      hasInverted && entity.cell.isInverted,
      PLAYER_ENTITY
    );

    if (isPointOutsideCanvas(point, canvasHeight, canvasWidth)) {
      if (entity.img) {
        container.removeChild(entity.img);
        entity.img = null;
      }
    } else if (!entity.img) {
      entity.img = createEntityImage(entity.name, entity.imageMap);
    }
  }

  if (entity.img) {
    entity.img.style.top = `${point.y - ySide * 2}px`;
    entity.img.style.left = `${point.x - ySide * 1.25}px`;
  }
};

/**
 * @param {import("./infos.js").Entity} entity
 */
export const updateEntitySize = (entity) => {
  const { ySide, cx, cy } = POLY_INFO[MAP_INFO.currentPoly];
  entity.img.style.height = entity.img.style.width = `${Math.round(
    ySide * ENTITIES_CONFIG.defaultSizeRatio
  )}px`;
  entity.img.style.top = `${cy - ySide * 2}px`;
  entity.img.style.left = `${cx - ySide * 1.25}px`;
};

export const resetEntities = () => getAllEntities().forEach(updateEntitySize);

/**
 * @returns {import("./infos.js").Entity[]}
 */
export const getEntities = () => Object.values(ENTITIES);

/**
 * @returns {import("./infos.js").Entity[]}
 */
export const getAllEntities = () => [PLAYER_ENTITY, ...getEntities()];

export const updateEntities = () => {
  getAllEntities().forEach((e) => {
    updateEntityPoint(e);
    verifyEntityHeight(e);
  });
};

/**
 * @param {import("./infos.js").Entity} entity
 */
export const verifyEntityHeight = (entity) => {
  if (!entity?.cell || !entity?.img) return;

  const { ySide, hasInverted } = POLY_INFO[MAP_INFO.currentPoly];
  let downI = MAP_INFO.rotationTurns + Math.floor(MAP_INFO.currentPoly / 2);

  if (hasInverted && entity.cell.isInverted) downI = MAP_INFO.rotationTurns;

  downI = getMod(downI, MAP_INFO.currentPoly);
  const downPos = entity.cell.adjacentPos[MAP_INFO.currentPoly][downI];
  const downCell = GRID[downPos.i]?.[downPos.j];

  let height = ySide * ENTITIES_CONFIG.defaultSizeRatio;
  entity.img.style.clipPath = null;

  const connectedEntities = /** @type {import("./infos.js").Entity[]} */ (
    Object.values(entity.connectedEntities)
  );
  if (hasInverted && !entity.cell.isInverted) {
    const rightCell = downCell;

    let leftI = MAP_INFO.rotationTurns + MAP_INFO.currentPoly - 1;
    leftI = getMod(leftI, MAP_INFO.currentPoly);
    const leftPos = entity.cell.adjacentPos[MAP_INFO.currentPoly][leftI];
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
  } else if (
    downCell.wall ||
    connectedEntities.find((e) => !!e.movementsToCut?.length)
  ) {
    height = ySide * ENTITIES_CONFIG.wallSizeRatio;
  }

  entity.img.style.height = `${Math.round(height)}px`;
};
