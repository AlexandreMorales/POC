export const MOVEMENT = {
  DOWN: Symbol("DOWN"),
  LEFT: Symbol("LEFT"),
  RIGHT: Symbol("RIGHT"),
  UP: Symbol("UP"),
};

export const ENTITY_TYPES = {
  PLAYER: "PLAYER",
  BOAT: "BOAT",
  TREE: "TREE",
  ENEMY: "ENEMY",
  FIRE: "FIRE",
  RABBIT: "RABBIT",
};

export const IMG_MAP_TYPES = {
  DEFAULT: "DEFAULT",
  RUNNING: "RUNNING",
  USING: "USING",
};

export const BIOME_TYPES = {
  SNOW: "SNOW",
  DESERT: "DESERT",
};

export const ENTITY_IMAGES_MAP = /** @type {ImageMap} */ ({
  [ENTITY_TYPES.PLAYER]: {
    [IMG_MAP_TYPES.DEFAULT]: {
      [MOVEMENT.DOWN]: { pos: { i: 4, j: 0 } },
      [MOVEMENT.LEFT]: { pos: { i: 4, j: 1 } },
      [MOVEMENT.RIGHT]: { pos: { i: 4, j: 4 } },
      [MOVEMENT.UP]: { pos: { i: 4, j: 5 } },
    },
    [IMG_MAP_TYPES.RUNNING]: {
      [MOVEMENT.DOWN]: {
        posFn: (left) => (left ? { i: 6, j: 0 } : { i: 6, j: 1 }),
      },
      [MOVEMENT.LEFT]: {
        posFn: (left) => (left ? { i: 6, j: 2 } : { i: 6, j: 3 }),
      },
      [MOVEMENT.RIGHT]: {
        posFn: (left) => (left ? { i: 6, j: 4 } : { i: 6, j: 5 }),
      },
      [MOVEMENT.UP]: {
        posFn: (left) => (left ? { i: 6, j: 6 } : { i: 6, j: 7 }),
      },
    },
    [IMG_MAP_TYPES.USING]: {
      [MOVEMENT.DOWN]: { pos: { i: 5, j: 0 } },
      [MOVEMENT.LEFT]: { pos: { i: 5, j: 1 } },
      [MOVEMENT.RIGHT]: { pos: { i: 5, j: 2 } },
      [MOVEMENT.UP]: { pos: { i: 5, j: 3 } },
    },
  },
  [ENTITY_TYPES.TREE]: {
    [IMG_MAP_TYPES.DEFAULT]: {
      [MOVEMENT.DOWN]: { pos: { i: 3, j: 2 } },
    },
    [BIOME_TYPES.DESERT]: {
      [MOVEMENT.DOWN]: { pos: { i: 3, j: 0 } },
    },
    [BIOME_TYPES.SNOW]: {
      [MOVEMENT.DOWN]: { pos: { i: 3, j: 1 } },
    },
  },
  [ENTITY_TYPES.RABBIT]: {
    [IMG_MAP_TYPES.DEFAULT]: {
      [MOVEMENT.DOWN]: { pos: { i: 2, j: 2 } },
      [MOVEMENT.LEFT]: { pos: { i: 2, j: 3 } },
      [MOVEMENT.RIGHT]: { pos: { i: 2, j: 2 } },
      [MOVEMENT.UP]: { pos: { i: 2, j: 3 } },
    },
  },
  [ENTITY_TYPES.ENEMY]: {
    [IMG_MAP_TYPES.DEFAULT]: {
      [MOVEMENT.DOWN]: { pos: { i: 1, j: 0 } },
      [MOVEMENT.LEFT]: { pos: { i: 1, j: 1 } },
      [MOVEMENT.RIGHT]: { pos: { i: 1, j: 2 } },
      [MOVEMENT.UP]: { pos: { i: 1, j: 3 } },
    },
  },
  [ENTITY_TYPES.BOAT]: {
    [IMG_MAP_TYPES.DEFAULT]: {
      [MOVEMENT.DOWN]: { pos: { i: 0, j: 0 } },
      [MOVEMENT.LEFT]: { pos: { i: 0, j: 1 } },
      [MOVEMENT.RIGHT]: { pos: { i: 0, j: 2 } },
      [MOVEMENT.UP]: { pos: { i: 0, j: 3 } },
    },
  },
  [ENTITY_TYPES.FIRE]: {
    [IMG_MAP_TYPES.DEFAULT]: {
      [MOVEMENT.DOWN]: { pos: { i: 2, j: 0 } },
    },
  },
});
