import { CONFIGS } from "../_configs.js";
import { getPointDistance, movePointTowards } from "../_utils.js";
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
  entitiesList.forEach((entity) => {
    const { target, distance } = getClosestTarget(entity, entitiesList);
    if (!target) return;
    setEntityPoint(
      entity,
      movePointTowards(
        entity.pointTop,
        target.pointTop,
        distance,
        (entity.speed * CONFIGS.speed * entity.size) / 20
      )
    );
  });
};
