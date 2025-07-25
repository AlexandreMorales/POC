/**
 * @param {number} width
 * @param {number} height
 * @param {number} resolution
 * @returns {number[][]}
 */
export const getPerlinGrid = (width, height, resolution) => {
  const vectors = getVectors(width, height, resolution);
  return getValues(width, height);

  function getVectors(width, height, resolution) {
    const numVectorsX = Math.floor(width / resolution) + 1;
    const extraVectorX = width % resolution == 0 ? 0 : 1;
    const finalNumVectorsX = numVectorsX + extraVectorX;

    const numVectorsY = Math.floor(height / resolution) + 1;
    const extraVectorY = height % resolution == 0 ? 0 : 1;
    const finalNumVectorsY = numVectorsY + extraVectorY;

    return new Array(finalNumVectorsY)
      .fill(0)
      .map(() => new Array(finalNumVectorsX).fill(0).map(getRandUnitVect));
  }

  function getRandUnitVect() {
    const theta = Math.random() * 2 * Math.PI;
    return { x: Math.cos(theta), y: Math.sin(theta) };
  }

  function getValues(width, height) {
    const values = [];

    for (let y = 0; y < height; y++) {
      values[y] = [];
      for (let x = 0; x < width; x++) {
        values[y][x] = getValue(x, y);
      }
    }
    return values;
  }

  function getValue(x, y) {
    const offset = 0.5 / resolution;

    x = x / resolution + offset;
    y = y / resolution + offset;

    const xF = Math.floor(x);
    const yF = Math.floor(y);

    const tlv = dotProduct(x, y, xF, yF);
    const trv = dotProduct(x, y, xF + 1, yF);
    const blv = dotProduct(x, y, xF, yF + 1);
    const brv = dotProduct(x, y, xF + 1, yF + 1);

    const lerpTop = lerp(tlv, trv, x - xF);
    const lerpBottom = lerp(blv, brv, x - xF);
    const value = lerp(lerpTop, lerpBottom, y - yF);

    return value;
  }

  function dotProduct(x, y, vx, vy) {
    const distVector = {
      x: x - vx,
      y: y - vy,
    };

    return dot(distVector, vectors[vy][vx]);
  }

  function dot(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y;
  }

  function lerp(a, b, x) {
    return a + smootherstep(x) * (b - a);
  }

  function smootherstep(x) {
    return 6 * x ** 5 - 15 * x ** 4 + 10 * x ** 3;
  }
};
