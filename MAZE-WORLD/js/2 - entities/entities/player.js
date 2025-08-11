import { ENTITY_TYPES, IMG_MAP_TYPES, MOVEMENT } from "../_configs.js";

const PLAYER_IMG_MAP = /** @type {ImageMap} */ ({
  [IMG_MAP_TYPES.DEFAULT]: {
    [MOVEMENT.UP]: "images/player/up.png",
    [MOVEMENT.DOWN]: "images/player/down.png",
    [MOVEMENT.LEFT]: "images/player/left.png",
    [MOVEMENT.RIGHT]: "images/player/right.png",
  },
  [IMG_MAP_TYPES.RUNNING]: {
    [MOVEMENT.UP]: "images/player/up-walk.gif",
    [MOVEMENT.DOWN]: "images/player/down-walk.gif",
    [MOVEMENT.LEFT]: "images/player/left-walk.gif",
    [MOVEMENT.RIGHT]: "images/player/right-walk.gif",
  },
});

export const PLAYER_ENTITY = /** @type {Entity} */ ({
  id: "PLAYER_1",
  type: ENTITY_TYPES.PLAYER,
  imageMap: PLAYER_IMG_MAP,
  cell: null,
  img: document.getElementById("player"),
  connectedEntities: {},
  selectedCellIndex: 0,
  pickedCells: [],
});
