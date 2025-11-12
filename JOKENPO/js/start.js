/**
 * @typedef {Object} Point
 * @property {number} x
 * @property {number} y
 */

/**
 * @typedef {Object} Entity
 * @property {string} group
 * @property {string} type
 * @property {string[]} kills
 * @property {number} speed
 * @property {HTMLElement} [element]
 * @property {Point} [pointTop]
 * @property {Point} [pointBottom]
 * @property {number} [killCount]
 */

const mainContainer = document.getElementById("main-container");
const mainRect = mainContainer.getBoundingClientRect();

const size = 32;
const amount = 200;

/**
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1) + min);

const ENTITY_TYPES = {
  ROCK: "rock",
  PAPER: "paper",
  SCISSOR: "scissor",
  WATER: "water",
  LOG: "log",
  FIRE: "fire",
};

const ENTITY_ROCK = /** @type {Entity} */ ({
  group: ENTITY_TYPES.ROCK,
  type: ENTITY_TYPES.ROCK,
  kills: [ENTITY_TYPES.SCISSOR],
  speed: 2,
});
const ENTITY_PAPER = /** @type {Entity} */ ({
  group: ENTITY_TYPES.PAPER,
  type: ENTITY_TYPES.PAPER,
  kills: [ENTITY_TYPES.ROCK],
  speed: 2,
});
const ENTITY_SCISSOR = /** @type {Entity} */ ({
  group: ENTITY_TYPES.SCISSOR,
  type: ENTITY_TYPES.SCISSOR,
  kills: [ENTITY_TYPES.PAPER],
  speed: 2,
});

const ENTITY_WATER = /** @type {Entity} */ ({
  group: ENTITY_TYPES.ROCK,
  type: ENTITY_TYPES.WATER,
  kills: [
    ENTITY_TYPES.ROCK,
    ENTITY_TYPES.PAPER,
    ENTITY_TYPES.SCISSOR,
    ENTITY_TYPES.FIRE,
  ],
  speed: 5,
});
const ENTITY_LOG = /** @type {Entity} */ ({
  group: ENTITY_TYPES.PAPER,
  type: ENTITY_TYPES.LOG,
  kills: [
    ENTITY_TYPES.ROCK,
    ENTITY_TYPES.PAPER,
    ENTITY_TYPES.SCISSOR,
    ENTITY_TYPES.WATER,
  ],
  speed: 5,
});
const ENTITY_FIRE = /** @type {Entity} */ ({
  group: ENTITY_TYPES.SCISSOR,
  type: ENTITY_TYPES.FIRE,
  kills: [
    ENTITY_TYPES.ROCK,
    ENTITY_TYPES.PAPER,
    ENTITY_TYPES.SCISSOR,
    ENTITY_TYPES.LOG,
  ],
  speed: 5,
});

const ENTITIES = /** @type {Entity[]} */ ([]);

/**
 * @param {Entity} entity
 * @param {Point} point
 */
const setEntityPoint = (entity, point) => {
  entity.element.style.setProperty("--entity-top", `${point.y}px`);
  entity.element.style.setProperty("--entity-left", `${point.x}px`);
  entity.pointTop = point;
  entity.pointBottom = { x: point.x + size, y: point.y + size };
};

/**
 * @param {Entity} entity
 */
const setEntityType = (entity) => {
  if (!entity.element) return;
  entity.element.className = `image`;
  entity.element.classList.add(entity.type);
};

/**
 * @param {Entity} baseEntity
 * @returns {Entity}
 */
const createEntity = (baseEntity) => {
  const element = document.createElement("DIV");
  element.style.setProperty("--entity-size", `${size}px`);
  mainContainer.appendChild(element);

  const entity = { ...baseEntity, element };
  setEntityType(entity);

  setEntityPoint(entity, {
    x: randomInt(0, mainRect.width - size),
    y: randomInt(0, mainRect.height - size),
  });
  return entity;
};

/**
 * @param {Entity} entityA
 * @param {Entity} entityB
 * @returns {boolean}
 */
