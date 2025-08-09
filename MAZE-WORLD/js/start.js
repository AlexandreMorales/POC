import { resetSize, start } from "./6 - boot/index.js";
import { updateMobileDivs } from "./7 - controls/index.js";

start();
window.onresize = () => {
  updateMobileDivs();
  resetSize();
};
