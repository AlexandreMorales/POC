import { MOVEMENT } from "../../2 - entities/index.js";
import {
  changeSelectedOnCode,
  moveBaseOnCode,
  stopMoving,
} from "../../5 - actions/index.js";

const SELECTION_STICK_CONFIG = {
  touchThreshold: 20,
};

const selectionStickLeft = document.getElementById("selection-stick-left");
const selectionStickRight = document.getElementById("selection-stick-right");

const maxPoint = selectionStickLeft.offsetWidth / 1.25;
const minPoint = selectionStickLeft.offsetWidth / 5;
const midPoint = minPoint + (maxPoint - minPoint) / 2;
const maxMidPoint = midPoint + SELECTION_STICK_CONFIG.touchThreshold;
const minMidPoint = midPoint - SELECTION_STICK_CONFIG.touchThreshold;

let leftStickRect = selectionStickLeft?.getBoundingClientRect();
let rightStickRect = selectionStickRight?.getBoundingClientRect();

export const updateMobileDivs = () => {
  leftStickRect = selectionStickLeft?.getBoundingClientRect();
  rightStickRect = selectionStickRight?.getBoundingClientRect();
};

/**
 * @typedef {Object} SelectStickInfo
 * @property {symbol} code
 * @property {boolean} useDiagonal
 * @property {number} [interval]
 */

/**
 * @param {TouchEvent} e
 * @param {DOMRect} stickRect
 * @param {HTMLElement} stickElement
 * @returns {SelectStickInfo}
 */
const moveStick = (e, stickRect, stickElement) => {
  e = e || /** @type {TouchEvent} */ (window.event);
  e.preventDefault();
  e.stopPropagation();
  const { clientX, clientY } = e.touches[0];

  let finalX = clientX - stickRect.left;
  let finalY = clientY - stickRect.top;

  finalX = Math.min(finalX, maxPoint);
  finalX = Math.max(finalX, minPoint);
  finalY = Math.min(finalY, maxPoint);
  finalY = Math.max(finalY, minPoint);

  stickElement.style.setProperty("--selection-stick-left", `${finalX}px`);
  stickElement.style.setProperty("--selection-stick-top", `${finalY}px`);

  let code = null;
  const useDiagonal = finalY > maxMidPoint;
  if (useDiagonal) code = MOVEMENT.DOWN;
  if (finalY < minMidPoint) code = MOVEMENT.UP;
  if (finalX > maxMidPoint) code = MOVEMENT.RIGHT;
  if (finalX < minMidPoint) code = MOVEMENT.LEFT;

  return { code, useDiagonal };
};

selectionStickLeft.ontouchstart = selectionStickLeft.ontouchmove = (e) => {
  const { code, useDiagonal } = moveStick(e, leftStickRect, selectionStickLeft);
  if (code) changeSelectedOnCode(code, useDiagonal);
};

let rightStickInfo = /** @type {SelectStickInfo} */ ({});

/**
 * @param {TouchEvent} e
 */
const updateRightStickInfo = (e) =>
  (rightStickInfo = moveStick(e, rightStickRect, selectionStickRight));

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
