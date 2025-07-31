import { MAP_GENERATION, MENU_CONFIG } from "../1 - polygones/index.js";
import { PLAYER_ENTITY } from "../2 - entities/index.js";
import { drawEveryCell, updateCanvasCss } from "../4 - draw/index.js";
import { start } from "../6 - boot/index.js";

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
