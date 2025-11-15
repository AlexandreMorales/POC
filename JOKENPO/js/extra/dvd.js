import { battleContainer, battleRect, getRandomValueFromList } from "../_utils";
import {
  entitiesList,
  entitiesTouching,
  ENTITY_TYPES,
  entityKillEntity,
  getRandomPointForEntity,
  PLAYER_ENTITY,
  setEntityPoint,
} from "../entities/index";

const DVD_ENTITY = /** @type {DvdEntity} */ ({
  kills: [
    ENTITY_TYPES.ROCK,
    ENTITY_TYPES.PAPER,
    ENTITY_TYPES.SCISSOR,
    ENTITY_TYPES.WATER,
    ENTITY_TYPES.LOG,
    ENTITY_TYPES.FIRE,
  ],
  speed: 7,
});
let dvdList = /** @type {DvdEntity[]} */ ([]);

const dvdColors = ["red", "blue", "green", "purple", "orange"];

/**
 * @param {DvdEntity} dvdEntity
 */
const setDvdClass = (dvdEntity) => {
  dvdEntity.element.className = `image dvd ${getRandomValueFromList(
    dvdColors
  )}`;
};

export const initDvds = () => {
  dvdList = [];
};

export const createDvd = () => {
  const entitySize = 150;

  const element = document.createElement("div");
  element.style.setProperty("--entity-size", `${entitySize}px`);
  battleContainer.appendChild(element);

  const dvdEntity = { ...DVD_ENTITY, element, size: entitySize };
  dvdEntity.speedX = dvdEntity.speedY = dvdEntity.speed;

  dvdList.push(dvdEntity);

  setEntityPoint(dvdEntity, getRandomPointForEntity(dvdEntity));
  setDvdClass(dvdEntity);
};

/**
 * @param {DvdEntity} dvdEntity
 * @param {Entity[]} freshEntities
 */
const checkDvdTouch = (dvdEntity, freshEntities) => {
  freshEntities.forEach((entity) => {
    if (!entity.element) return;
    if (entitiesTouching(dvdEntity, entity)) {
      entityKillEntity(dvdEntity, entity);
    }
  });
};

export const moveDvds = () => {
  const freshEntities = [...entitiesList];
  if (PLAYER_ENTITY.element) freshEntities.push(PLAYER_ENTITY);

  dvdList.forEach((dvdEntity) => {
    checkDvdTouch(dvdEntity, freshEntities);

    const newPoint = /** @type {Point} */ ({
      x: dvdEntity.pointTop.x + dvdEntity.speedX,
      y: dvdEntity.pointTop.y + dvdEntity.speedY,
    });

    if (newPoint.x + dvdEntity.size >= battleRect.width || newPoint.x <= 0) {
      dvdEntity.speedX *= -1; // Reverse X direction
      setDvdClass(dvdEntity);
    }

    if (newPoint.y + dvdEntity.size >= battleRect.height || newPoint.y <= 0) {
      dvdEntity.speedY *= -1; // Reverse Y direction
      setDvdClass(dvdEntity);
    }

    setEntityPoint(dvdEntity, newPoint);
  });
};
