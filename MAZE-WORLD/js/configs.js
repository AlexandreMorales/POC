import { KNOWN_POLYGONS } from "./infos.js";

export const CONFIG = {
  initialRows: 10,
  initialColumns: 10,
  cellSize: 15,
  poliSizes: KNOWN_POLYGONS.SQUARE,

  isCircle: false,
  isMaze: false,
  moveManually: true,
  automaticRowsAndColumns: true,
};

export const MAP_CONFIG = {
  passHour: 0.5,
  midNightHour: 70,
};

export const CANVAS_CONFIG = {
  border: 1,
  showPos: false,
  strokeColor: "black",
  defaultColor: "white",
  visitedColor: "grey",
  pathColor: "green",
  currentColor: "cyan",
};

export const MAZE_CONFIG = {
  buildTime: 0,
  solveTime: 0,
  clearRandomCells: false,
};
