/**
 * @typedef {Object} BlockProps
 * @property {number} max
 */

/**
 * @typedef {Block & BlockProps} BlockEntity
 */

/**
 * @typedef {Object} Biome
 * @property {BlockEntity[]} ranges
 * @property {number} minDistance The min distance from 0,0 for this biome to appear
 * @property {number} minValue The min value from perlin noise for this biome to appear
 * @property {boolean} [negativeI]
 * @property {boolean} [negativeJ]
 * @property {Block} higherGroundBlock
 * @property {Color} mapColor
 * @property {string} name
 */

/**
 * @typedef {Object} MazeObj
 * @property {() => { height: number, width: number  }} getMazeSize
 * @property {(posIndex: number) => boolean} mazeMove
 * @property {() => void} buildMaze
 * @property {() => void} solveMaze
 * @property {(isCircle: boolean) => void} setIsCircle
 * @property {() => Point} getCirclePoint
 * @property {() => number} getMazeRows
 * @property {(index: number) => number} getNumCellsPerMazeRow
 * @property {(pos: Pos) => CellMaze} getMazeCell
 * @property {() => PolyInfoProp} getMazePolyInfo
 */

/**
 * @typedef {Object} CellMazeCircleProps
 * @property {Point} topLeftPoint
 * @property {Point} topRightPoint
 * @property {Point} bottomLeftPoint
 * @property {Point} bottomRightPoint
 * @property {number} topRadius
 * @property {number} bottomRadius
 * @property {number} topLeftAngle
 * @property {number} topRightAngle
 * @property {number} bottomLeftAngle
 * @property {number} bottomRightAngle
 * @property {Pos[]} adjacentPos
 */

/**
 * @typedef {Object} CellMazeProps
 * @property {Point} point
 * @property {boolean[]} borders
 * @property {boolean} active
 * @property {boolean} visited
 * @property {boolean} solved
 * @property {boolean} path
 * @property {CellMazeCircleProps} [circleProps]
 */

/**
 * @typedef {CellProps & CellMazeProps} CellMaze
 */
