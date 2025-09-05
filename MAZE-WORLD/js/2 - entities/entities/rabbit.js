import { ENTITY_TYPES } from "../_configs.js";
import { createEntity } from "../entities.js";
import { getInBoat } from "./boat.js";

/**
 * @param {Cell} cell
 */
export const addRabbit = (cell) => {
  const rabbitEntity = createEntity(
    cell,
    `${cell.pos.i}_${cell.pos.j}`,
    ENTITY_TYPES.RABBIT,
    {
      isGenerated: true,
      movementOptions: { speed: 1, random: true },
    }
  );
  if (cell.block.isFluid) getInBoat(rabbitEntity);
};
