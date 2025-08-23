import { KNOWN_POLYGONS, MENU_CONFIG } from "../../1 - polygones/_configs.js";
import { RENDER_INFO } from "../../1 - polygones/_infos.js";
import { getMovementMap } from "../../2 - entities/index.js";
import { setEntitySize, setImagePoint } from "../../2 - entities/render.js";
import { createMazeObj } from "../../3 - generation/index.js";
import { drawMaze } from "../drawMaze.js";

export const fishingCanvas = /** @type {HTMLCanvasElement} */ (
  document.getElementById("fishing-canvas")
);
const fishingContext = fishingCanvas.getContext("2d");

const fishingContainer = document.getElementById("fishing-container");
const fishingRodImg = /** @type {HTMLImageElement} */ (
  document.getElementById("fishing-rod")
);
const fishingFishImg = /** @type {HTMLImageElement} */ (
  document.getElementById("fishing-fish")
);

const FISHING_CONFIG = {
  mazeSize: 7,
  cellHeight: 30,
  circleMazeSize: 5,
  circleCellHeight: 30,
  isCircleProbability: 0.01,
  secondsToFish: 15,
  timerDelay: 100,
  timer: null,
};

let fishingMazeObj = /** @type {MazeObj} */ (null);

export let IS_FISHING_ACTIVE = false;
let FISHING_IS_CIRCLE = false;

/**
 * @param {{ height: number, width: number  }} size
 */
const setFishingCanvasSize = ({ height, width }) => {
  fishingCanvas.height = height;
  fishingCanvas.width = width;
};

const initFishingImages = () => {
  const { ySide } = fishingMazeObj.getMazePolyInfo();

  setEntitySize(fishingFishImg, ySide);
  setEntitySize(fishingRodImg, ySide);
  setImagePoint(
    fishingFishImg,
    fishingMazeObj.getCurrentMazeCell().point,
    true,
    ySide
  );
  setImagePoint(
    fishingRodImg,
    FISHING_IS_CIRCLE
      ? fishingMazeObj.getCirclePoint()
      : fishingMazeObj.getLastMazeCell().point,
    true,
    ySide
  );
};

const stopFishing = () => {
  clearInterval(FISHING_CONFIG.timer);
  fishingContainer.classList.add("hide");
  IS_FISHING_ACTIVE = false;
};

const initFishingMazeObj = () => {
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

  fishingMazeObj.setIsCircle(FISHING_IS_CIRCLE);
  fishingMazeObj.buildMaze();
  if (MENU_CONFIG.fishingMazeSolved) fishingMazeObj.solveMaze();
};

/**
 * @param {number} height
 */
const initFishingTimer = (height) => {
  fishingContainer.style.setProperty(
    "--fishing-progress-bar-init-height",
    `${height}px`
  );
  fishingContainer.style.setProperty(
    "--fishing-progress-bar-height",
    `${height}px`
  );

  let currentHeight = height;
  const timerSteps =
    height /
    ((FISHING_CONFIG.secondsToFish * 1000) / FISHING_CONFIG.timerDelay);

  FISHING_CONFIG.timer = setInterval(() => {
    currentHeight -= timerSteps;
    fishingContainer.style.setProperty(
      "--fishing-progress-bar-height",
      `${currentHeight}px`
    );
    if (currentHeight <= 0) stopFishing();
  }, FISHING_CONFIG.timerDelay);
};

export const startFishing = () => {
  if (IS_FISHING_ACTIVE) return stopFishing();
  IS_FISHING_ACTIVE = true;
  FISHING_IS_CIRCLE = Math.random() < FISHING_CONFIG.isCircleProbability;

  initFishingMazeObj();

  const size = fishingMazeObj.getMazeSize();
  setFishingCanvasSize(size);

  drawMaze(fishingContext, fishingMazeObj);
  drawMaze(fishingContext, fishingMazeObj);

  initFishingImages();

  fishingContainer.classList.remove("hide");
  initFishingTimer(size.height);
};

/**
 * @param {symbol} code
 * @param {boolean} [useDiagonal]
 */
export const moveFishing = (code, useDiagonal) => {
  const { ySide, hasInverted } = fishingMazeObj.getMazePolyInfo();
  const currentCell = fishingMazeObj.getCurrentMazeCell();
  const aIndex = getMovementMap(
    currentCell,
    useDiagonal,
    0,
    FISHING_IS_CIRCLE ? KNOWN_POLYGONS.SQUARE : null,
    hasInverted
  )[code];

  const nextCell = fishingMazeObj.mazeMove(aIndex);

  if (!nextCell) return;

  if (fishingMazeObj.isMazeSolved()) stopFishing();

  setImagePoint(fishingFishImg, nextCell.point, true, ySide);
  drawMaze(fishingContext, fishingMazeObj);
};
