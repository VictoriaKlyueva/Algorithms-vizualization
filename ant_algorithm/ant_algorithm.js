const canvas = document.getElementById("canvas_ant_algorithm");
const context = canvas.getContext("2d");
var clicks = 0; //number of clicks

var data = [];

function ant_algorithm() {
  console.log("Started!");

  // Создаем граф, представляющий города и расстояния между ними
  const graph = [
    [0, 2, 9, 10],
    [1, 0, 6, 4],
    [15, 7, 0, 8],
    [6, 3, 12, 0]
  ];
  const numOfCities = graph.length;

  // Гиперпараметры
  const numOfAnts = 10;
  const numOfIterations = 100;
  const alpha = 1;
  const beta = 5;
  const rho = 0.5

  let bestTrail;
  let bestDistance = Infinity;

  // Инициализируем феромоны на ребрах графа
  const pheromones = Array(numOfCities)
    .fill(0)
    .map(() => Array(numOfCities).fill(1));

  // Выполняем итерации алгоритма
  for (let iteration = 0; iteration < numOfIterations; iteration++) {
    const antPath = [];

    // Создаем муравьев в случайном городе
    for (let ant = 0; ant < numOfAnts; ant++) {

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

        // Выбираем следующий город на основе вероятности
        const sumOfProbabilities = transitionProbabilities.reduce(
          (sum, { transitionProb }) => sum + transitionProb,
          0
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

    // Обновляем феромоны на ребрах
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
    for (let i = 0; i < numOfCities - 1; i++) {
      pheromones[bestTrail[i]][bestTrail[i + 1]] += (1 / bestDistance);
      pheromones[bestTrail[i + 1]][bestTrail[i]] += (1 / bestDistance);
    }
    pheromones[bestTrail[numOfCities - 1]][bestTrail[0]] += (1 / bestDistance);
    pheromones[bestTrail[0]][bestTrail[numOfCities - 1]] += (1 / bestDistance);
  }

  // Вывод
  console.log('Best trail:', bestTrail);
  console.log('Best distance:', bestDistance);
}

function plot_dot(x, y, radius, color='white') {
    context.beginPath();
  
    context.fillStyle = color; 
  
    context.arc(x, y, radius, 0, 2 * Math.PI, false);

    context.lineWidth = 5;
    context.strokeStyle = '#FFFFFF';

    context.stroke();
    context.closePath();
}

// функция для расчета расстояния между двумя точками
function calculate_distance(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
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

  plot_dot(x, y, radius);
});

// Запуск адгоритма по нажатию кнопки
document.getElementById('ant_algorithm_button').onclick = buttonProcessing;
function buttonProcessing() {
    ant_algorithm();
}