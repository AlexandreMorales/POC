import {
  clearArena,
  createEntity,
  ENTITIES,
  entitiesList,
  ENTITY_TYPES,
} from "./0 - entities/index.js";
import { checkTouches, makeEntitiesMove } from "./1 - movement/movement.js";
import { CONFIGS } from "./_configs.js";

let interval = /** @type {NodeJS.Timeout} */ (null);

const start = () => {
  clearArena();
  clearInterval(interval);

  for (let i = 0; i < CONFIGS.amount; i++) {
    entitiesList.push(createEntity(ENTITIES[ENTITY_TYPES.ROCK]));
    entitiesList.push(createEntity(ENTITIES[ENTITY_TYPES.PAPER]));
    entitiesList.push(createEntity(ENTITIES[ENTITY_TYPES.SCISSOR]));
  }

  interval = setInterval(() => {
    checkTouches();
    makeEntitiesMove();

    const types = new Set(entitiesList.map((e) => e.group));
    if (types.size === 1) {
      console.log(`${[...types][0].toUpperCase()}S WINS!`);
      clearInterval(interval);
    }
  }, 50);
};

start();
