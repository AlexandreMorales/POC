import { getCell } from "../../0 - grid/index";
import { RENDER_INFO } from "../../1 - polygones/index";
import { hurtEntity } from "../../2 - entities/entities";

import { GENERATION_CONFIG } from "../_configs";
import { hexToRgb, TRACK_TYPES } from "./_blocks";
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

const mineValueColors = [
  "blue",
  "green",
  "red",
  "darkblue",
  "brown",
  "darkred",
  "black",
  "grey",
];

export const MINE_BLOCKS = /** @type {{ [k: string]: Block }} */ ({
  MINES_LOW: {
    name: "MINES_LOW",
    color: hexToRgb(" #d3d3d3"),
    layer: 0,
    indestructible: true,
    staticColor: true,
    isFluid: false,
    trackType: TRACK_TYPES.TRACK9,
    valueOnDraw: (cell) => {
      if (cell.hasBomb) {
        return {
          value: "💣",
          color: "black",
        };
      }

      const aCellsCorner =
        cell.adjacentPosWithCorners[RENDER_INFO.currentPoly].map(getCell);
      const value = aCellsCorner.reduce(
        (acc, c) => (c.hasBomb ? acc + 1 : acc),
        0
      );
      return {
        color: mineValueColors[value - 1],
        value: `${value}`,
      };
    },
  },
  MINES_HIGH: {
    name: "MINES_HIGH",
    color: hexToRgb(" #d3d3d3"),
    layer: 1,
    staticColor: true,
    isFluid: false,
    trackType: TRACK_TYPES.TRACK10,
    onDestroy: (cell, entity) => {
      if (cell.hasBomb) hurtEntity(entity, 1);

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
          if (onDestroy) onDestroy(c, entity);
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
