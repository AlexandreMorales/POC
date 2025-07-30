import { POLY_INFO } from "../configs/infos.js";
import {
  CONFIG,
  CANVAS_CONFIG,
  MAP_CONFIG,
  MENU_CONFIG,
} from "../configs/configs.js";
import { GRID, calculatePointBasedOnPos, getGridCell } from "../grid/grid.js";
import {
  debounce,
  getMod,
  isPointOutsideCanvas,
  tweakColor,
} from "../utils.js";
import { getAllEntities, updateEntities } from "../entities/entities.js";
import { PLAYER_ENTITY } from "../entities/player.js";
import { MAP_INFO } from "../grid/infos.js";

const spinContainer = document.getElementById("spin-container");
const container = document.getElementById("draw-container");
const canvasContainer = document.getElementById("canvas-container");

const containers = [spinContainer, container, canvasContainer];

const canvasLayers = /** @type {HTMLCanvasElement[]} */ ([]);
const contextsLayers = /** @type {CanvasRenderingContext2D[]} */ ([]);

for (let i = 0; i < CONFIG.maxLayer; i++) {
  const canvas = document.createElement("canvas");
  canvas.style.zIndex = `${i}`;
  canvasContainer.appendChild(canvas);
  canvasLayers.push(canvas);
  contextsLayers.push(canvas.getContext("2d"));
}

/**
 * @param {number} height
 * @param {number} width
 */
export const setCanvasSize = (height, width) => {
  if (height) {
    containers.forEach((c) => (c.style.height = `${height}px`));
    canvasLayers.forEach((canvas) => (canvas.height = height));
  }
  if (width) {
    containers.forEach((c) => (c.style.width = `${width}px`));
    canvasLayers.forEach((canvas) => (canvas.width = width));
  }
};

export const resetCanvasSize = () => {
  const polyInfo = POLY_INFO[MAP_INFO.currentPoly];
  setCanvasSize(polyInfo.canvasHeight, polyInfo.canvasWidth);
};

export const updateCanvasCss = () => {
  if (MENU_CONFIG.usePerspective) {
    canvasContainer.style.transform = "perspective(50px) rotateX(1deg)";
    canvasContainer.style.marginTop = "-70px";
  } else {
    canvasContainer.style.transform = null;
    canvasContainer.style.marginTop = null;
  }
};

let wallLayers = /** @type {Wall[][]} */ ([]);
let filledThisRound =
  /** @type {Set<import("../configs/infos.js").CellPos>} */ (new Set());
export const drawEveryCell = () => {
  wallLayers = [];
  fluids = [];
  filledThisRound = new Set();

  const offsetCell = PLAYER_ENTITY.cell.pos.j % 2;
  const { rows, columns, shouldIntercalate } = POLY_INFO[MAP_INFO.currentPoly];

  // More range to encapsulate rotation
  for (let i = -columns; i < rows + columns; i++) {
    const baseI = i + MAP_INFO.iOffset;
    for (let j = -rows; j < rows + columns; j++) {
      let nI = baseI;
      const nJ = j + MAP_INFO.jOffset;

      if (shouldIntercalate && offsetCell && nJ % 2 === 0) nI = nI + 1;

      drawCell(getGridCell(nI, nJ), contextsLayers[0]);
    }
  }

  drawWalls();
  updateEntities();
  tweakFluids();
};

const drawWalls = () => {
  for (let i = 1; i < CONFIG.maxLayer; i++) {
    const canvas = canvasLayers[i];
    const context = contextsLayers[i];
    const walls = wallLayers[i];
    // reset canvas
    canvas.width = POLY_INFO[MAP_INFO.currentPoly].canvasWidth;
    if (!walls || !canvas || !context) continue;
    walls.forEach((w) => drawWall(w, context));
    walls.forEach((w) => drawWallTop(w, context));
  }
  wallLayers = [];
};

/**
 * @param {Wall} wall
 * @param {CanvasRenderingContext2D} context
 */
const drawWall = (wall, context) => {
  // Only draw if there is a gap, if is sorrounded by walls it doesnt need
  if (wall.borderMap.find((b) => !!b))
    drawItem(context, wall, CANVAS_CONFIG.wallDarkness);
};

