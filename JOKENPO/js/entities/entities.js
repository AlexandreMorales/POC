import { CONFIGS } from "../_configs.js";
import { getRandomValueFromList } from "../_utils.js";
import { ENTITIES, ENTITY_TYPES, PLAYER_ENTITY } from "./_configs.js";
import { createEntity, removeEntity, setEntityType } from "./render.js";

export let entitiesList = /** @type {Entity[]} */ ([]);

/**
 * @param {boolean} withEvolutions
 * @returns {string[]}
 */
const getSpawnableTypes = (withEvolutions = false) => {
  withEvolutions = CONFIGS.withEvolutions && withEvolutions;
  const spawnableTypes = [
    ENTITY_TYPES.ROCK,
    ENTITY_TYPES.PAPER,
    ENTITY_TYPES.SCISSOR,
  ];
  if (withEvolutions)
    spawnableTypes.push(
      ENTITY_TYPES.WATER,
      ENTITY_TYPES.LOG,
      ENTITY_TYPES.FIRE
    );
  if (!CONFIGS.repeatPlayerType) {
    const typeI = spawnableTypes.indexOf(PLAYER_ENTITY.type);
    if (typeI > -1) spawnableTypes.splice(typeI, 1);
    const groupI = spawnableTypes.indexOf(PLAYER_ENTITY.group);
    if (groupI > -1) spawnableTypes.splice(groupI, 1);
  }
  return spawnableTypes;
};

/**
 * @param {boolean} withEvolutions
 */
export const createEntitiesBatch = (withEvolutions) => {
  const spawnableTypes = getSpawnableTypes(withEvolutions);
  for (let i = 0; i < 50; i++) {
    entitiesList.push(
      createEntity(ENTITIES[getRandomValueFromList(spawnableTypes)])
    );
  }
};

export const initEntities = () => {
  entitiesList = [];
  const spawnableTypes = getSpawnableTypes();

  for (let i = 0; i < CONFIGS.amount; i++) {
    for (let j = 0; j < spawnableTypes.length; j++) {
      entitiesList.push(createEntity(ENTITIES[spawnableTypes[j]]));
    }
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
