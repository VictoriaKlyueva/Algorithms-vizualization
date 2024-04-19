function randomProbability() {
    return 0.5 - Math.random();
}

// Генерация лабиринта
export function getMaze(maze, N, row=1, col=1) {
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
                    getMaze(maze, N, row - 2, col, N);
                }
                break;

            case 'bottom':
                if (row + 2 >= N - 1)
                    continue;
                if (maze[row + 2][col]) {
                    maze[row + 1][col] = false;
                    getMaze(maze, N, row + 2, col, N);
                }
                break;

            case 'right':
                if (col + 2 >= N - 1)
                    continue;
                if (maze[row][col + 2]) {
                    maze[row][col + 1] = false;
                    getMaze(maze, N, row, col + 2, N);
                }
                break;

            case 'left':
                if (col - 2 <= 0)
                    continue;
                if (maze[row][col - 2]) {
                    maze[row][col - 1] = false;
                    getMaze(maze, N, row, col - 2, N);
                }
                break;
        }
    }

    return maze;
}