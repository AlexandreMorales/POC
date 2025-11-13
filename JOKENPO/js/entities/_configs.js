export const ENTITY_TYPES = {
  ROCK: "rock",
  PAPER: "paper",
  SCISSOR: "scissor",
  WATER: "water",
  LOG: "log",
  FIRE: "fire",
};

export const PLAYER_ENTITY = /** @type {Entity} */ ({
  group: ENTITY_TYPES.SCISSOR,
  type: ENTITY_TYPES.SCISSOR,
  kills: [ENTITY_TYPES.PAPER],
  speed: 1.5,
});

export const ENTITIES = /** @type {{ [k: string]: Entity }} */ ({
  [ENTITY_TYPES.ROCK]: {
    group: ENTITY_TYPES.ROCK,
    type: ENTITY_TYPES.ROCK,
    kills: [ENTITY_TYPES.SCISSOR],
    speed: 1,
    evolution: { minKills: 7, evolution: ENTITY_TYPES.WATER },
  },
  [ENTITY_TYPES.PAPER]: {
    group: ENTITY_TYPES.PAPER,
    type: ENTITY_TYPES.PAPER,
    kills: [ENTITY_TYPES.ROCK],
    speed: 1,
    evolution: { minKills: 7, evolution: ENTITY_TYPES.LOG },
  },
  [ENTITY_TYPES.SCISSOR]: {
    group: ENTITY_TYPES.SCISSOR,
    type: ENTITY_TYPES.SCISSOR,
    kills: [ENTITY_TYPES.PAPER],
    speed: 1,
    evolution: { minKills: 7, evolution: ENTITY_TYPES.FIRE },
  },

  // evolutions
  [ENTITY_TYPES.WATER]: {
    group: ENTITY_TYPES.ROCK,
    type: ENTITY_TYPES.WATER,
    kills: [ENTITY_TYPES.PAPER, ENTITY_TYPES.SCISSOR, ENTITY_TYPES.FIRE],
    speed: 2,
  },
  [ENTITY_TYPES.LOG]: {
    group: ENTITY_TYPES.PAPER,
    type: ENTITY_TYPES.LOG,
    kills: [ENTITY_TYPES.ROCK, ENTITY_TYPES.SCISSOR, ENTITY_TYPES.WATER],
    speed: 2,
  },
  [ENTITY_TYPES.FIRE]: {
    group: ENTITY_TYPES.SCISSOR,
    type: ENTITY_TYPES.FIRE,
    kills: [ENTITY_TYPES.ROCK, ENTITY_TYPES.PAPER, ENTITY_TYPES.LOG],
    speed: 2,
  },
});
