import { MENU_CONFIG } from "../../1 - polygones/_configs.js";
import { createMazeObj } from "../../3 - generation/index.js";
import { drawMaze } from "../drawMaze.js";

export const fishingCanvas = /** @type {HTMLCanvasElement} */ (
  document.getElementById("fishing-canvas")
);

const FISHING_CONFIG = {
  mazeSize: 7,
  cellHeight: 30,
  circleMazeSize: 7,
  circleCellHeight: 30,
  isCircleProbability: 0.5,
};

const fishingContext = fishingCanvas.getContext("2d");

let fishingMazeObj = /** @type {MazeObj} */ (null);

const setMazeCanvasSize = () => {
  const size = fishingMazeObj.getMazeSize();
  fishingCanvas.height = size.height;
  fishingCanvas.width = size.width;
};

export const startFishing = () => {
  if (!fishingMazeObj)
    fishingMazeObj = createMazeObj(
      {
        cellHeight: FISHING_CONFIG.cellHeight,
        rows: FISHING_CONFIG.mazeSize,
        columns: FISHING_CONFIG.mazeSize,
      },
      {
        cellHeight: FISHING_CONFIG.circleCellHeight,
        rows: FISHING_CONFIG.circleMazeSize,
        columns: FISHING_CONFIG.circleMazeSize,
      }
    );

  fishingCanvas.classList.remove("hide");
  fishingMazeObj.setIsCircle(
    Math.random() > FISHING_CONFIG.isCircleProbability
  );

  setMazeCanvasSize();

  fishingMazeObj.buildMaze();

  if (MENU_CONFIG.fishingMazeSolved) fishingMazeObj.solveMaze();

  drawMaze(fishingContext, fishingMazeObj);
  drawMaze(fishingContext, fishingMazeObj);
};
