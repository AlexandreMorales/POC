import {
  battleContainer,
  battleRect,
  getPointDistance,
  randomInt,
} from "../_utils.js";
import { SHOP_CONFIG } from "../shop.js";
import { PLAYER_ENTITY } from "./_configs.js";

/**
 * @returns {number}
 */
const getEntitySize = () =>
  // divide by 3 because the maount add 1 of each
  Math.sqrt((battleRect.width * battleRect.height) / SHOP_CONFIG.initialSpawn) /
  3;

/**
 * @param {Entity} entity
 * @param {Point} point
 */
export const setEntityPoint = (entity, point) => {
  entity.element.style.setProperty("--entity-top", `${point.y}px`);
  entity.element.style.setProperty("--entity-left", `${point.x}px`);

  entity.pointTop = point;
  entity.pointBottom = { x: point.x + entity.size, y: point.y + entity.size };
};

/**
 * @param {Entity} entity
 */
export const setEntityType = (entity) => {
  if (!entity.element) return;
  entity.element.className = `image`;
  entity.element.classList.add(entity.type);

  if (entity === PLAYER_ENTITY) entity.element.classList.add("player");
};

/**
 * @param {Entity} entity
 * @returns {Point}
 */
export const getRandomPointForEntity = (entity) => {
  let point = {
    x: randomInt(0, battleRect.width - entity.size),
    y: randomInt(0, battleRect.height - entity.size),
  };
  if (
    PLAYER_ENTITY.element &&
    entity !== PLAYER_ENTITY &&
    getPointDistance(PLAYER_ENTITY.pointTop, point) <
      (PLAYER_ENTITY.size + entity.size) * 3
  )
    point = getRandomPointForEntity(entity);
  return point;
};

/**
 * @param {number} entitySize
 * @returns {Point}
 */
const getMiddlePoint = (entitySize) => {
  return {
    x: battleRect.width / 2 - entitySize / 2,
    y: battleRect.height / 2 - entitySize / 2,
  };
};

/**
 * @param {Entity} baseEntity
 * @param {boolean} onMiddle
 * @returns {Entity}
 */
export const createEntity = (baseEntity, onMiddle = false) => {
  const entitySize = getEntitySize();

  const element = document.createElement("div");
  element.style.setProperty("--entity-size", `${entitySize}px`);
  battleContainer.appendChild(element);

  const entity = { ...baseEntity, element, size: entitySize };
  setEntityType(entity);

  setEntityPoint(
    entity,
    onMiddle ? getMiddlePoint(entitySize) : getRandomPointForEntity(entity)
  );
  return entity;
};

/**
 * @param {Entity} entity
 */
export const removeEntity = (entity) => {
  battleContainer.removeChild(entity.element);
};

export const clearArena = () => {
  battleContainer.innerHTML = "";
};
