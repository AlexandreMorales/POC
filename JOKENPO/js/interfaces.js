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
 * @property {number} size
 * @property {HTMLElement} [element]
 * @property {Point} [pointTop]
 * @property {Point} [pointBottom]
 * @property {number} [killCount]
 * @property {{ minKills: number, evolution: string }} [evolution]
 */

/**
 * @typedef {Entity & { speedX: number, speedY: number }} DvdEntity
 */

/**
 * @typedef {Object} ShopItem
 * @property {string} title
 * @property {(option: number, item: ShopItem) => void} effect
 * @property {number} [chosenValue]
 * @property {number} [value]
 * @property {(option: number) => number} [valueFn]
 * @property {number[]} [options]
 * @property {boolean} [deleted]
 * @property {boolean} [disabled]
 */
