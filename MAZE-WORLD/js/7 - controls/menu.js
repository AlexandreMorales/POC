import {
  MAP_GENERATION,
  MENU_CONFIG,
  RENDER_INFO,
} from "../1 - polygones/index.js";
import { PLAYER_ENTITY } from "../2 - entities/index.js";
import { loadAndGetCell } from "../3 - generation/index.js";
import { drawEveryCell, updateCanvasCss } from "../4 - draw/index.js";
import { setMusicVolume } from "../4 - draw/sounds.js";
import { move } from "../5 - actions/index.js";
import { resetSize, start } from "../6 - boot/index.js";
import { CONTROLS_CONFIG } from "./_configs.js";

(() => {
  const SELECT_OPTIONS = {
    mapGeneration: Object.entries(MAP_GENERATION),
  };

  document.querySelectorAll("#menu label").forEach((l) => {
    const config = /** @type {HTMLLabelElement} */ (l).htmlFor;
    const element = /** @type {HTMLInputElement | HTMLSelectElement} */ (
      document.getElementById(config)
    );

    if (!element) return;

    if (element.type === "checkbox") {
      const check = /** @type {HTMLInputElement} */ (element);
      check.checked = MENU_CONFIG[config];
      check.onchange = () => {
        MENU_CONFIG[config] = check.checked;
        updateCanvasCss();
        drawEveryCell(PLAYER_ENTITY);
        check.blur();
      };
    } else if (element.tagName === "SELECT") {
      const select = /** @type {HTMLSelectElement} */ (element);
      SELECT_OPTIONS[config].forEach(([key, value]) => {
        const option = document.createElement("option");
        option.value = value;
        option.innerHTML = key;
        select.appendChild(option);
      });
      select.value = MENU_CONFIG[config];
      select.onchange = () => {
        MENU_CONFIG[config] = select.value;
        start();
        select.blur();
      };
    }
  });

  const teleportationIElement = /** @type {HTMLInputElement} */ (
    document.getElementById("teleportation-i")
  );
  const teleportationJElement = /** @type {HTMLInputElement} */ (
    document.getElementById("teleportation-j")
  );
  const teleportationBtn = /** @type {HTMLButtonElement} */ (
    document.getElementById("teleport")
  );

  teleportationBtn.onclick = () => {
    const i = +teleportationIElement.value;
    const j = +teleportationJElement.value;

    move(loadAndGetCell({ i, j }));
    teleportationBtn.blur();
  };

  const zoomSlider = /** @type {HTMLInputElement} */ (
    document.getElementById("zoom")
  );
  zoomSlider.value = `${RENDER_INFO.cellHeight}`;
  zoomSlider.min = `${CONTROLS_CONFIG.minZoom}`;
  zoomSlider.max = `${CONTROLS_CONFIG.maxZoom}`;
  zoomSlider.oninput = () => {
    resetSize(+zoomSlider.value);
    zoomSlider.blur();
  };

  const musicVolumeSlider = /** @type {HTMLInputElement} */ (
    document.getElementById("musicVolume")
  );
  musicVolumeSlider.value = `50`;
  musicVolumeSlider.min = `0`;
  musicVolumeSlider.max = `100`;
  musicVolumeSlider.oninput = () => {
    setMusicVolume(+musicVolumeSlider.value);
    musicVolumeSlider.blur();
  };
  setMusicVolume(+musicVolumeSlider.value);
})();
