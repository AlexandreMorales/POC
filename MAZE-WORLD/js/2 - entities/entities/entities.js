import { ENTITY_TYPES } from "../_configs.js";
import { addEnemy } from "./enemy.js";
import { addRabbit } from "./rabbit.js";
import { addTree } from "./tree.js";

/**
 * @param {string} entityType
 * @param {Cell} cell
 * @param {string} [defaultImgMapType]
 */
export const spawnEntity = (entityType, cell, defaultImgMapType) => {
  switch (entityType) {
    case ENTITY_TYPES.TREE:
      return addTree(cell, defaultImgMapType);
    case ENTITY_TYPES.RABBIT:
      return addRabbit(cell, defaultImgMapType);
    case ENTITY_TYPES.ENEMY:
      return addEnemy(cell, defaultImgMapType);
  }
};
