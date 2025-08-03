import { ENTITY_TYPES } from "../configs.js";
import { addEnemy } from "./enemy.js";
import { addTree } from "./tree.js";

/**
 * @param {string} entityType
 * @param {Cell} cell
 */
export const spawnEntity = (entityType, cell) => {
  switch (entityType) {
    case ENTITY_TYPES.TREE:
      return addTree(cell);
    case ENTITY_TYPES.ENEMY:
      return addEnemy(cell);
  }
};
