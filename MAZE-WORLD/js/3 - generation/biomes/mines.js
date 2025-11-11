import { getCell } from "../../0 - grid/index";
import { RENDER_INFO } from "../../1 - polygones/index";

import { GENERATION_CONFIG } from "../_configs";
import { hexToRgb } from "./_blocks";
import { addPropsToBlock } from "./biomes";

/**
 * @returns {MinesObj}
 */
export const createMinesObj = () => {
  const minefield = /** @type {boolean[][]} */ ([]);

  const MINES_CONFIG = {
    bombsNum: Math.round(GENERATION_CONFIG.chunkSize ** 2 / 4),
  };

  const createField = () => {
    for (let i = 0; i < GENERATION_CONFIG.chunkSize; i++) {
      minefield[i] = [];
      for (let j = 0; j < GENERATION_CONFIG.chunkSize; j++) {
        minefield[i][j] = false;
      }
    }
  };

  const getIndexForBomb = () => {
    const limit = GENERATION_CONFIG.chunkSize - 2;
    return Math.floor(Math.random() * limit) + 1;
  };

  const addBomb = () => {
    const row = getIndexForBomb();
    const column = getIndexForBomb();

    if (minefield[row][column]) return false;

    minefield[row][column] = true;
    return true;
  };

  const addBombs = () => {
    for (let i = 0; i < MINES_CONFIG.bombsNum; i++) {
      if (!addBomb()) i--;
    }
  };

  createField();
  addBombs();

  return {
    isBomb: (pos) => minefield[pos.i][pos.j],
  };
};

export const MINE_BLOCKS = /** @type {{ [k: string]: Block }} */ ({
  MINES_LOW: {
    name: "MINES_LOW",
    color: hexToRgb(" #d3d3d3"),
    layer: 0,
    indestructible: true,
    staticColor: true,
    isFluid: false,
  },
  MINES_HIGH: {
    name: "MINES_HIGH",
    color: hexToRgb(" #d3d3d3"),
    layer: 1,
    staticColor: true,
    isFluid: false,
    onDestroy: (cell) => {
      const aCells =
        cell.adjacentPosWithCorners[RENDER_INFO.currentPoly].map(getCell);
      const isNextToBomb = !!aCells.find((c) => c.hasBomb);

      if (isNextToBomb) return;
      cell.adjacentPosWithCorners[RENDER_INFO.currentPoly]
        .map(getCell)
        .filter((c) => c.wall?.block?.name === "MINES_HIGH" && !c.hasBomb)
        .forEach((c) => {
          const onDestroy = c.wall?.block?.onDestroy;
          c.wall = null;
          if (onDestroy) onDestroy(c);
        });
    },
  },
});

export const MINE_BIOMES = /** @type {{ [k: string]: Biome }} */ ({
  MINES: {
    name: "MINES",
    mapColor: MINE_BLOCKS.MINES_LOW.color,
    minValue: -1,
    minDistance: 0,
    higherGroundBlock: MINE_BLOCKS.MINES_LOW,
    ranges: [addPropsToBlock(MINE_BLOCKS.MINES_HIGH, { max: 1 })],
  },
});
