import { resetSize, start } from "./6 - boot/index.js";
import "./7 - controls/index.js";

start();
window.onresize = () => resetSize();
