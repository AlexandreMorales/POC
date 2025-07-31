/**
 * @typedef {{ [k: symbol]: string }} ImageMap
 */

/**
 * @typedef {Object} EntityMovementOptions
 * @property {string[]} [targets] List of entity types that the entity will try to go to the nearest
 * @property {number} speed Blocks per turn that it can move
 */

/**
 * @typedef {Object} Entity
 * @property {string} id
 * @property {string} type
 * @property {HTMLImageElement} img
 * @property {Cell} cell
 * @property {ImageMap} imageMap
 * @property {{ [k: string]: Entity }} [connectedEntities]
 * @property {symbol[]} [movementsToCut]
 * @property {EntityMovementOptions} [movementOptions]
 *
 * @property {number} [selectedCellIndex] Cell in which the player can interact
 * @property {CellBlock[]} [pickedCells] Cells that the play dug
 */
