export const MOVEMENT = {
  UP: Symbol("UP"),
  DOWN: Symbol("DOWN"),
  LEFT: Symbol("LEFT"),
  RIGHT: Symbol("RIGHT"),
};

/**
 * @typedef {{ [MOVEMENT.UP]: string, [MOVEMENT.DOWN]: string, [MOVEMENT.LEFT]: string, [MOVEMENT.RIGHT]: string }} ImageMap
 */

/**
 * @typedef {Object} Entity
 * @property {string} name
 * @property {HTMLImageElement} img
 * @property {import("../configs/infos.js").Cell} cell
 * @property {ImageMap} imageMap
 * @property {{ [k: symbol]: import("./infos.js").Entity }} [connectedEntities]
 * @property {symbol[]} [movementsToCut]
 *
 * @property {number} [selectedCellIndex] Cell in which the player can interact
 * @property {import("../configs/infos").CellBlock[]} [pickedCells] Cells that the play dug
 */
