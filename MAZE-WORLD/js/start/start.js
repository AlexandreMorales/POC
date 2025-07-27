import { resetSize, start } from "./boot.js";
import "../controls/mobile.js";
import "../controls/web.js";
import "../configs/debug.js";

start();
window.onresize = () => resetSize();
