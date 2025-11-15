import { getPointDistance, movePointTowards } from "../_utils.js";
import { SHOP_CONFIG } from "../shop.js";
import { PLAYER_ENTITY } from "./_configs.js";
import {
  entitiesList,
  entitiesTouching,
  entityKillEntity,
} from "./entities.js";
import { setEntityPoint } from "./render.js";

/**
 * @param {Entity} entity
 * @param {Entity[]} entities
 * @returns {{ target: Entity, distance: number }}
 */
const getClosestTarget = (entity, entities) => {
  let minDistance = Infinity;
  let selectedTarget = /** @type {Entity} */ (null);

  entities.forEach((targetEntity) => {
    entity.kills.forEach((t) => {
      if (targetEntity.type === t) {
        const distance = getPointDistance(
          entity.pointTop,
          targetEntity.pointTop
        );
        if (distance < minDistance) {
          selectedTarget = targetEntity;
          minDistance = distance;
        }
      }
    });
  });
  return { target: selectedTarget, distance: minDistance };
};

const checkTouches = () => {
  const freshEntities = [...entitiesList];
  if (PLAYER_ENTITY.element) freshEntities.push(PLAYER_ENTITY);
  freshEntities.forEach((entityA) => {
    if (!entityA.element) return;
    freshEntities.forEach((entityB) => {
      if (!entityB.element) return;
      if (
        entityA !== entityB &&
        entityA.type !== entityB.type &&
        entitiesTouching(entityA, entityB)
      ) {
        if (entityA.kills.includes(entityB.type))
          entityKillEntity(entityA, entityB);
        if (entityB.kills.includes(entityA.type))
          entityKillEntity(entityB, entityA);
      }
    });
  });
};

export const moveEntities = () => {
  checkTouches();
  const freshEntities = [...entitiesList];
  if (PLAYER_ENTITY.element) freshEntities.push(PLAYER_ENTITY);
  entitiesList.forEach((entity) => {
    const { target, distance } = getClosestTarget(entity, freshEntities);
    if (!target) return;
    setEntityPoint(
      entity,
      movePointTowards(
        entity.pointTop,
        target.pointTop,
        distance,
        (entity.speed * SHOP_CONFIG.allSpeed * entity.size) / 20
      )
    );
  });
};
