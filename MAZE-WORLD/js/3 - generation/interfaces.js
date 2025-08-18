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
 * @property {number} minDistance The min distance from 0,0 for this biome to appear
 * @property {number} minValue The min value from perlin noise for this biome to appear
 * @property {boolean} [negativeI]
 * @property {boolean} [negativeJ]
 * @property {Block} higherGroundBlock
 * @property {Color} mapColor
 * @property {string} name
 */
