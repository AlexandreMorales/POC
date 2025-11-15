import {
  clearArena,
  createEntitiesBatch,
  initEntities,
  initPlayer,
  moveEntities,
  movePlayer,
  PLAYER_ENTITY,
} from "./entities/index.js";
import { createDvd, initDvds, moveDvds } from "./extra/index.js";
import { showInfos, showPoints, SHOP_CONFIG, openShop } from "./shop.js";

let battleInterval = /** @type {NodeJS.Timeout} */ (null);

export const start = () => {
  let timePassed = 0;
  clearInterval(battleInterval);
  clearArena();
  initPlayer();
  initEntities();
  initDvds();

  showInfos();
  const pointsMod = 20;
  const spawnMod = 20 * SHOP_CONFIG.secondsToSpawn;
  const dvdSpawnMod = 20 * SHOP_CONFIG.secondsToDvdSpawn;
  const evolutionSpawnLimit = 20 * SHOP_CONFIG.secondsToEvolutionSpawn;

  battleInterval = setInterval(() => {
    moveEntities();
    moveDvds();

    if (!PLAYER_ENTITY.element) {
      clearInterval(battleInterval);
      openShop(() => start());
      return;
    }

    movePlayer();
    timePassed++;

    if (timePassed % spawnMod === 0)
      createEntitiesBatch(timePassed > evolutionSpawnLimit);
    if (timePassed % dvdSpawnMod === 0) createDvd();
    if (timePassed % pointsMod === 0)
      SHOP_CONFIG.points += SHOP_CONFIG.pointsPerSecond;

    showPoints();
  }, 50);
};

start();
