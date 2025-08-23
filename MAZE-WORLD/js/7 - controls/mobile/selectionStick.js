import { MOVEMENT } from "../../2 - entities/index.js";
import {
  changeSelectedOnCode,
  moveBaseOnCode,
  stopMoving,
} from "../../5 - actions/index.js";

(() => {
  const SELECTION_STICK_CONFIG = {
    touchThreshold: 20,
  };

  const selectionStickLeft = document.getElementById("selection-stick-left");
  const selectionStickRight = document.getElementById("selection-stick-right");

  const SELECTION_STICK_INFO = (() => {
    const maxPoint = selectionStickLeft.offsetWidth / 1.25;
    const minPoint = selectionStickLeft.offsetWidth / 5;
    const midPoint = minPoint + (maxPoint - minPoint) / 2;
    const maxMidPoint = midPoint + SELECTION_STICK_CONFIG.touchThreshold;
    const minMidPoint = midPoint - SELECTION_STICK_CONFIG.touchThreshold;
    return { maxPoint, minPoint, midPoint, maxMidPoint, minMidPoint };
  })();

  /**
   * @typedef {Object} SelectStickInfo
   * @property {symbol} code
   * @property {boolean} useDiagonal
   * @property {NodeJS.Timeout} [interval]
   */

  /**
   * @param {TouchEvent} e
   * @param {HTMLElement} stickElement
   * @returns {SelectStickInfo}
   */
  const moveStick = (e, stickElement) => {
    e = e || /** @type {TouchEvent} */ (window.event);
    e.preventDefault();
    e.stopPropagation();
    const { clientX, clientY } = e.touches[0];

    const stickRect = stickElement.getBoundingClientRect();
    let finalX = clientX - stickRect.left;
    let finalY = clientY - stickRect.top;

    finalX = Math.min(finalX, SELECTION_STICK_INFO.maxPoint);
    finalX = Math.max(finalX, SELECTION_STICK_INFO.minPoint);
    finalY = Math.min(finalY, SELECTION_STICK_INFO.maxPoint);
    finalY = Math.max(finalY, SELECTION_STICK_INFO.minPoint);

    stickElement.style.setProperty("--selection-stick-left", `${finalX}px`);
    stickElement.style.setProperty("--selection-stick-top", `${finalY}px`);

    let code = null;
    const useDiagonal = finalY > SELECTION_STICK_INFO.maxMidPoint;
    if (useDiagonal) code = MOVEMENT.DOWN;
    if (finalY < SELECTION_STICK_INFO.minMidPoint) code = MOVEMENT.UP;
    if (finalX > SELECTION_STICK_INFO.maxMidPoint) code = MOVEMENT.RIGHT;
    if (finalX < SELECTION_STICK_INFO.minMidPoint) code = MOVEMENT.LEFT;

    return { code, useDiagonal };
  };

  selectionStickLeft.ontouchstart = selectionStickLeft.ontouchmove = (e) => {
    const { code, useDiagonal } = moveStick(e, selectionStickLeft);
    if (code) changeSelectedOnCode(code, useDiagonal);
  };

  let rightStickInfo = /** @type {SelectStickInfo} */ ({});

  /**
   * @param {TouchEvent} e
   */
  const updateRightStickInfo = (e) =>
    (rightStickInfo = moveStick(e, selectionStickRight));

  /**
   * @param {TouchEvent} e
   */
  selectionStickRight.ontouchstart = (e) => {
    clearInterval(rightStickInfo.interval);

    updateRightStickInfo(e);

    rightStickInfo.interval = setInterval(() => {
      if (rightStickInfo.code)
        moveBaseOnCode(rightStickInfo.code, rightStickInfo.useDiagonal);
      else stopMoving();
    }, 100);
  };
  selectionStickRight.ontouchmove = updateRightStickInfo;

  document.ontouchend = () => {
    selectionStickLeft?.style.removeProperty("--selection-stick-left");
    selectionStickLeft?.style.removeProperty("--selection-stick-top");
    selectionStickRight?.style.removeProperty("--selection-stick-left");
    selectionStickRight?.style.removeProperty("--selection-stick-top");
    stopMoving();
    clearInterval(rightStickInfo.interval);
    rightStickInfo = { code: null, useDiagonal: null, interval: null };
  };
})();
