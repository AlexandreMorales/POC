import { ENTITY_TYPES, IMG_MAP_TYPES, MOVEMENT } from "../_configs.js";
import { createEntity } from "../entities.js";
import { getInBoat } from "./boat.js";

const TREE_IMG_MAP = /** @type {ImageMap} */ ({
  [IMG_MAP_TYPES.DEFAULT]: {
    [MOVEMENT.UP]: "images/map/tree.png",
    [MOVEMENT.DOWN]: "images/map/tree.png",
    [MOVEMENT.LEFT]: "images/map/tree.png",
    [MOVEMENT.RIGHT]: "images/map/tree.png",
  },
});

/**
 * @param {Cell} cell
 * @param {string} [defaultImgMapType]
 */
export const addTree = (cell, defaultImgMapType) => {
  const treeEntity = createEntity(
    cell,
    `${cell.pos.i}_${cell.pos.j}`,
    ENTITY_TYPES.TREE,
    TREE_IMG_MAP,
    { isGenerated: true, defaultImgMapType }
  );
  if (cell.block.isFluid) getInBoat(treeEntity);
};
