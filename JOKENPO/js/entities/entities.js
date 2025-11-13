import { CONFIGS } from "../_configs.js";
import { getRandomValueFromList } from "../_utils.js";
import { ENTITIES, ENTITY_TYPES } from "./_configs.js";
import { createEntity, removeEntity, setEntityType } from "./render.js";

export let entitiesList = /** @type {Entity[]} */ ([]);
const spawnableEntities = [
  ENTITY_TYPES.ROCK,
  ENTITY_TYPES.PAPER,
  ENTITY_TYPES.SCISSOR,
];

export const createEntitiesBatch = () => {
  for (let i = 0; i < 50; i++) {
    entitiesList.push(
      createEntity(ENTITIES[getRandomValueFromList(spawnableEntities)])
    );
  }
};

export const initEntities = () => {
  entitiesList = [];

  for (let i = 0; i < CONFIGS.amount; i++) {
    entitiesList.push(createEntity(ENTITIES[ENTITY_TYPES.ROCK]));
    entitiesList.push(createEntity(ENTITIES[ENTITY_TYPES.PAPER]));
    entitiesList.push(createEntity(ENTITIES[ENTITY_TYPES.SCISSOR]));
  }
};

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
  if (!entity.evolution || !CONFIGS.withEvolutions) return;

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
