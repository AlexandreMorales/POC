import { MAP_GENERATION, MENU_CONFIG } from "../configs/configs.js";
import { drawEveryCell, updateCanvasCss } from "../draw/draw.js";
import { PLAYER_ENTITY } from "../entities/player.js";
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
