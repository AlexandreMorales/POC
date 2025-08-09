import { INITIAL_POS, resetGrid } from "../0 - grid/index.js";
import { RENDER_INFO, configPolys } from "../1 - polygones/index.js";
import {
  addEntity,
  PLAYER_ENTITY,
  removeGeneratedEntities,
} from "../2 - entities/index.js";
import { loadAndGetCell, resetBiomes } from "../3 - generation/index.js";
import { resetBiomeMap, updateCanvasCss } from "../4 - draw/index.js";
import {
  findAccessibleCell,
  resetDirection,
  resetMap,
} from "../5 - actions/index.js";
import { debounce } from "../utils.js";

export const start = () => {
  addEntity(PLAYER_ENTITY);
  configPolys();
  resetGrid();
  resetBiomes();
  removeGeneratedEntities();
  updateCanvasCss();
  resetDirection();

  PLAYER_ENTITY.cell = findAccessibleCell(
    loadAndGetCell(INITIAL_POS),
    PLAYER_ENTITY
  );
  resetBiomeMap();
  resetMap();
};

export const resetSize = debounce((newSize) => {
  RENDER_INFO.cellHeight = newSize || RENDER_INFO.cellHeight;
  configPolys();
  resetBiomeMap();
  resetMap();
});
