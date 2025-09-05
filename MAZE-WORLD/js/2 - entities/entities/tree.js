import { ENTITY_TYPES } from "../_configs.js";
import { createEntity } from "../entities.js";
import { getInBoat } from "./boat.js";

/**
 * @param {Cell} cell
 */
export const addTree = (cell) => {
  const treeEntity = createEntity(
    cell,
    `${cell.pos.i}_${cell.pos.j}`,
    ENTITY_TYPES.TREE,
    { isGenerated: true }
  );
  if (cell.block.isFluid) getInBoat(treeEntity);
};
