import {
  KNOWN_POLYGONS,
  MENU_CONFIG,
  POLY_INFO,
  getPolyInfo,
} from "../../1 - polygones/index.js";
import { correctRoundError, getMod, getRandomFloat } from "../../utils.js";

const CLOUDS_CONFIG = {
  num: 4,
  rows: 3,
  columns: 3,
  durationMult: 30,
};

const POLYGONS_CLASS_MAP = {
  [KNOWN_POLYGONS.TRIANGLE]: "triangle",
  [KNOWN_POLYGONS.SQUARE]: "square",
  [KNOWN_POLYGONS.HEXAGON]: "hex",
};

const cloudsContainer = document.getElementById("clouds-container");
let clouds = /** @type {HTMLDivElement[]} */ ([]);

export const updateClouds = () => {
  if (MENU_CONFIG.clouds) {
    if (!clouds.length) createClouds();

    setCloudShape();
    offsetClouds();
  } else {
    clouds.forEach((c) => cloudsContainer.removeChild(c));
    clouds = [];
  }
};

const setCloudShape = () => {
  const { currentPoly, cellHeight } = POLY_INFO;
  const size = Math.min(
    cellHeight * 4,
    cloudsContainer.offsetWidth /
      (CLOUDS_CONFIG.num * CLOUDS_CONFIG.columns * 1.5)
  );
  cloudsContainer.className = POLYGONS_CLASS_MAP[currentPoly];
  cloudsContainer.style.setProperty("--clouds-default-size", `${size}px`);
};

const offsetClouds = () => {
  const { xSide } = getPolyInfo();
  const { jOffset, currentPoly } = POLY_INFO;
  const offsetSize = (xSide * jOffset * currentPoly) / -4;
  const offsetLeft = getMod(offsetSize, cloudsContainer.offsetWidth);
  const width = cloudsContainer.offsetWidth / CLOUDS_CONFIG.num;
  const defaultOffsetLeft = cloudsContainer.offsetWidth / 4;

  cloudsContainer.style.setProperty(
    "--clouds-offset-left",
    `${getMod(offsetSize, width) - defaultOffsetLeft}px`
  );
  const offset = Math.floor(offsetLeft / width);

  for (let index = 0; index < clouds.length; index++) {
    clouds[index].style.setProperty(
      "--clouds-order",
      `${getMod(index + offset, CLOUDS_CONFIG.num) + 1}`
    );
  }
};

const createClouds = () => {
  const min = 1 - CLOUDS_CONFIG.num / 10;
  const max = Math.min(min + 0.5, 1);

  for (let i = 0; i < CLOUDS_CONFIG.num; i++) {
    const cloud = document.createElement("div");
    cloud.className = "cloud";

    const scale = correctRoundError(getRandomFloat(min, max), 2);
    const duration = Math.round(scale * CLOUDS_CONFIG.durationMult);
    cloud.style.setProperty("--clouds-scale", `${scale}`);
    cloud.style.setProperty("--clouds-animation-duration", `${duration}s`);

    cloudsContainer.appendChild(cloud);
    clouds.push(cloud);

    for (let j = 0; j < CLOUDS_CONFIG.rows; j++) {
      const cloudRow = document.createElement("div");
      cloudRow.className = "cloud-row";
      cloud.appendChild(cloudRow);

      for (let z = 0; z < CLOUDS_CONFIG.columns; z++) {
        const cloudShape = document.createElement("div");
        cloudShape.className = "cloud-shape";
        cloudRow.appendChild(cloudShape);
      }
    }
  }
};
