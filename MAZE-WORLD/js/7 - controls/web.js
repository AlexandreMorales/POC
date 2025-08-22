import { MENU_CONFIG, RENDER_INFO } from "../1 - polygones/index.js";
import { MOVEMENT } from "../2 - entities/index.js";
import { canvasContainer, toggleFullMap } from "../4 - draw/index.js";
import {
  changePolySides,
  changeSelectedOnCode,
  dig,
  move,
  moveBaseOnCode,
  place,
  rotate,
  stopMoving,
  useBoat,
  useFishingRod,
} from "../5 - actions/index.js";
import { resetSize } from "../6 - boot/index.js";

import { CONTROLS_CONFIG } from "./_configs.js";
import { addDebugBlockToPoint } from "./debug.js";

const KEY_MOVEMENT_MAP = {
  ["KeyW"]: MOVEMENT.UP,
  ["KeyA"]: MOVEMENT.LEFT,
  ["KeyS"]: MOVEMENT.DOWN,
  ["KeyD"]: MOVEMENT.RIGHT,
};
const ARROW_MOVEMENT_MAP = {
  ["ArrowUp"]: MOVEMENT.UP,
  ["ArrowLeft"]: MOVEMENT.LEFT,
  ["ArrowDown"]: MOVEMENT.DOWN,
  ["ArrowRight"]: MOVEMENT.RIGHT,
};
const TOOLBAR_ACTIONS = [
  undefined,
  document.getElementById("toolbar-dig"),
  document.getElementById("toolbar-place"),
  document.getElementById("toolbar-fishing"),
  document.getElementById("toolbar-boat"),
  document.getElementById("toolbar-map"),
];
const MOVEMENT_KEYS = Object.keys(KEY_MOVEMENT_MAP);

const menuToggle = /** @type {HTMLInputElement} */ (
  document.getElementById("menuToggle")
);
const closeDebugMenu = () => (menuToggle.checked = false);

document.onkeydown = (e) => {
  e = e || /** @type {KeyboardEvent} */ (window.event);
  const targetElement = /** @type {Element} */ (e.target);

  // Dont execute when typing (only if its the menu toggle)
  if (targetElement.tagName === "INPUT" && targetElement.id !== "menuToggle")
    return;

  if (e.code.startsWith("Arrow"))
    return moveBaseOnCode(ARROW_MOVEMENT_MAP[e.code], e.altKey);

  if (e.code.startsWith("Digit") || e.code.startsWith("Numpad"))
    return updateToolbarSelected(+e.code.replace(/Numpad|Digit/gi, ""));

  if (MOVEMENT_KEYS.includes(e.code))
    return changeSelectedOnCode(KEY_MOVEMENT_MAP[e.code], e.altKey);

  if (e.code === "KeyQ") return rotate(-1);
  if (e.code === "KeyE") return rotate(1);

  if (e.code === "KeyF") return TOOLBAR_ACTIONS[selectedIndex].click();

  if (e.code.includes("Shift")) return changePolySides();

  if (e.code === "Space") return move();

  if (e.code === "Escape") {
    closeDebugMenu();
    toggleFullMap(false);
  }
};

document.onkeyup = () => {
  stopMoving();
};

const heightSlider = /** @type {HTMLInputElement} */ (
  document.getElementById("zoom")
);
heightSlider.value = `${RENDER_INFO.cellHeight}`;
heightSlider.min = `${CONTROLS_CONFIG.minZoom}`;
heightSlider.max = `${CONTROLS_CONFIG.maxZoom}`;
heightSlider.oninput = () => {
  resetSize(+heightSlider.value);
  heightSlider.blur();
};

let selectedIndex = 1;
/**
 * @param {number} keyIndex
 */
const updateToolbarSelected = (keyIndex) => {
  const element = TOOLBAR_ACTIONS[keyIndex];
  if (!element) return;
  TOOLBAR_ACTIONS[selectedIndex].classList.remove("toolbar-selected");
  selectedIndex = keyIndex;
  element.classList.add("toolbar-selected");
};

TOOLBAR_ACTIONS[1].onclick = () => dig();
TOOLBAR_ACTIONS[2].onclick = () => place();
TOOLBAR_ACTIONS[3].onclick = () => useFishingRod();
TOOLBAR_ACTIONS[4].onclick = () => useBoat();
TOOLBAR_ACTIONS[5].onclick = () => toggleFullMap();

document.onwheel = (e) => {
  e = e || /** @type {WheelEvent} */ (window.event);
  updateToolbarSelected(e.deltaY < 0 ? selectedIndex - 1 : selectedIndex + 1);
};

canvasContainer.onclick = (e) => {
  e = e || /** @type {MouseEvent} */ (window.event);
  if (MENU_CONFIG.debugMode) {
    const { left, top } = canvasContainer.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    addDebugBlockToPoint({ x, y });
  }
  closeDebugMenu();
};
