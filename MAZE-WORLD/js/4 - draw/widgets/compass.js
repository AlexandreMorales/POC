import { RENDER_INFO } from "../../1 - polygones/index.js";
import { drawContainer } from "../containers.js";

const compass = document.getElementById("compass");

export const COMPASS_CONFIG = {
  rotateDelay: 750,
};

export const updateCompass = () => {
  const angle = (360 / RENDER_INFO.currentPoly) * RENDER_INFO.rotationTurns;
  compass.style.setProperty("--compass-rotate", `${-angle}deg`);
};

const entitiesContainer = document.getElementById("entities");
/**
 * @param {number} deg
 * @param {number} rotateDelay
 */
export const rotateCanvas = (deg, rotateDelay) => {
  rotateElement(entitiesContainer, -deg, rotateDelay);
  rotateElement(drawContainer, deg, rotateDelay);
};

export const resetRotateCanvas = () => {
  rotateElement(entitiesContainer);
  rotateElement(drawContainer);
};

/**
 * @param {HTMLElement} element
 * @param {number} [deg]
 * @param {number} [rotateDelay]
 */
const rotateElement = (element, deg, rotateDelay) => {
  if (rotateDelay)
    element.style.setProperty("--transition-duration", `${rotateDelay}ms`);
  if (deg) element.style.setProperty("--rotate-deg", `${deg}deg`);

  element.classList[deg ? "add" : "remove"]("rotate");
  element.classList[deg ? "add" : "remove"]("zoom-in");
};
