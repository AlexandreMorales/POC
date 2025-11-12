import { entitiesList, initEntities } from "./0 - entities/index.js";
import { checkTouches, makeEntitiesMove } from "./1 - movement/index.js";

let interval = /** @type {NodeJS.Timeout} */ (null);

export const start = () => {
  clearInterval(interval);
  initEntities();

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
