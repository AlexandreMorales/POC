import { POLY_INFO } from "../0 - configs/infos.js";
import { GRID_INFO } from "../2 - grid/infos.js";
import { getCell } from "../2 - grid/grid.js";

import { ENTITY_TYPES, MOVEMENT } from "./infos.js";

const MOVEMENT_IMG_MAP = /** @type {import("./infos.js").ImageMap} */ ({
  [MOVEMENT.UP]: "images/player/up.png",
  [MOVEMENT.DOWN]: "images/player/down.png",
  [MOVEMENT.LEFT]: "images/player/left.png",
  [MOVEMENT.RIGHT]: "images/player/right.png",
});

const RUNNING_IMG_MAP = /** @type {import("./infos.js").ImageMap} */ ({
  [MOVEMENT.UP]: "images/player/up-walk.gif",
  [MOVEMENT.DOWN]: "images/player/down-walk.gif",
  [MOVEMENT.LEFT]: "images/player/left-walk.gif",
  [MOVEMENT.RIGHT]: "images/player/right-walk.gif",
});

const CUT_MOVEMENTS_MAP = {
  [MOVEMENT.UP]: "marginTop",
  [MOVEMENT.DOWN]: "marginTop",
  [MOVEMENT.LEFT]: "marginLeft",
  [MOVEMENT.RIGHT]: "marginRight",
};

export const PLAYER_ENTITY = /** @type {import("./infos.js").Entity} */ ({
  id: "PLAYER 1",
  type: ENTITY_TYPES.PLAYER,
  imageMap: MOVEMENT_IMG_MAP,
  cell: null,
  img: document.getElementById("player"),
  connectedEntities: {},
  selectedCellIndex: 0,
  pickedCells: [],
});

/**
 * @param {symbol} direction
 */
export const updatePlayerDirection = (direction) => {
  PLAYER_ENTITY.img.src = MOVEMENT_IMG_MAP[direction];
  const connectedEntities = /** @type {import("./infos.js").Entity[]} */ (
    Object.values(PLAYER_ENTITY.connectedEntities)
  );

  connectedEntities.forEach((entity) => {
    entity.img.src = entity.imageMap[MOVEMENT.RIGHT];
    entity.img.style.marginTop = null;
  });
};

/**
 * @param {symbol} direction
 */
export const startRunning = (direction) => {
  const connectedEntities = /** @type {import("./infos.js").Entity[]} */ (
    Object.values(PLAYER_ENTITY.connectedEntities)
  );

  if (!connectedEntities.length) {
    PLAYER_ENTITY.img.src = RUNNING_IMG_MAP[direction];
    return;
  }

  PLAYER_ENTITY.img.src = MOVEMENT_IMG_MAP[direction];

  connectedEntities.forEach((entity) => {
    entity.img.src = entity.imageMap[direction];

    if (entity.movementsToCut?.length) {
      if (entity.movementsToCut.includes(direction)) {
        const { ySide } = POLY_INFO[GRID_INFO.currentPoly];
        entity.img.style[CUT_MOVEMENTS_MAP[direction]] = `${ySide}px`;
        return;
      }

      entity.img.style.marginTop = null;
      entity.img.style.marginLeft = null;
      entity.img.style.marginRight = null;
    }
  });
};

/**
 * @returns {import("../0 - configs/infos.js").Cell}
 */
export const getSelectedCell = () => {
  return getCell(
    PLAYER_ENTITY.cell.adjacentPos[GRID_INFO.currentPoly][
      PLAYER_ENTITY.selectedCellIndex
    ]
  );
};