const entitiesTouching = (entityA, entityB) => {
  return (
    ((entityA.pointTop.x >= entityB.pointTop.x &&
      entityA.pointTop.x <= entityB.pointBottom.x) ||
      (entityB.pointTop.x >= entityA.pointTop.x &&
        entityB.pointTop.x <= entityA.pointBottom.x)) &&
    ((entityA.pointTop.y >= entityB.pointTop.y &&
      entityA.pointTop.y <= entityB.pointBottom.y) ||
      (entityB.pointTop.y >= entityA.pointTop.y &&
        entityB.pointTop.y <= entityA.pointBottom.y))
  );
};

/**
 * @param {Point} point1
 * @param {Point} point2
 * @returns {number}
 */
const getPointDistance = (point1, point2) =>
  Math.sqrt((point1.x - point2.x) ** 2 + (point1.y - point2.y) ** 2);

/**
 * @param {Entity} entity
 */
const killEntity = (entity) => {
  if (!entity.element) return;
  mainContainer.removeChild(entity.element);
  entity.element = null;
  ENTITIES.splice(ENTITIES.indexOf(entity), 1);
};

/**
 * @param {Entity} entity
 */
const evolveEntity = (entity) => {
  if (entity.killCount >= 5) {
    let source = null;
    switch (entity.type) {
      case ENTITY_TYPES.ROCK:
        source = ENTITY_WATER;
        break;
      case ENTITY_TYPES.PAPER:
        source = ENTITY_LOG;
        break;
      case ENTITY_TYPES.SCISSOR:
        source = ENTITY_FIRE;
        break;
    }
    if (source) {
      Object.assign(entity, source);
      setEntityType(entity);
    }
  }
};

/**
 * @param {Entity} entityA
 * @param {Entity} entityB
 */
const entityKillEntity = (entityA, entityB) => {
  killEntity(entityB);
  entityA.killCount = (entityA.killCount || 0) + 1;
  evolveEntity(entityA);
};

const checkTouches = () => {
  const freshEntities = [...ENTITIES];
  freshEntities.forEach((entityA) => {
    if (!entityA.element) return;
    freshEntities.forEach((entityB) => {
      if (!entityB.element) return;
      if (
        entityA !== entityB &&
        entityA.type !== entityB.type &&
        entitiesTouching(entityA, entityB)
      ) {
        if (entityA.kills.includes(entityB.type))
          entityKillEntity(entityA, entityB);
        if (entityB.kills.includes(entityA.type))
          entityKillEntity(entityB, entityA);
      }
    });
  });
};

/**
 * @param {Entity} entity
 * @returns {{ target: Entity, distance: number }}
 */
const getClosestTarget = (entity) => {
  let minDistance = Infinity;
  let selectedTarget = /** @type {Entity} */ (null);

  ENTITIES.forEach((targetEntity) => {
    entity.kills.forEach((t) => {
      if (targetEntity.type === t) {
        const distance = getPointDistance(
          entity.pointTop,
          targetEntity.pointTop
        );
        if (distance < minDistance) {
          selectedTarget = targetEntity;
          minDistance = distance;
        }
      }
    });
  });
  return { target: selectedTarget, distance: minDistance };
};

/**
 * @param {Point} p1
 * @param {Point} p2
 * @param {number} distance
 * @param {number} speed
 * @returns {Point}
 */
const movePointTowards = (p1, p2, distance, speed) => {
  const normalizedDirection = {
    x: (p2.x - p1.x) / distance,
    y: (p2.y - p1.y) / distance,
  };

  return {
    x: p1.x + normalizedDirection.x * speed,
    y: p1.y + normalizedDirection.y * speed,
  };
};

const makeEntitiesMove = () => {
  ENTITIES.forEach((entity) => {
    const { target, distance } = getClosestTarget(entity);
    if (!target) return;
    setEntityPoint(
      entity,
      movePointTowards(entity.pointTop, target.pointTop, distance, entity.speed)
    );
  });
};

for (let i = 0; i < amount; i++) {
  ENTITIES.push(createEntity(ENTITY_ROCK));
  ENTITIES.push(createEntity(ENTITY_PAPER));
  ENTITIES.push(createEntity(ENTITY_SCISSOR));
}

const interval = setInterval(() => {
  checkTouches();
  makeEntitiesMove();

  const types = new Set(ENTITIES.map((e) => e.group));
  if (types.size === 1) {
    console.log(`${[...types][0].toUpperCase()}S WINS!`);
    clearInterval(interval);
  }
}, 50);
