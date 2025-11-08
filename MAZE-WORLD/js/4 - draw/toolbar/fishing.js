import {
  setEntityImageSize,
  setImagePoint,
  getMovementMap,
  setImagePos,
  PLAYER_ENTITY,
  makeEntityWin,
  makeEntityLose,
} from "../../2 - entities/index.js";
import { BLOCKS, createMazeObj } from "../../3 - generation/index.js";

import { tweakColor } from "../../_utils.js";
import { DRAW_CONFIG } from "../_config.js";
import { drawCellMaze } from "../drawMaze.js";

const fishingCanvas = /** @type {HTMLCanvasElement} */ (
  document.getElementById("fishing-canvas")
);
const fishingContext = fishingCanvas.getContext("2d");

const fishingLineCanvas = /** @type {HTMLCanvasElement} */ (
  document.getElementById("fishing-line-canvas")
);
const fishingLineContext = fishingLineCanvas.getContext("2d");
fishingLineContext.strokeStyle = "black";

const fishingContainer = document.getElementById("fishing-container");
const fishingRodImg = /** @type {HTMLElement} */ (
  document.getElementById("fishing-rod")
);
const fishingRodPos = /** @type {Pos} */ ({ i: 8, j: 0 });
const fishingFishImg = /** @type {HTMLElement} */ (
  document.getElementById("fishing-fish")
);
const fishingFishPos = /** @type {Pos} */ ({ i: 2, j: 1 });

const FISHING_CONFIG = {
  mazeSize: 7,
  cellHeight: 45,
  circleMazeSize: 5,
  circleCellHeight: 30,
  isCircleProbability: 0.05,
  secondsToFish: 20,
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
  fishingLineCanvas.height = fishingCanvas.height = height;
  fishingLineCanvas.width = fishingCanvas.width = width;
};

/**
 * @returns {Point}
 */
const getFishingRodPoint = () =>
  FISHING_IS_CIRCLE
    ? fishingMazeObj.getCirclePoint()
    : fishingMazeObj.getLastMazeCell().point;

const drawFishingLine = () => {
  fishingLineCanvas.height = fishingLineCanvas.height;
  const fishPoint = fishingMazeObj.getCurrentMazeCell().point;
  const rodPoint = getFishingRodPoint();

  fishingLineContext.moveTo(fishPoint.x, fishPoint.y);
  fishingLineContext.lineTo(rodPoint.x, rodPoint.y);
  fishingLineContext.stroke();
};

const initFishingImages = () => {
  const { ySide } = fishingMazeObj.getMazePolyInfo();

  setImagePos(fishingRodImg, fishingRodPos);
  setEntityImageSize(fishingRodImg, ySide);
  setImagePoint(fishingRodImg, getFishingRodPoint(), true, ySide);

  setImagePos(fishingFishImg, fishingFishPos);
  setEntityImageSize(fishingFishImg, ySide);
  setImagePoint(
    fishingFishImg,
    fishingMazeObj.getCurrentMazeCell().point,
    true,
    ySide
  );

  drawFishingLine();
};

export const stopFishing = () => {
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
    if (currentHeight <= 0) {
      stopFishing();
      makeEntityLose(PLAYER_ENTITY);
    }
  }, FISHING_CONFIG.timerDelay);
};

let fishingFluidInterval = null;

/**
 * @param {MazeObj} mazeObj
 */
const initFishingDraw = (mazeObj) => {
  clearInterval(fishingFluidInterval);

  const cells = /** @type {CellMaze[]} */ ([]);

  for (const pos of mazeObj.iterateOverMaze()) {
    const cell = mazeObj.getMazeCell(pos);
    cells.push(cell);
    drawCellMaze(fishingContext, mazeObj, cell, tweakColor(BLOCKS.WATER.color));
  }

  if (!cells.length) return;

  fishingFluidInterval = setInterval(() => {
    cells.forEach((c) =>
      drawCellMaze(fishingContext, mazeObj, c, tweakColor(BLOCKS.WATER.color))
    );
  }, DRAW_CONFIG.fluidSpeed);
};

export const startFishing = () => {
  if (IS_FISHING_ACTIVE) return stopFishing();
  IS_FISHING_ACTIVE = true;
  FISHING_IS_CIRCLE = Math.random() < FISHING_CONFIG.isCircleProbability;

  initFishingMazeObj();

  const size = fishingMazeObj.getMazeSize();
  // Prevent hex to cut last border
  size.height += FISHING_CONFIG.cellHeight / 9;
  setFishingCanvasSize(size);

  initFishingImages();

  fishingContainer.classList.remove("hide");
  initFishingTimer(size.height);

  initFishingDraw(fishingMazeObj);
};

let canMoveFishing = true;
/**
 * @param {symbol} code
 * @param {boolean} [useDiagonal]
 */
export const moveFishing = (code, useDiagonal) => {
  if (canMoveFishing) {
    const { ySide, hasInverted, polySides } = fishingMazeObj.getMazePolyInfo();
    const currentCell = fishingMazeObj.getCurrentMazeCell();
    const aIndex = getMovementMap(
      currentCell,
      useDiagonal,
      0,
      polySides,
      !FISHING_IS_CIRCLE && hasInverted
    )[code];

    const nextCell = fishingMazeObj.mazeMove(aIndex);

    if (!nextCell) return;

    if (fishingMazeObj.isMazeSolved()) {
      stopFishing();
      makeEntityWin(PLAYER_ENTITY, fishingFishPos);
      return;
    }

    setImagePoint(fishingFishImg, nextCell.point, true, ySide);
    drawFishingLine();

    canMoveFishing = false;
    setTimeout(() => {
      canMoveFishing = true;
    }, 100);
  }
};
