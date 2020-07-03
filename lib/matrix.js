const response = {
  "game": {
    "id": "game-00fe20da-94ad-11ea-bb37",
    "timeout": 500
  },
  "turn": 14,
  "board": {
    "height": 11,
    "width": 11,
    "food": [
      { "x": 5, "y": 5 },
      { "x": 9, "y": 0 },
      { "x": 2, "y": 6 }
    ],
    "snakes": [
      {
        "id": "snake-508e96ac-94ad-11ea-bb37",
        "name": "My Snake",
        "health": 54,
        "body": [
          { "x": 0, "y": 0 },
          { "x": 1, "y": 0 },
          { "x": 2, "y": 0 }
        ],
        "head": { "x": 0, "y": 0 },
        "length": 3,
        "shout": "why are we shouting??"
      },
      {
        "id": "snake-b67f4906-94ae-11ea-bb37",
        "name": "Another Snake",
        "health": 16,
        "body": [
          { "x": 5, "y": 4 },
          { "x": 5, "y": 3 },
          { "x": 6, "y": 3 },
          { "x": 6, "y": 2 }
        ],
        "head": { "x": 5, "y": 4 },
        "length": 4,
        "shout": "I'm not really sure..."
      }
    ]
  },
  "you": {
    "id": "snake-508e96ac-94ad-11ea-bb37",
    "name": "My Snake",
    "health": 54,
    "body": [
      { "x": 0, "y": 0 },
      { "x": 1, "y": 0 },
      { "x": 2, "y": 0 }
    ],
    "head": { "x": 0, "y": 0 },
    "length": 3,
    "shout": "why are we shouting??"
  }
};


const WALL_DEFENSE_BUFFER = 1;

const createRow = (len) => [...Array(len)].map(() => 0);

const createMatrix = ({ width, height }) => {
  let matrixWidth = createRow(width)
  let matrixHeight = createRow(height)
  const matrix = matrixHeight.map(() => [...matrixWidth]);
  return matrix
}

const DEFAULT_FOOD_WEIGHT = 20;
const CAUTION_DEFAULT_WEIGHT = -1;
const CAUTION_BODY_WEIGHT = -5;
const CAUTION_HEAD_WEIGHT = -10


/**
 * @todo 
 * Implement a warning system to avoid other snakes
 * const weighWarning = ({ x, y }, matrix, warning = CAUTION_DEFAULT_WEIGHT) => { }
 */

const findOptions = (x, y, height, width) => {
  let y0 = y - 1,
    y1 = y + 1,
    x0 = x - 1,
    x1 = x + 1;
  let options = [
    [x, y0, 'down'],
    [x0, y, 'left'], [x1, y, 'right'],
    [x, y1, 'up']
  ]
  let validOptions = options.filter(([xCheck, yCheck]) => {
    return (xCheck >= 0 && xCheck <= width)
      &&
      (yCheck >= -0 && yCheck <= height)
  });
  return validOptions;
}

const findAllMax = (path, matrix, { width, height }) => {
  let { x, y } = { ...path };
  let validOptions = findOptions(x, y, height, width)
  let bestPath = { value: -20, path };
  for (let option of validOptions) {
    let matrixValue = matrix[option[1]][option[0]];
    if (bestPath.value < matrixValue) bestPath = {
      value: matrixValue, path: { x: option[0], y: option[1], }, move: option[2]
    }
    else if (bestPath.value === matrixValue) {
      bestPath.path = [bestPath.path, { x: option[0], y: option[1], }]
    }
  }
  return bestPath;
}

const findMax = (path, matrix, { width, height }) => {
  let { x, y } = { ...path };
  let validOptions = findOptions(x, y, height, width)
  let bestPath = { value: -20, path };
  for (let option of validOptions) {
    let matrixValue = matrix[option[1]][option[0]];
    if (bestPath.value < matrixValue) bestPath = {
      value: matrixValue, path: { x: option[0], y: option[1], }, move: option[2]
    }
  }
  return bestPath;
}

const checkMatch = (path, point) => (path.x == point.x) && (path.y == point.y);

const findFoodPath = (path, point, matrix, { height, width }) => {
  if (checkMatch(path, point)) return matrix;
  const distance = {
    x: Number(point.x) - Number(path.x),
    y: Number(point.y) - Number(path.y)
  }
  let options = findAllMax(path, matrix, { height, width });
  console.log(options.path);
  if (Math.abs(distance.x) >= Math.abs(distance.y)) {
    path.x += distance.x / distance.x;
  }
  else {
    path.y += distance.y / distance.y;
  }
  matrix[path.y][path.x] += 1;
  return findFoodPath(path, point, matrix, { height, width })
}

const populateFoodPath = (path, you, board, matrix) => {
  const { food } = board;
  for (let morsel of food) {
    matrix[morsel.y][morsel.x] = DEFAULT_FOOD_WEIGHT;
    let tempPath = { ...path };
    matrix = findFoodPath(tempPath, morsel, matrix, board)
  }
  const distance = {
    x: Number(food[0].x) - Number(path.x),
    y: Number(food[0].y) - Number(path.y)
  }
  return;
}

const weighSnakeBody = (you, { head, body, id }, matrix) => {
  for (let index in body) {
    let weight = CAUTION_BODY_WEIGHT;

    if (index == 0) {
      weight = CAUTION_HEAD_WEIGHT;
    }
    matrix[body[index].y][body[index].x] = weight
  }
}

const weighPerimeter = (
  board,
  you,
  matrix
) => {
  let weightedMatrix = [...matrix];
  for (let snake of board.snakes) {
    weighSnakeBody(you, snake, weightedMatrix);
  }
  let head = { ...you.head };
  populateFoodPath(head, you, board, weightedMatrix);
  // const bestMax = findMax(you.head, matrix, board);
  // console.log(bestMax);
  return weightedMatrix;//[weightedMatrix, bestMax]
}


const createWeightedMatrix = ({ board, you }) => {
  let matrix = createMatrix(board)
  let foodMatrix = weighPerimeter(board, you, matrix);
  return foodMatrix
}

const findBestDecision = ({ board, you, matrix }) => {
  const weightedMatrix = createWeightedMatrix({ board, you });
  let bestMax = findMax(you.head, weightedMatrix, board);
  return bestMax;
}
module.exports = (findBestDecision)
// console.log(findBestDecision(response));