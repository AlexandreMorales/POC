/**
 * @typedef {Object} BlockProps
 * @property {number} max
 */

/**
 * @typedef {Block & BlockProps} BlockEntity
 */

/**
 * @typedef {Object} Biome
 * @property {BlockEntity[]} ranges
 * @property {number} maxDistance The max distance from 0,0 for this biome to appear
 * @property {number} maxValue The max value from perlin noise for this biome to appear
 * @property {Block} higherGroundBlock
 * @property {Color} mapColor
 * @property {string} name
 */
