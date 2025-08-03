import { INITIAL_POS, resetGrid } from "../0 - grid/index.js";
import { POLY_INFO, configPolys } from "../1 - polygones/index.js";
import {
  addEntity,
  PLAYER_ENTITY,
  removeGeneratedEntities,
  setEntitiesSize,
} from "../2 - entities/index.js";
import { loadAndGetCell, getCenterCell } from "../3 - generation/index.js";
import {
  resetCanvasSize,
  drawEveryCell,
  updateCanvasCss,
} from "../4 - draw/index.js";
import {
  findAccessibleCell,
  moveCurrentCell,
  resetDirection,
} from "../5 - actions/index.js";
import { debounce } from "../utils.js";

export const start = () => {
  addEntity(PLAYER_ENTITY);
  configPolys();
  resetGrid();
  removeGeneratedEntities();
  setEntitiesSize();
  resetCanvasSize();
  updateCanvasCss();
  resetDirection();

  moveCurrentCell(
    getCenterCell(),
    findAccessibleCell(loadAndGetCell(INITIAL_POS), PLAYER_ENTITY)
  );
  drawEveryCell(PLAYER_ENTITY);
};

export const resetSize = debounce((newSize) => {
  POLY_INFO.cellHeight = newSize || POLY_INFO.cellHeight;
  configPolys();
  setEntitiesSize();
  resetCanvasSize();
  moveCurrentCell(getCenterCell(), PLAYER_ENTITY.cell);
  drawEveryCell(PLAYER_ENTITY);
});
