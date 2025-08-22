/**
 * @typedef {Object} SpawnableEntities
 * @property {number} probability
 * @property {string} entityType
 * @property {boolean} [spawnOnMove]
 * @property {boolean} [increaseWithTime]
 */

/**
 * @typedef {Object} Block
 * @property {Color} color
 * @property {number} layer
 * @property {boolean} [isFluid]
 * @property {SpawnableEntities[]} [spawnableEntities]
 * @property {string} [trackType]
 * @property {string} [biomeType]
 */

/**
 * @typedef {Object} CellBlock
 * @property {Block} block
 * @property {Color} color
 */

/**
 * @typedef {Object} CellProps
 * @property {Pos} pos
 * @property {{ [k: number]: Pos[] }} adjacentPos Pos of adjacent cells
 * @property {boolean} isInverted Only used for triangles
 */

/**
 * @typedef {Object} CellWorldProps
 * @property {number} layer
 * @property {CellBlock} wall The block above this one
 * @property {string} entityType The type of the entity on top of the cell
 */

/**
 * @typedef {CellProps & CellBlock & CellWorldProps} Cell
 */
