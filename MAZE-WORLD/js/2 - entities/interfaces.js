/**
 * @typedef {Object} ImageInfo
 * @property {Pos} [pos]
 * @property {(p: boolean) => Pos} [posFn]
 * @property {string} [src]
 */

/**
 * @typedef {{ [k1: string]: { [k2: string]: { [k3: symbol]: ImageInfo } } }} ImageMap
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
 * @property {HTMLElement} img
 * @property {Cell | null} cell
 * @property {symbol} [currentDirection]
 * @property {string} [currentImgType]
 * @property {number} [leftFootWalk]
 * @property {symbol[]} [movementsToCut]
 * @property {EntityMovementOptions} [movementOptions]
 * @property {number} [minTime] The min time that the entity can be spawn/live
 * @property {number} [zIndex]
 * @property {boolean} [isGenerated]
 *
 * @property {boolean} [deleted]
 *
 * @property {{ [k: string]: Entity }} [connectedEntities]
 * @property {boolean} [isConnected]
 *
 * @property {number} [selectedCellIndex] Cell in which the entity can interact
 */
