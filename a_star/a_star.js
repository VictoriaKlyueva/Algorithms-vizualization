const canvas = document.getElementById('canvas_A_star');
const context = canvas.getContext('2d');

// Дефолтные значения
var isStart;
var isEnd;
var startPoint;
var endPoint;

setDefoltValues();

canvas.width = 700;
canvas.height = 700;

var N = 21 // Заменить потом на ввод с клавы

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

canvas.addEventListener('click', function(event) {
    var rectangle = canvas.getBoundingClientRect();

    var x = event.clientX - rectangle.left;
    var y = event.clientY - rectangle.top;

    if (!isStart) {
        startPoint.x = Math.floor(y / cellSize);
        startPoint.y = Math.floor(x / cellSize);
        isStart = true;
    }

    else if (!isEnd) {
        endPoint.x = Math.floor(y / cellSize);
        endPoint.y = Math.floor(x / cellSize);
        isEnd = true;
    }
    
    drawMaze(maze, N);
});

document.getElementById('reset_button').onclick = function() {
    setDefoltValues();

    // Очистка canvas
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
};

var cellSize;
function createMaze() {
    cellSize = canvas.width / N;

    var maze = [];
    for (let i = 0; i < N; i++) {
        maze[i] = [];
        for (let j = 0; j < N; j++) {
            maze[i][j] = true;
        }
    }

    getMaze(maze, 1, 1);
    drawMaze(maze);
    console.log(maze);
}

// Создание лабиринта
function getMaze(maze, row, col) {
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

function drawMaze(maze, colorEnds='#F83A3A', color='white') {
    context.fillStyle = color; 
    context.strokeStyle = color;

    context.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            if (maze[i][j]) {
                context.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
                context.strokeRect(i * cellSize, j * cellSize, cellSize, cellSize);
            }
        }
    }

    if (isStart) {
        context.fillStyle = colorEnds;
        context.fillRect(startPoint.x * cellSize, startPoint.y * cellSize, cellSize, cellSize);
    }
    if (isEnd) {
        context.fillStyle = colorEnds;
        context.fillRect(endPoint.x * cellSize, endPoint.y * cellSize, cellSize, cellSize);
    }
}

document.getElementById('A_star_button').onclick = buttonProcessing;
function buttonProcessing() {
    createMaze();
}