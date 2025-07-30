import { resetSize, start } from "./boot.js";
import "../debug.js";
import "../controls/mobile.js";
import "../controls/web.js";
import "../controls/menu.js";

start();
window.onresize = () => resetSize();
