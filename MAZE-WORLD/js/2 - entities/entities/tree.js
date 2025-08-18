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
  [IMG_MAP_TYPES.DESERT]: {
    [MOVEMENT.UP]: "images/map/tree-desert.png",
    [MOVEMENT.DOWN]: "images/map/tree-desert.png",
    [MOVEMENT.LEFT]: "images/map/tree-desert.png",
    [MOVEMENT.RIGHT]: "images/map/tree-desert.png",
  },
  [IMG_MAP_TYPES.SNOW]: {
    [MOVEMENT.UP]: "images/map/tree-snow.png",
    [MOVEMENT.DOWN]: "images/map/tree-snow.png",
    [MOVEMENT.LEFT]: "images/map/tree-snow.png",
    [MOVEMENT.RIGHT]: "images/map/tree-snow.png",
  },
});

/**
 * @param {Cell} cell
 */
export const addTree = (cell) => {
  const treeEntity = createEntity(
    cell,
    `${cell.pos.i}_${cell.pos.j}`,
    ENTITY_TYPES.TREE,
    TREE_IMG_MAP,
    { isGenerated: true, defaultImgMapType: cell.block?.defaultImgMapType }
  );
  if (cell.block.isFluid) getInBoat(treeEntity);
};
