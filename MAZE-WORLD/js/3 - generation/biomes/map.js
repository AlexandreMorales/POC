import { GENERATION_CONFIG } from "../configs.js";

let BIOME_MAPS = /** @type {Biome[][]} */ ([]);

export const resetBiomes = () => (BIOME_MAPS = []);

/**
 * @param {Pos} pos
 * @param {Biome} biome
 */
export const addBiomeToMap = ({ i, j }, biome) => {
  let nI = i / GENERATION_CONFIG.chunkSize;
  let nJ = j / GENERATION_CONFIG.chunkSize;
  if (!BIOME_MAPS[nI]) BIOME_MAPS[nI] = [];
  if (BIOME_MAPS[nI][nJ]) return;
  BIOME_MAPS[nI][nJ] = biome;
};

export const getBiomeMap = () => BIOME_MAPS;
