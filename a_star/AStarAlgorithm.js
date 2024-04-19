export async function AStarWithDrawing(startX, startY, endX, endY, maze, time=20) {
    const openList = [];
    const closedList = {};

    const startNode = new Node(startX, startY);
    const endNode = new Node(endX, endY);

    openList.push(startNode);

    while (openList.length > 0 && !isCleared) {
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
                await new Promise(resolve => setTimeout(resolve, time / 2));
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
    
    if (!isCleared) {
        window.alert("Пути не существует");
    }

    return true;
}