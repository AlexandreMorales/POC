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
 */

/**
 * @typedef {Object} CellBlock
 * @property {Block} block
 * @property {Color} color
 */

/**
 * @typedef {Object} CellProps
 * @property {number} layer
 * @property {Pos} pos
 * @property {CellBlock} wall The block above this one
 * @property {{ [k: number]: Pos[] }} adjacentPos Pos of adjacent cells
 * @property {boolean} isInverted Only used for triangles
 * @property {string} entityType The type of the entity on top of the cell
 */

/**
 * @typedef {CellBlock & CellProps} Cell
 */
