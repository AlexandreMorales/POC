/**
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1) + min);

/**
 * @param {any[]} list
 * @returns {any}
 */
export const getRandomValueFromList = (list) =>
  list[Math.floor(Math.random() * list.length)];

/**
 * @param {Point} point1
 * @param {Point} point2
 * @returns {number}
 */
export const getPointDistance = (point1, point2) =>
  Math.sqrt((point1.x - point2.x) ** 2 + (point1.y - point2.y) ** 2);

/**
 * @param {Point} point
 * @param {Point} targetPoint
 * @param {number} distance
 * @param {number} speed
 * @returns {Point}
 */
export const movePointTowards = (point, targetPoint, distance, speed) => {
  const normalizedDirection = {
    x: (targetPoint.x - point.x) / distance,
    y: (targetPoint.y - point.y) / distance,
  };

  return {
    x: point.x + normalizedDirection.x * speed,
    y: point.y + normalizedDirection.y * speed,
  };
};

export const battleContainer = document.getElementById("battle-container");
export const battleRect = battleContainer.getBoundingClientRect();
