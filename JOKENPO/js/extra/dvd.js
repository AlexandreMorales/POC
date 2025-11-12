import { battleContainer, battleRect, randomInt } from "../_utils";
import {
  entitiesList,
  entitiesTouching,
  ENTITY_TYPES,
  entityKillEntity,
  getEntitySize,
  setEntityPoint,
} from "../entities/index";

const dvdEntity = /** @type {Entity & { speedX: number, speedY: number }} */ ({
  kills: [
    ENTITY_TYPES.ROCK,
    ENTITY_TYPES.PAPER,
    ENTITY_TYPES.SCISSOR,
    ENTITY_TYPES.WATER,
    ENTITY_TYPES.LOG,
    ENTITY_TYPES.FIRE,
  ],
  speed: 10,
});

const dvdColors = ["red", "blue", "green", "purple", "orange"];

const setDvdClass = () => {
  dvdEntity.element.className = `image dvd ${
    dvdColors[Math.floor(Math.random() * dvdColors.length)]
  }`;
};

export const initDvd = () => {
  const entitySize = 150;

  const element = document.createElement("DIV");
  element.style.setProperty("--entity-size", `${entitySize}px`);
  battleContainer.appendChild(element);

  dvdEntity.size = entitySize;
  dvdEntity.element = element;
  dvdEntity.speedX = dvdEntity.speedY = dvdEntity.speed;

  setEntityPoint(dvdEntity, {
    x: randomInt(0, battleRect.width - entitySize),
    y: randomInt(0, battleRect.height - entitySize),
  });
  setDvdClass();
};

const checkDvdTouch = () => {
  const freshEntities = [...entitiesList];
  freshEntities.forEach((entity) => {
    if (!entity.element) return;
    if (entitiesTouching(dvdEntity, entity)) {
      entityKillEntity(dvdEntity, entity);
    }
  });
};

export const moveDvd = () => {
  checkDvdTouch();

  const newPoint = /** @type {Point} */ ({
    x: dvdEntity.pointTop.x + dvdEntity.speedX,
    y: dvdEntity.pointTop.y + dvdEntity.speedY,
  });

  if (newPoint.x + dvdEntity.size >= battleRect.width || newPoint.x <= 0) {
    dvdEntity.speedX *= -1; // Reverse X direction
    setDvdClass();
  }

  if (newPoint.y + dvdEntity.size >= battleRect.height || newPoint.y <= 0) {
    dvdEntity.speedY *= -1; // Reverse Y direction
    setDvdClass();
  }

  setEntityPoint(dvdEntity, newPoint);
};