/**
 * @param {Wall} wall
 * @param {CanvasRenderingContext2D} context
 */
const drawWallTop = (wall, context) => {
  drawItem(context, wall.topInfo);

  context.strokeStyle = CANVAS_CONFIG.strokeColor;
  context.lineWidth = CANVAS_CONFIG.lineWidth;
  applyBorders(
    context,
    wall.topInfo.point,
    wall.topInfo.points,
    wall.borderMap
  );
};

let fluidInterval = null;
let fluids = /** @type {Drawable[]} */ ([]);
const tweakFluids = debounce(() => {
  clearInterval(fluidInterval);
  if (!fluids.length) return;
  const context = contextsLayers[0];

  fluidInterval = setInterval(() => {
    fluids.forEach((fluid) => {
      drawItem(context, {
        ...fluid,
        color: tweakColor(fluid.color),
      });
    });
  }, CANVAS_CONFIG.fluidSpeed);
}, CANVAS_CONFIG.fluidSpeed);

/**
 * @param {import("../configs/infos.js").Cell} cell
 * @param {CanvasRenderingContext2D} context
 */
const drawCell = (cell, context) => {
  const polyInfo = POLY_INFO[MAP_INFO.currentPoly];
  const isInverted = polyInfo.hasInverted && cell.isInverted;

  const point = calculatePointBasedOnPos(cell.pos, isInverted, PLAYER_ENTITY);

  if (isPointOutsideCanvas(point, polyInfo.canvasHeight, polyInfo.canvasWidth))
    return;

  const points = isInverted ? polyInfo.invertedPoints : polyInfo.points;
  const aCells = cell.adjacentPos[MAP_INFO.currentPoly].map(
    ({ i, j }) => GRID[i]?.[j]
  );

  const shoulApplyDark =
    cell !== PLAYER_ENTITY.cell &&
    aCells.every((c) => c !== PLAYER_ENTITY.cell);

  if (cell.wall) {
    const wallPoints = isInverted
      ? polyInfo.wallInvertedPoints
      : polyInfo.wallPoints;
    const { layer } = cell.wall;

    const shouldOffset = polyInfo.hasInverted && !cell.isInverted;

    if (!wallLayers[layer]) wallLayers[layer] = [];
    const commonInfos = {
      shoulApplyDark,
      color: cell.wall.color,
      pos: cell.pos,
      isInverted,
    };

    wallLayers[layer].push({
      ...commonInfos,
      point: { x: point.x, y: point.y - polyInfo.ySide * (layer - 1) },
      points: wallPoints,
      topInfo: {
        ...commonInfos,
        point: { x: point.x, y: point.y - polyInfo.ySide * layer },
        points,
      },
      borderMap: aCells.reduce((acc, c, i) => {
        let index = i - MAP_INFO.rotationTurns;
        if (shouldOffset) index = MAP_INFO.currentPoly - 1 - index;
        acc[getMod(index, MAP_INFO.currentPoly)] = c?.wall?.layer !== layer;
        return acc;
      }, []),
    });

    return;
  }

  // Near fluid cells should take over
  if (!cell.block) {
    const aFluid = aCells.find((c) => c?.block?.isFluid);
    if (aFluid && !filledThisRound.has(aFluid.pos)) {
      filledThisRound.add(cell.pos);
      cell.block = aFluid.block;
      cell.color = aFluid.color;
    }
  }

  const drawable = /** @type {Drawable} */ ({
    point,
    points,
    isInverted,
    pos: cell.pos,
    color: cell.color,
    shoulApplyDark,
  });

  if (cell.block?.isFluid) {
    drawable.color = tweakColor(drawable.color);
    fluids.push(drawable);
  }

  drawItem(context, drawable);
};

/**
 * @param {CanvasRenderingContext2D} context
 * @param {Drawable} drawable
 * @param {number} [modifier]
 */
const drawItem = (
  context,
  { point, points, pos, isInverted, color, shoulApplyDark },
  modifier
) => {
  context.fillStyle = color
    ? getFillStyle(color, shoulApplyDark, modifier)
    : CANVAS_CONFIG.emptyColor;

  fillPolygon(context, point, points);

  if (MENU_CONFIG.showPos)
    showPos(context, pos, point, isInverted, POLY_INFO[MAP_INFO.currentPoly]);

  if (MENU_CONFIG.showChunks) showChunks(context, pos, point, points);
};

