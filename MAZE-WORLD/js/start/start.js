import { resetSize, start } from "./boot.js";
import "../controls/mobile.js";
import "../controls/web.js";

start();
window.onresize = () => resetSize();
