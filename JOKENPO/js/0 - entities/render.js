import { CONFIGS } from "../_configs.js";
import { randomInt } from "../_utils.js";

const battleContainer = document.getElementById("battle-container");
const battleRect = battleContainer.getBoundingClientRect();

/**
 * @returns {number}
 */
export const getEntitySize = () =>
  // divide by 3 because the maount add 1 of each
  Math.sqrt((battleRect.width * battleRect.height) / CONFIGS.amount) / 3;

/**
 * @param {Entity} entity
 * @param {Point} point
 */
export const setEntityPoint = (entity, point) => {
  entity.element.style.setProperty("--entity-top", `${point.y}px`);
  entity.element.style.setProperty("--entity-left", `${point.x}px`);

  const entitySize = getEntitySize();
  entity.pointTop = point;
  entity.pointBottom = { x: point.x + entitySize, y: point.y + entitySize };
};

/**
 * @param {Entity} entity
 */
export const setEntityType = (entity) => {
  if (!entity.element) return;
  entity.element.className = `image`;
  entity.element.classList.add(entity.type);
};

/**
 * @param {Entity} baseEntity
 * @returns {Entity}
 */
export const createEntity = (baseEntity) => {
  const entitySize = getEntitySize();

  const element = document.createElement("DIV");
  element.style.setProperty("--entity-size", `${entitySize}px`);
  battleContainer.appendChild(element);

  const entity = { ...baseEntity, element };
  setEntityType(entity);

  setEntityPoint(entity, {
    x: randomInt(0, battleRect.width - entitySize),
    y: randomInt(0, battleRect.height - entitySize),
  });
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
