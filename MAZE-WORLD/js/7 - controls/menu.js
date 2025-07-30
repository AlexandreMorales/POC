import { MAP_GENERATION, MENU_CONFIG } from "../0 - configs/configs.js";
import { PLAYER_ENTITY } from "../3 - entities/player.js";
import { drawEveryCell, updateCanvasCss } from "../5 - draw/draw.js";

import { start } from "../start/boot.js";

const SELECT_OPTIONS = {
  mapGeneration: Object.entries(MAP_GENERATION),
};

const menuLabels = /** @type {HTMLLabelElement[]} */ ([
  ...document.querySelectorAll("#menu label"),
]);
menuLabels.map((l) => {
  const config = l.htmlFor;
  const element = /** @type {HTMLInputElement | HTMLSelectElement} */ (
    document.getElementById(config)
  );

  if (element.type === "checkbox") {
    const check = /** @type {HTMLInputElement} */ (element);
    check.checked = MENU_CONFIG[config];
    check.onchange = () => {
      MENU_CONFIG[config] = check.checked;
      updateCanvasCss();
      drawEveryCell(PLAYER_ENTITY.cell);
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
    };
  }
});
