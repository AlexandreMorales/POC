import { resetSize, start } from "./boot.js";
import "./debug.js";
import "../7 - controls/mobile.js";
import "../7 - controls/web.js";
import "../7 - controls/menu.js";

start();
window.onresize = () => resetSize();
