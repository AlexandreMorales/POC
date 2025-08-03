import { ENTITY_TYPES, MOVEMENT } from "../configs.js";

const MOVEMENT_IMG_MAP = /** @type {ImageMap} */ ({
  [MOVEMENT.UP]: "images/player/up.png",
  [MOVEMENT.DOWN]: "images/player/down.png",
  [MOVEMENT.LEFT]: "images/player/left.png",
  [MOVEMENT.RIGHT]: "images/player/right.png",
});

const RUNNING_IMG_MAP = /** @type {ImageMap} */ ({
  [MOVEMENT.UP]: "images/player/up-walk.gif",
  [MOVEMENT.DOWN]: "images/player/down-walk.gif",
  [MOVEMENT.LEFT]: "images/player/left-walk.gif",
  [MOVEMENT.RIGHT]: "images/player/right-walk.gif",
});

export const PLAYER_ENTITY = /** @type {Entity} */ ({
  id: "PLAYER 1",
  type: ENTITY_TYPES.PLAYER,
  imageMap: MOVEMENT_IMG_MAP,
  imageRunningMap: RUNNING_IMG_MAP,
  cell: null,
  img: document.getElementById("player"),
  connectedEntities: {},
  selectedCellIndex: 0,
  pickedCells: [],
});
