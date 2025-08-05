import { updateClock } from "./clock.js";
import { updateCompass } from "./compass.js";

export const updateWidgets = () => {
  updateClock();
  updateCompass();
};
