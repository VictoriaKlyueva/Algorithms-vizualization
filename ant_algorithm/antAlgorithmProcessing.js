function getGraph(data, clicks) {
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

// функция для расчета расстояния между двумя точками
function calculateDistance(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}
  
export function antAlgorithm(data, clicks) {
  // Создаем граф, представляющий вершины и расстояния между ними
  const graph = getGraph(data, clicks);
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

  return bestTrail;
  }
