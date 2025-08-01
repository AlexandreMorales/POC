import { ENTITY_TYPES, MOVEMENT } from "../configs.js";
import { createEntity } from "../entities.js";
import { getInBoat } from "./boat.js";

const TREE_IMG_MAP = /** @type {ImageMap} */ ({
  [MOVEMENT.UP]: "images/map/tree.png",
  [MOVEMENT.DOWN]: "images/map/tree.png",
  [MOVEMENT.LEFT]: "images/map/tree.png",
  [MOVEMENT.RIGHT]: "images/map/tree.png",
});

/**
 * @param {Cell} cell
 */
export const addTree = (cell) => {
  const treeEntity = createEntity(
    cell,
    `${cell.pos.i}_${cell.pos.j}`,
    ENTITY_TYPES.TREE,
    TREE_IMG_MAP
  );
  if (cell.block.isFluid) getInBoat(treeEntity);
};
