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
    } else if (!endPointSet) {
        endPoint.x = clickedRow;
        endPoint.y = clickedCol;
        endPointSet = true;
    }
    drawMaze(window.maze, window.N); // Добавьте 'window.' перед 'maze' и 'N', если они объявлены в другом месте скрипта
});

document.querySelector('.reset').onclick = function() {
    startPointSet = false;
    endPointSet = false;
    startPoint = { x: null, y: null };
    endPoint = { x: null, y: null };
    drawMaze(window.maze, window.N); // Перерисовываем лабиринт для обновления отображения, добавьте 'window.' если необходимо
};

// Остальные функции (initAndCreateMaze, createMaze) остаются без изменений
function initAndCreateMaze() {
    var N = parseInt(document.querySelector('.inputN').value);
    cellSize = width / N;
    if (isNaN(N) || N <= 0) {
        alert("Пожалуйста, введите корректный размер лабиринта (положительное число).");
        return;
    }

    var maze = [];
    for (let i = 0; i < N; i++) {
        maze[i] = [];
        for (let j = 0; j < N; j++) {
            maze[i][j] = true;
        }
    }

    createMaze(maze, 1, 1, N);
    drawMaze(maze, N); // Функция для отрисовки лабиринта
}

// Рекурсивная функция для создания лабиринта
function createMaze(maze, row, col, N) {
maze[row][col] = false;

let directions = ['top', 'right', 'bottom', 'left'];
directions = directions.sort(function() {
    return 0.5 - Math.random();
});

for (let i = 0; i < directions.length; i++) {
    switch (directions[i]) {
        case 'top':
            if (row - 2 <= 0) continue;
            if (maze[row - 2][col]) {
                maze[row - 1][col] = false;
                createMaze(maze, row - 2, col, N);
            }
            break;
        case 'right':
            if (col + 2 >= N - 1) continue;
            if (maze[row][col + 2]) {
                maze[row][col + 1] = false;
                createMaze(maze, row, col + 2, N);
            }
            break;
        case 'bottom':
            if (row + 2 >= N - 1) continue;
            if (maze[row + 2][col]) {
                maze[row + 1][col] = false;
                createMaze(maze, row + 2, col, N);
            }
            break;
        case 'left':
            if (col - 2 <= 0) continue;
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
    initAndCreateMaze();
}