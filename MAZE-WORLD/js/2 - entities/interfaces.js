/**
 * @typedef {{ [k: symbol]: string }} ImageMap
 */

/**
 * @typedef {Object} EntityMovementOptions
 * @property {Set<string>} [targets] List of entity types that the entity will try to go to the nearest
 * @property {number} speed Blocks per turn that it can move
 */

/**
 * @typedef {Object} Entity
 * @property {string} id
 * @property {string} type
 * @property {HTMLImageElement} img
 * @property {Cell} cell
 * @property {ImageMap} imageMap
 * @property {symbol} [defaultDirection]
 * @property {{ [k: string]: Entity }} [connectedEntities]
 * @property {symbol[]} [movementsToCut]
 * @property {EntityMovementOptions} [movementOptions]
 * @property {number} [minTime] The min time that the entity can be spawn/live
 * @property {boolean} [deleted]
 * @property {number} [zIndex]
 *
 * @property {number} [selectedCellIndex] Cell in which the player can interact
 * @property {CellBlock[]} [pickedCells] Cells that the play dug
 */
