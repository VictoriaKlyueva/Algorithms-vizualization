const canvas = document.getElementById("canvas_ant_algorithm");
const context = canvas.getContext("2d");
var clicks = 0; //number of clicks

var data = [];

function antAlgorithm(data) {
  // Создаем граф, представляющий вершины и расстояния между ними
  const graph = getGraph(data);
  const numOfCities = graph.length;

  // Гиперпараметры
  const NUM_OF_ANTS = 10;
  const NUM_OF_ITERATIONS = 100;
  const alpha = 1;
  const beta = 4;
  const rho = 0.5

  let bestTrail = [];
  let bestDistance = Infinity;

  // Задаем феромоны на ребрах графа
  const pheromones = Array(numOfCities).fill(0).map(() => Array(numOfCities).fill(1));

  for (let iteration = 0; iteration < NUM_OF_ITERATIONS; iteration++) {
    const antPath = [];

    // Создаем муравьев в случайной вершине
    for (let ant = 0; ant < NUM_OF_ANTS; ant++) {
      const paths = [];
      const visited = Array(numOfCities).fill(false);
      const startCity = Math.floor(Math.random() * numOfCities);

      paths.push(startCity);
      visited[startCity] = true;

      while (paths.length < numOfCities) {
        const currentCity = paths[paths.length - 1];
        const transitionProbabilities = [];

        // Считаем вероятности перехода
        for (let nextCity = 0; nextCity < numOfCities; nextCity++) {
          if (!visited[nextCity]) {
            const pheromone = pheromones[currentCity][nextCity];
            const distance = graph[currentCity][nextCity];
            const transitionProb = Math.pow(pheromone, alpha) * Math.pow(1 / distance, beta);
            transitionProbabilities.push({ nextCity, transitionProb });
          }
        }

        // Выбираем следующую вершину на основе вероятности
        const sumOfProbabilities = transitionProbabilities.reduce(
          (sum, { transitionProb }) => sum + transitionProb, 0
          );
        const rouletteWheel = transitionProbabilities.map(({ nextCity, transitionProb }) => 
                              ({ nextCity, probability: transitionProb / sumOfProbabilities}));
        rouletteWheel.sort((a, b) => a.probability - b.probability);

        let thresholdLevel = Math.random();
        for (const { nextCity, probability } of rouletteWheel) {
          thresholdLevel -= probability;
          if (thresholdLevel <= 0) {
            paths.push(nextCity);
            visited[nextCity] = true;
            break;
          }
        }
      }

      antPath.push(paths);
    }

    // Обновляем феромоны
    for (let i = 0; i < numOfCities; i++) {
      for (let j = 0; j < numOfCities; j++) {
        if (i !== j) {
          pheromones[i][j] *= (1 - rho);
        }
      }
    }

    // находим лучший маршрут по длине
    for (const trail of antPath) {
      let distance = 0;

      for (let i = 0; i < numOfCities - 1; i++) {
        distance += graph[trail[i]][trail[i + 1]];
      }
      distance += graph[trail[numOfCities - 1]][trail[0]];

      if (distance < bestDistance) {
        bestDistance = distance;
        bestTrail = trail;
      }
    }

    // Усиляем феромоны на маршруте лучшего муравья
    let reversedBest = (1 / bestDistance);
    for (let i = 0; i < numOfCities - 1; i++) {
      pheromones[bestTrail[i]][bestTrail[i + 1]] += reversedBest;
      pheromones[bestTrail[i + 1]][bestTrail[i]] += reversedBest;
    }
    pheromones[bestTrail[numOfCities - 1]][bestTrail[0]] += reversedBest;
    pheromones[bestTrail[0]][bestTrail[numOfCities - 1]] += reversedBest;
  }

  // Отрисовка рёбер на canvas
  plotLines(data, bestTrail);
}

function plotLines(data, trail, color='white') {
  context.strokeStyle = color;
  context.lineWidth = "7";
  context.lineCap = "round";

  // Передвигаемся в начальную вершину
  context.moveTo(data[trail[0]].x, data[trail[0]].y);

  // Рисуем рёбра
  for (let i = 1; i < clicks; i++) {
    context.lineTo(data[trail[i]].x, data[trail[i]].y);
    context.stroke();
  }

  // Возвращаемся к начальной вершине
  context.lineTo(data[trail[0]].x, data[trail[0]].y);
  context.stroke();

  context.closePath();
}

function plotDot(x, y, radius, color='white') {
  context.beginPath();

  context.fillStyle = color; 

  context.arc(x, y, radius, 0, 2 * Math.PI, false);

  context.lineWidth = 5;
  context.strokeStyle = 'white';

  context.stroke();
  context.closePath();
}

// функция для расчета расстояния между двумя точками
function calculateDistance(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function getGraph(data) {
  let graph = [];
  
  // Инициализируем граф нулями
  for (let i = 0; i < clicks; i++) {
    graph[i] = [];
    for (let j = 0; j < clicks; j++) {
      graph[i][j] = 0;
    }
  }

  // заполняем граф
  for (let i = 0; i < clicks; i++) {
    for (let j = i; j < clicks; j++) {
      graph[i][j] = calculateDistance(data[i].x, data[i].y, data[j].x, data[j].y);
      graph[j][i] = calculateDistance(data[i].x, data[i].y, data[j].x, data[j].y);
    }
  }

  return graph;
}
  
data = []
// расстоновка точек пользователем
canvas.addEventListener("click", (e) => {
  clicks++;
  const rect = canvas.getBoundingClientRect();
  // координаты точки
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const radius = 10;

  plotDot(x, y, radius);

  data.push({x: x, y: y})
});

// Запуск адгоритма по нажатию кнопки
document.getElementById('ant_algorithm_button').onclick = buttonProcessing;
function buttonProcessing() {
  antAlgorithm(data);
}