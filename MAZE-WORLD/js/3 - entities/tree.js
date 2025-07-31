import { ENTITY_TYPES, MOVEMENT } from "./infos.js";
import { createEntity } from "./entities.js";
import { toggleBoat } from "./boat.js";

const TREE_IMG_MAP = /** @type {import("./infos.js").ImageMap} */ ({
  [MOVEMENT.UP]: "images/tree.png",
  [MOVEMENT.DOWN]: "images/tree.png",
  [MOVEMENT.LEFT]: "images/tree.png",
  [MOVEMENT.RIGHT]: "images/tree.png",
});

/**
 * @param {import("../0 - configs/infos.js").Cell} cell
 */
export const addTree = (cell) => {
  const treeEntity = createEntity(
    cell,
    `${cell.pos.i}_${cell.pos.j}`,
    ENTITY_TYPES.TREE,
    TREE_IMG_MAP
  );
  if (cell.block.isFluid) toggleBoat(treeEntity);
};
