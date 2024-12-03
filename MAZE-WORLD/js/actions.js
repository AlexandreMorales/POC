import { CONFIG } from "./configs.js";
import { GRID, addWall } from "./grid.js";
import { MAP_INFO } from "./infos.js";
import { move } from "./movement.js";

/**
 * @returns {import("./infos.js").Cell}
 */
const getSelectedCell = () => {
  const nextPos =
    MAP_INFO.currentCell.adjacentPos[CONFIG.polySides][
      MAP_INFO.selectedCellIndex
    ];

  if (!nextPos) return;

  return GRID[nextPos.i]?.[nextPos.j];
};

export const dig = () => {
  const selectedCell = getSelectedCell();

  if (
    !selectedCell ||
    !selectedCell.value ||
    !selectedCell.block ||
    selectedCell.block.isFluid
  )
    return;

  MAP_INFO.pickedCells.push({ ...(selectedCell.wall || selectedCell) });

  if (selectedCell.wall) {
    addWall(selectedCell, null);
  } else {
    selectedCell.value = null;
    selectedCell.block = null;
    selectedCell.color = null;
  }

  move();
};

export const place = () => {
  if (!MAP_INFO.pickedCells.length) return;

  const selectedCell = getSelectedCell();

  if (!selectedCell || selectedCell.wall) return;

  const nextBlock = MAP_INFO.pickedCells.pop();

  if (selectedCell.value && selectedCell.block && !selectedCell.block.isFluid) {
    addWall(selectedCell, nextBlock);
  } else {
    selectedCell.value = nextBlock.value;
    selectedCell.block = nextBlock.block;
    selectedCell.color = nextBlock.color;
  }

  move();
};
