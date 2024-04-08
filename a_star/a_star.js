const canvas = document.getElementById('canvas_A_star');
const context = canvas.getContext('2d');

// Дефолтные значения
var isStart;
var isEnd;
var startPoint;
var endPoint;
var colorEnds = '#7000FF'; // Фиолетовый
var pathColor = '#45CC8B'; // Зеленый

setDefoltValues();

canvas.width = 700;
canvas.height = 700;

var N = 37; // Заменить потом на ввод с клавы
var maze = [];

function randomProbability() {
    return 0.5 - Math.random();
}

// Установка дефолтных значений для canvas
function setDefoltValues() {
    isStart = false;
    isEnd = false;
    startPoint = { x: null, y: null };
    endPoint = { x: null, y: null };
}

// Очистка canvas
function resetCanvas() {
    maze = [];
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
}

// Выбор старта и конца по клику
canvas.addEventListener('click', function(event) {
    var rectangle = canvas.getBoundingClientRect();
    context.fillStyle = colorEnds;
    context.strokeStyle = colorEnds;

    let x = event.clientX - rectangle.left;
    let y = event.clientY - rectangle.top;

    let cellX = Math.floor(x / cellSize);
    let cellY = Math.floor(y / cellSize);

    console.log(cellX, cellY);

    if (!maze[cellY][cellX]) {
        if (!isStart) {
            startPoint.x = cellX;
            startPoint.y = cellY;
            isStart = true;

            context.fillRect(startPoint.x * cellSize, startPoint.y * cellSize, cellSize, cellSize);
            context.strokeRect(startPoint.x * cellSize, startPoint.y * cellSize, cellSize, cellSize);
        }

        else if (!isEnd) {
            endPoint.x = cellX;
            endPoint.y = cellY;
            isEnd = true;

            context.fillRect(endPoint.x * cellSize, endPoint.y * cellSize, cellSize, cellSize);
            context.strokeRect(endPoint.x * cellSize, endPoint.y * cellSize, cellSize, cellSize);
        }
    }
});

document.getElementById('reset_button').onclick = function() {
    setDefoltValues();
    resetCanvas();
};

var cellSize;
function createMaze() {
    setDefoltValues();

    resetCanvas();

    cellSize = canvas.width / N;

    for (let i = 0; i < N; i++) {
        maze[i] = [];
        for (let j = 0; j < N; j++) {
            maze[i][j] = true;
        }
    }

    getMaze(maze);
    drawMaze(maze);

    console.log(maze);
}

// Генерация лабиринта
function getMaze(maze, row=1, col=1) {
    maze[row][col] = false;

    // Задаем рандомный  порядок направлений
    let directions = ['top', 'bottom', 'right', 'left'].sort(function() { return randomProbability(); });

    for (let i = 0; i < directions.length; i++) {
        switch (directions[i]) {
            case 'top':
                if (row - 2 <= 0)
                    continue;
                if (maze[row - 2][col]) {
                    maze[row - 1][col] = false;
                    getMaze(maze, row - 2, col, N);
                }
                break;

            case 'bottom':
                if (row + 2 >= N - 1)
                    continue;
                if (maze[row + 2][col]) {
                    maze[row + 1][col] = false;
                    getMaze(maze, row + 2, col, N);
                }
                break;

            case 'right':
                if (col + 2 >= N - 1)
                    continue;
                if (maze[row][col + 2]) {
                    maze[row][col + 1] = false;
                    getMaze(maze, row, col + 2, N);
                }
                break;

            case 'left':
                if (col - 2 <= 0)
                    continue;
                if (maze[row][col - 2]) {
                    maze[row][col - 1] = false;
                    getMaze(maze, row, col - 2, N);
                }
                break;
        }
    }
}

function drawMaze(maze, color='white') {
    context.fillStyle = color; 
    context.strokeStyle = color;

    context.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            if (maze[j][i]) {
                context.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
                context.strokeRect(i * cellSize, j * cellSize, cellSize, cellSize);
            }
        }
    }
}

class Node {
    constructor(x, y, parent = null) {
        this.x = x;
        this.y = y;
        this.parent = parent;
        this.g = 0;
        this.h = 0;
    }

    get f() {
        return this.g + this.h;
    }
}

async function AStarWithDrawing(startX, startY, endX, endY, maze, time=10) {
    const openList = [];
    const closedList = {};

    const startNode = new Node(startX, startY);
    const endNode = new Node(endX, endY);

    openList.push(startNode);

    while (openList.length > 0) {
        let currentNode = openList.reduce((acc, node) => node.f < acc.f ? node : acc, openList[0]);

        if (currentNode !== startNode) {
            drawCeil(currentNode.y, currentNode.x);
            drawCeil(endY, endX, colorEnds);
            // Ожидание
            await new Promise(resolve => setTimeout(resolve, time));
        }

        if (currentNode.x === endNode.x && currentNode.y === endNode.y) {
            let path = [];
            let pathSize = 0;
            while (currentNode !== null) {
                path.push({x: currentNode.x, y: currentNode.y});
                pathSize += 1;
                
                currentNode = currentNode.parent;
            }

            // Отрисовка пути
            for (let i = pathSize - 2; i > 0; i--) {
                drawCeil(path[i].y, path[i].x, pathColor);
                await new Promise(resolve => setTimeout(resolve, time));
            }
        }

        openList.splice(openList.indexOf(currentNode), 1);
        closedList[`${currentNode.x},${currentNode.y}`] = true;

        const neighbors = [
            { x: currentNode.x - 1, y: currentNode.y },
            { x: currentNode.x + 1, y: currentNode.y },
            { x: currentNode.x, y: currentNode.y - 1 },
            { x: currentNode.x, y: currentNode.y + 1 }
        ];

        neighbors.forEach(neighbor => {
            if (neighbor.x < 0 || neighbor.x >= maze.length || neighbor.y < 0 || neighbor.y >= maze[0].length) {
                return;
            }

            if (maze[neighbor.x][neighbor.y] || closedList[`${neighbor.x},${neighbor.y}`]) {
                return;
            }

            const neighborNode = new Node(neighbor.x, neighbor.y, currentNode);
            neighborNode.g = currentNode.g + 1;
            neighborNode.h = Math.abs(endX - neighbor.x) + Math.abs(endY - neighbor.y);

            if (openList.findIndex(node => node.x === neighbor.x && node.y === neighbor.y) !== -1 && neighborNode.g >= currentNode.g) {
                return;
            }

            openList.push(neighborNode);
        });
    }

    return null;
}

function drawCeil(x, y, currentColor='#F73A53') {
    context.fillStyle = currentColor; 
    context.strokeStyle = currentColor;

    context.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
    context.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
}

// Отрисовка лабиринта по нажатию по кнопке
document.getElementById('maze_button').onclick = mazeProcessing;
function mazeProcessing() {
    createMaze();
}

// Запуск алгоритма по нажатию по кнопке
document.getElementById('a_star_button').onclick = buttonProcessing;
function buttonProcessing() {
    console.log(startPoint, endPoint);
    if (startPoint.x !== null & startPoint.y !== null & endPoint.x !== null & endPoint.y !== null) {
        AStarWithDrawing(startPoint.y, startPoint.x, endPoint.y, endPoint.x, maze);
    }
    else {
        window.alert("Нарисуйте лабиринт и выберите стартовую и финишную клетку");
    }
}