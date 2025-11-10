import { ENTITY_TYPES } from "../_configs.js";

export const PLAYER_CONFIG = {
  maxHealth: 10,
};

export const PLAYER_ENTITY = /** @type {Entity} */ ({
  id: "PLAYER_1",
  type: ENTITY_TYPES.PLAYER,
  cell: null,
  img: document.getElementById("player"),
  connectedEntities: {},
  selectedCellIndex: 0,
  health: PLAYER_CONFIG.maxHealth,
});
