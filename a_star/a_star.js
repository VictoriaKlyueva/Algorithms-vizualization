// Дефолтные значения
var startPointSet = false;
var endPointSet = false;
var startPoint = { x: null, y: null };
var endPoint = { x: null, y: null };

const canvas = document.getElementById('canvas_A_star');
const context = canvas.getContext('2d');
var cellSize;

let width = 700;
let height = 700;
canvas.width = width;
canvas.height = height;

var N = 20 // Мейби заменить потом на ввод с клавы

canvas.addEventListener('click', function(event) {
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    var clickedRow = Math.floor(y / cellSize);
    var clickedCol = Math.floor(x / cellSize);

    if (!startPointSet) {
        startPoint.x = clickedRow;
        startPoint.y = clickedCol;
        startPointSet = true;
    }
    else if (!endPointSet) {
        endPoint.x = clickedRow;
        endPoint.y = clickedCol;
        endPointSet = true;
    }
    drawMaze(window.maze, window.N);
});

document.getElementById('reset_button').onclick = function() {
    console.log("Йоу");

    startPointSet = false;
    endPointSet = false;
    startPoint = { x: null, y: null };
    endPoint = { x: null, y: null };

    // перерисовка лабиринта
    drawMaze(window.maze, window.N);
};

function randomProbability() {
    return 0.5 - Math.random();
}

function сreateMaze() {
    cellSize = width / N;

    var maze = [];
    for (let i = 0; i < N; i++) {
        maze[i] = [];
        for (let j = 0; j < N; j++) {
            maze[i][j] = true;
        }
    }

    createMaze(maze, 1, 1, N);
    drawMaze(maze, N);
}

// Создание лабиринта
function createMaze(maze, row, col) {
    maze[row][col] = false;

    // Задаем рандомный  порядок направлений
    let directions = ['top', 'bottom', 'right', 'left'].sort(function() {
        return randomProbability();
    });

    for (let i = 0; i < directions.length; i++) {
        switch (directions[i]) {
            case 'top':
                if (row - 2 <= 0)
                    continue;
                if (maze[row - 2][col]) {
                    maze[row - 1][col] = false;
                    createMaze(maze, row - 2, col, N);
                }
                break;
            case 'right':
                if (col + 2 >= N - 1)
                    continue;
                if (maze[row][col + 2]) {
                    maze[row][col + 1] = false;
                    createMaze(maze, row, col + 2, N);
                }
                break;
            case 'bottom':
                if (row + 2 >= N - 1)
                    continue;
                if (maze[row + 2][col]) {
                    maze[row + 1][col] = false;
                    createMaze(maze, row + 2, col, N);
                }
                break;
            case 'left':
                if (col - 2 <= 0)
                    continue;
                if (maze[row][col - 2]) {
                    maze[row][col - 1] = false;
                    createMaze(maze, row, col - 2, N);
                }
                break;
        }
    }
}

function drawMaze(maze, N) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            if (maze[i][j]) {
                context.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
            }
        }
    }

    if (startPointSet) {
        context.fillStyle = 'red';
        context.fillRect(startPoint.x * cellSize, startPoint.y * cellSize, cellSize, cellSize);
    }
    if (endPointSet) {
        context.fillStyle = 'red';
        context.fillRect(endPoint.x * cellSize, endPoint.y * cellSize, cellSize, cellSize);
    }

    context.fillStyle = 'white'; // Возвращаем цвет заливки обратно на черный для следующих отрисовок
}

document.getElementById('A_star_button').onclick = buttonProcessing;
function buttonProcessing() {
    сreateMaze();
}