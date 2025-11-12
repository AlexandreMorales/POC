/**
 * @typedef {Object} Point
 * @property {number} x
 * @property {number} y
 */

/**
 * @typedef {Object} Entity
 * @property {string} group
 * @property {string} type
 * @property {string[]} kills
 * @property {number} speed
 * @property {HTMLElement} [element]
 * @property {Point} [pointTop]
 * @property {Point} [pointBottom]
 * @property {number} [killCount]
 * @property {{ minKills: number, evolution: string }} [evolution]
 */
