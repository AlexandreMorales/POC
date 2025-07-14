import { resetSize, start } from "./boot.js";
import "./controls/index.js";

start();
window.onresize = () => resetSize();