/**
 * @param {import("../configs/infos.js").Color} color
 * @param {boolean} shoulApplyDark
 * @param {number} modifier
 * @return {string}
 */
const getFillStyle = ({ r, g, b }, shoulApplyDark, modifier = 1) => {
  if (MAP_INFO.timeOfDay && shoulApplyDark)
    modifier = (1 - MAP_INFO.timeOfDay / 100) * modifier;

  return `rgb(${r * modifier}, ${g * modifier}, ${b * modifier})`;
};

/**
 * @param {CanvasRenderingContext2D} context
 * @param {import("../configs/infos.js").Point} point
 * @param {import("../configs/infos.js").Point[]} points
 */
const fillPolygon = (context, { x, y }, points) => {
  context.beginPath();

  for (const point of points) {
    context.lineTo(x + point.x, y + point.y);
  }

  context.closePath();
  context.fill();
};

/**
 * @param {CanvasRenderingContext2D} context
 * @param {import("../configs/infos.js").Point} point
 * @param {import("../configs/infos.js").Point[]} points
 * @param {boolean[]} [map]
 */
const applyBorders = (context, { x, y }, points, map) => {
  for (let i = 0; i < points.length; i++) {
    if (!map || map[i]) {
      let point = points[i];
      let nextPoint = points[i + 1] || points[0];

      context.beginPath();
      context.moveTo(x + point.x, y + point.y);
      context.lineTo(x + nextPoint.x, y + nextPoint.y);
      context.stroke();
    }
  }
};

/**
 * @param {CanvasRenderingContext2D} context
 * @param {import("../configs/infos.js").CellPos} pos
 * @param {import("../configs/infos.js").Point} point
 * @param {boolean} isInverted
 * @param {import("../configs/infos.js").PolyInfoProp} polyInfo
 */
const showPos = (context, pos, point, isInverted, polyInfo) => {
  context.fillStyle = "black";
  context.font = `bold ${CONFIG.cellHeight / 5}px Arial`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(
    `${pos.i},${pos.j}`,
    point.x,
    isInverted ? point.y + polyInfo.ySide / 2 : point.y
  );
};

/**
 * @param {CanvasRenderingContext2D} context
 * @param {import("../configs/infos.js").CellPos} pos
 * @param {import("../configs/infos.js").Point} point
 * @param {import("../configs/infos.js").Point[]} points
 */
const showChunks = (context, pos, point, points) => {
  if (pos.i % CONFIG.chunkRows === 0 || pos.j % CONFIG.chunkColumns === 0) {
    context.strokeStyle = CANVAS_CONFIG.strokeColor;
    context.lineWidth = CANVAS_CONFIG.lineWidth;
    applyBorders(context, point, points);
  }
};

/**
 * @param {number} deg
 */
export const rotateCanvas = (deg) => {
  const transitionDuration = `${
    MAP_CONFIG.rotateDelay + 6000 / CONFIG.cellHeight
  }ms`;
  const transitionProperty = "transform";

  getAllEntities().forEach((e) => {
    if (e.img) {
      e.img.style.transitionDuration = transitionDuration;
      e.img.style.transitionProperty = transitionProperty;
      e.img.style.transform = `rotate(${-deg}deg)`;
    }
  });

  container.style.transitionDuration = transitionDuration;
  container.style.transitionProperty = transitionProperty;
  container.style.transform = `rotate(${deg}deg)`;
  spinContainer.style.background = canvasLayers
    .map((c) => `url(${c.toDataURL()})`)
    .join(", ");
};

export const resetRotateCanvas = () => {
  getAllEntities().forEach((e) => {
    if (e.img) {
      e.img.style.transitionDuration = null;
      e.img.style.transitionProperty = null;
      e.img.style.transform = null;
    }
  });

  container.style.transitionDuration = null;
  container.style.transitionProperty = null;
  container.style.transform = null;
  spinContainer.style.background = null;
};
