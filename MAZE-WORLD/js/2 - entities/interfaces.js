/**
 * @typedef {{ [k: symbol]: string }} ImageMap
 */

/**
 * @typedef {Object} EntityMovementOptions
 * @property {Set<string>} [targets] List of entity types that the entity will try to go to the nearest
 * @property {boolean} [random] If the entity moves randomnly
 * @property {number} speed Blocks per turn that it can move
 */

/**
 * @typedef {Object} Entity
 * @property {string} id
 * @property {string} type
 * @property {HTMLImageElement} img
 * @property {Cell | null} cell
 * @property {ImageMap} imageMap
 * @property {ImageMap} [imageRunningMap]
 * @property {symbol} [defaultDirection]
 * @property {{ [k: string]: Entity }} [connectedEntities]
 * @property {symbol[]} [movementsToCut]
 * @property {EntityMovementOptions} [movementOptions]
 * @property {number} [minTime] The min time that the entity can be spawn/live
 * @property {number} [zIndex]
 * @property {boolean} [isGenerated]
 *
 * @property {boolean} [deleted]
 * @property {boolean} [isConnected]
 *
 * @property {number} [selectedCellIndex] Cell in which the player can interact
 * @property {CellBlock[]} [pickedCells] Cells that the play dug
 */
