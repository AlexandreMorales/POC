export const MOVEMENT = {
  UP: Symbol("UP"),
  DOWN: Symbol("DOWN"),
  LEFT: Symbol("LEFT"),
  RIGHT: Symbol("RIGHT"),
};

export const ENTITY_TYPES = {
  PLAYER: "PLAYER",
  BOAT: "BOAT",
  TREE: "TREE",
};

/**
 * @typedef {{ [MOVEMENT.UP]: string, [MOVEMENT.DOWN]: string, [MOVEMENT.LEFT]: string, [MOVEMENT.RIGHT]: string }} ImageMap
 */

/**
 * @typedef {Object} Entity
 * @property {string} id
 * @property {string} type
 * @property {HTMLImageElement} img
 * @property {import("../0 - configs/infos.js").Cell} cell
 * @property {ImageMap} imageMap
 * @property {{ [k: string]: import("./infos.js").Entity }} [connectedEntities]
 * @property {symbol[]} [movementsToCut]
 *
 * @property {number} [selectedCellIndex] Cell in which the player can interact
 * @property {import("../0 - configs/infos.js").CellBlock[]} [pickedCells] Cells that the play dug
 */
