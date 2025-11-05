import { MENU_CONFIG } from "../1 - polygones/index.js";
import { MOVEMENT } from "../2 - entities/index.js";
import {
  canvasContainer,
  movePlaceBlocks,
  stopFishing,
} from "../4 - draw/index.js";
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
  useMap,
} from "../5 - actions/index.js";

import { addDebugBlockToPoint } from "./debug.js";

(() => {
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

  let selectedToolbarIndex = 1;
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

    if (e.code === "KeyR") movePlaceBlocks(e.altKey ? -1 : 1);

    if (e.code.startsWith("Arrow"))
      return moveBaseOnCode(ARROW_MOVEMENT_MAP[e.code], e.altKey);

    if (e.code.startsWith("Digit") || e.code.startsWith("Numpad"))
      return updateToolbarSelected(+e.code.replace(/Numpad|Digit/gi, ""));

    if (MOVEMENT_KEYS.includes(e.code))
      return changeSelectedOnCode(KEY_MOVEMENT_MAP[e.code], e.altKey);

    if (e.code === "KeyQ") return rotate(-1);
    if (e.code === "KeyE") return rotate(1);

    if (e.code === "KeyF")
      return TOOLBAR_ACTIONS[selectedToolbarIndex].onclick(null);

    if (e.code.includes("Shift")) return changePolySides();

    if (e.code === "Space") return move();

    if (e.code === "Escape") {
      closeDebugMenu();
      useMap(false);
    }
  };

  document.onkeyup = () => {
    stopMoving();
  };

  /**
   * @param {number} keyIndex
   */
  const updateToolbarSelected = (keyIndex) => {
    const element = TOOLBAR_ACTIONS[keyIndex];
    if (!element) return;
    TOOLBAR_ACTIONS[selectedToolbarIndex].classList.remove("toolbar-selected");
    selectedToolbarIndex = keyIndex;
    element.classList.add("toolbar-selected");
  };
  document.onwheel = (e) => {
    e = e || /** @type {WheelEvent} */ (window.event);
    updateToolbarSelected(
      e.deltaY < 0 ? selectedToolbarIndex - 1 : selectedToolbarIndex + 1
    );
  };
  updateToolbarSelected(selectedToolbarIndex);

  TOOLBAR_ACTIONS[1].onclick = () => dig();
  const toolbarPlace = document.getElementById("toolbar-place");
  TOOLBAR_ACTIONS[2].onclick = (e) => {
    if (e) {
      const { top } = toolbarPlace.getBoundingClientRect();
      const y = e.clientY - top;
      if (y < 0) return movePlaceBlocks(-1);
      if (y > toolbarPlace.offsetHeight) return movePlaceBlocks(1);
    }

    place();
  };
  TOOLBAR_ACTIONS[3].onclick = () => useFishingRod();
  TOOLBAR_ACTIONS[4].onclick = () => useBoat();
  TOOLBAR_ACTIONS[5].onclick = () => useMap();

  canvasContainer.onclick = (e) => {
    e = e || /** @type {PointerEvent} */ (window.event);
    if (MENU_CONFIG.debugMode) {
      const { left, top } = canvasContainer.getBoundingClientRect();
      const x = e.clientX - left;
      const y = e.clientY - top;
      addDebugBlockToPoint({ x, y });
    }
    closeDebugMenu();
    stopFishing();
  };
})();
