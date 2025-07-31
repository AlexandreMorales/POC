import { resetGrid } from "../0 - grid/index.js";
import { POLY_INFO, configPolys, getPolyInfo } from "../1 - polygones/index.js";
import { PLAYER_ENTITY, resetEntities } from "../2 - entities/index.js";
import { loadAndGetCell, getCenterCell } from "../3 - generation/index.js";
import {
  resetCanvasSize,
  drawEveryCell,
  setCanvasSize,
  updateCanvasCss,
} from "../4 - draw/index.js";
import {
  findAccessibleCell,
  moveCurrentCell,
  resetDirection,
} from "../5 - actions/index.js";
import { debounce } from "../utils.js";

export const start = () => {
  configPolys();
  resetGrid();
  resetEntities();
  resetCanvasSize();
  updateCanvasCss();
  resetDirection();

  moveCurrentCell(
    getCenterCell(),
    findAccessibleCell(loadAndGetCell({ i: 0, j: 0 }), PLAYER_ENTITY)
  );
  drawEveryCell(PLAYER_ENTITY.cell);
};

export const resetSize = debounce((newSize) => {
  POLY_INFO.cellHeight = newSize || POLY_INFO.cellHeight;
  configPolys();
  resetEntities();
  setCanvasSize(null, getPolyInfo().canvasWidth);
  moveCurrentCell(getCenterCell(), PLAYER_ENTITY.cell);
  drawEveryCell(PLAYER_ENTITY.cell);
});
