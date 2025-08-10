import { resetBiomeMap } from "./map.js";
import { resetPlace } from "./place.js";

export const resetToolbar = () => {
  resetBiomeMap();
  resetPlace();
};
