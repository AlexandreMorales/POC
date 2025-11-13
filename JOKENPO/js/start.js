import { CONFIGS } from "./_configs.js";
import {
  clearArena,
  createEntitiesBatch,
  entitiesList,
  initEntities,
  initPlayer,
  moveEntities,
  movePlayer,
  PLAYER_ENTITY,
} from "./entities/index.js";
import { createDvd, moveDvds } from "./extra/index.js";

let battleInterval = /** @type {NodeJS.Timeout} */ (null);

export const start = () => {
  let timePassed = 0;
  clearInterval(battleInterval);
  clearArena();
  if (CONFIGS.withPlayer) initPlayer();
  initEntities();
  if (CONFIGS.withDvd) createDvd();

  battleInterval = setInterval(() => {
    moveEntities();
    moveDvds();

    if (CONFIGS.withPlayer) {
      if (!PLAYER_ENTITY.element) {
        clearInterval(battleInterval);
        return;
      }

      movePlayer();
      timePassed++;

      if (timePassed % 50 === 0) createEntitiesBatch();
      if (timePassed % 600 === 0) createDvd();
    } else {
      const types = new Set(entitiesList.map((e) => e.group));
      if (types.size === 1) {
        console.log(`${[...types][0].toUpperCase()}S WINS!`);
        clearInterval(battleInterval);
      }
    }
  }, 50);
};

start();
