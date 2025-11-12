import { CONFIGS } from "./_configs.js";
import {
  clearArena,
  entitiesList,
  initEntities,
  moveEntities,
} from "./entities/index.js";
import { initDvd, moveDvd } from "./extra/index.js";

let interval = /** @type {NodeJS.Timeout} */ (null);

export const start = () => {
  clearInterval(interval);
  clearArena();
  initEntities();
  if (CONFIGS.withDvd) initDvd();

  interval = setInterval(() => {
    moveEntities();
    if (CONFIGS.withDvd) moveDvd();

    const types = new Set(entitiesList.map((e) => e.group));
    if (types.size === 1) {
      console.log(`${[...types][0].toUpperCase()}S WINS!`);
      clearInterval(interval);
    }
  }, 50);
};

start();
