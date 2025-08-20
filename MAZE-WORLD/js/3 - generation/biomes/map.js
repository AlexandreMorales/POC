import { GENERATION_CONFIG } from "../_configs.js";
import { getChunkStart } from "../_utils.js";

let BIOME_MAPS = /** @type {Biome[][]} */ ([]);

export const resetBiomes = () => (BIOME_MAPS = []);

/**
 * @param {Pos} pos
 * @returns {Pos}
 */
const getPosBiomeOffset = ({ i, j }) => ({
  i: i / GENERATION_CONFIG.chunkSize,
  j: j / GENERATION_CONFIG.chunkSize,
});

/**
 * @param {Pos} pos
 * @param {Biome} biome
 */
export const addBiomeToMap = (pos, biome) => {
  const { i, j } = getPosBiomeOffset(pos);
  if (!BIOME_MAPS[i]) BIOME_MAPS[i] = [];
  if (BIOME_MAPS[i][j]) return;
  BIOME_MAPS[i][j] = biome;
};

/**
 * @param {Pos} pos
 * @returns {Biome}
 */
export const getBiomeFromMap = (pos) => {
  pos = getChunkStart(
    pos,
    GENERATION_CONFIG.chunkSize,
    GENERATION_CONFIG.chunkSize
  );
  const { i, j } = getPosBiomeOffset(pos);
  return BIOME_MAPS[i]?.[j];
};

export const getBiomeMap = () => BIOME_MAPS;
