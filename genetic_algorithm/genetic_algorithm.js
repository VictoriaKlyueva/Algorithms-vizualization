const canvas = document.getElementById("canvas_genetic_algorithm");
const context = canvas.getContext("2d");
var clicks = 0; //number of clicks

var data = [];

function getRandomProbability() {
  return Math.random() - 0.5;
}

function geneticAlgorithm(data) {
  var adjacencyMatrix = getGraph(data);

  // гиперпараметры
  const NUM_CITIES = adjacencyMatrix.length;
  const NUM_POPULATION = 100;
  const NUM_GENERATIONS = 300000;
  const MUTATION_RATE = 0.3;

  // Генерация начальной популяции
  function generateInitialPopulation() {
    let population = [];
    for (let i = 0; i < NUM_POPULATION; i++) {
      population.push([...Array(NUM_CITIES).keys()].sort(() => getRandomProbability()));
    }
    return population;
  }

  // Оценка приспособленности особей
  function fitness(individual) {
    let cost = 0;
    for (let i = 0; i < NUM_CITIES - 1; i++) {
      cost += adjacencyMatrix[individual[i]][individual[i + 1]];
    }
    cost += adjacencyMatrix[individual[NUM_CITIES - 1]][individual[0]];
    // Припособленность - обратная велечина стоимости
    return 1 / cost;
  }

  // Скрещивание особей
  function crossing(firstParent, secnodParent) {
    const start = Math.floor(Math.random() * NUM_CITIES);
    const end = Math.floor(Math.random() * (NUM_CITIES - start)) + start;

    let child = firstParent.slice(start, end);
    for (let gene of secnodParent) {
      if (!child.includes(gene)) {
        child.push(gene);
      }
    }
    return child;
  }

  // Мутация
  function mutation(individual) {
    if (Math.random() < MUTATION_RATE) {
      const idx1 = Math.floor(Math.random() * NUM_CITIES);
      const idx2 = (idx1 + 1) % NUM_CITIES;
      [individual[idx1], individual[idx2]] = [individual[idx2], individual[idx1]];
    }
    return individual;
  }

  // Основной цикл алгоритма
  let population = generateInitialPopulation();

  for (let generation = 0; generation < NUM_GENERATIONS; generation++) {
    let newPopulation = [];
    for (let i = 0; i < NUM_POPULATION; i++) {
      // Выбор рандомных родителей
      let parent1 = population[Math.floor(Math.random() * NUM_POPULATION)];
      let parent2 = population[Math.floor(Math.random() * NUM_POPULATION)];
      let child = crossing(parent1, parent2);
      child = mutation(child);
      newPopulation.push(child);
    }
    population = newPopulation;
  }

  // Нахождение лучшего решения
  let bestRoute = population.sort((a, b) => fitness(b) - fitness(a))[0];
  let bestCost = 0;
  for (let i = 0; i < NUM_CITIES - 1; i++) {
    bestCost += adjacencyMatrix[bestRoute[i]][bestRoute[i + 1]];
  }
  bestCost += adjacencyMatrix[bestRoute[NUM_CITIES - 1]][bestRoute[0]];

  console.log("Лучший маршрут: ", bestRoute);
  console.log("Лучшая стоимость: ", bestCost);

  plotLines(data, bestRoute);
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
document.getElementById('genetic_algorithm_button').onclick = buttonProcessing;
function buttonProcessing() {
  geneticAlgorithm(data);
}