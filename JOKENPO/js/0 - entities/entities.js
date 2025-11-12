import { ENTITIES } from "./_configs.js";
import { removeEntity, setEntityType } from "./render.js";

export const entitiesList = /** @type {Entity[]} */ ([]);

/**
 * @param {Entity} entityA
 * @param {Entity} entityB
 * @returns {boolean}
 */
export const entitiesTouching = (entityA, entityB) => {
  return (
    ((entityA.pointTop.x >= entityB.pointTop.x &&
      entityA.pointTop.x <= entityB.pointBottom.x) ||
      (entityB.pointTop.x >= entityA.pointTop.x &&
        entityB.pointTop.x <= entityA.pointBottom.x)) &&
    ((entityA.pointTop.y >= entityB.pointTop.y &&
      entityA.pointTop.y <= entityB.pointBottom.y) ||
      (entityB.pointTop.y >= entityA.pointTop.y &&
        entityB.pointTop.y <= entityA.pointBottom.y))
  );
};

/**
 * @param {Entity} entity
 */
const killEntity = (entity) => {
  if (!entity.element) return;
  removeEntity(entity);
  entity.element = null;
  entitiesList.splice(entitiesList.indexOf(entity), 1);
};

/**
 * @param {Entity} entity
 */
const evolveEntity = (entity) => {
  if (!entity.evolution) return;

  if (entity.killCount >= entity.evolution.minKills) {
    let source = ENTITIES[entity.evolution.evolution];
    if (source) {
      Object.assign(entity, source);
      setEntityType(entity);
    }
  }
};

/**
 * @param {Entity} entityA
 * @param {Entity} entityB
 */
export const entityKillEntity = (entityA, entityB) => {
  killEntity(entityB);
  entityA.killCount = (entityA.killCount || 0) + 1;
  evolveEntity(entityA);
};
