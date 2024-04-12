const canvas = document.getElementById("canvas_clasterisation");
const context = canvas.getContext("2d");

// Количесвто нажатий на canvas
var clicks = 0;

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

function findConnectedComponents(data, distance=100) {
  const adjacencyList = {};
  const visited = new Set();
  const components = [];

  for (let i = 0; i < data.length; i++) {
    adjacencyList[i] = [];
  }

  // Build adjacency list
  for (let i = 0; i < data.length - 1; i++) {
    const x1 = data[i].x;
    const y1 = data[i].y;
    adjacencyList[i] = [];
    
    for (let j = i + 1; j < data.length; j++) {
      const x2 = data[j].x;
      const y2 = data[j].y;
      
      const currentDistance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
      
      if (currentDistance < distance) {
        adjacencyList[i].push(j);
        adjacencyList[j].push(i);
      }
    }
  }

  // Depth-first search function
  function dfs(node, component) {
    visited.add(node);
    component.push(node);
    
    for (const neighbor of adjacencyList[node]) {
      if (!visited.has(neighbor)) {
        dfs(neighbor, component);
      }
    }
  }

  // Find connected components
  for (let i = 0; i < data.length; i++) {
    if (!visited.has(i)) {
      const component = [];
      dfs(i, component);
      components.push(component);
    }
  }

  function toDots(components) {
    let clasters = [];
    for (let i = 0; i < components.length; i++) {
      clasters[i] = [];
    }

    for (let i = 0; i < components.length; i++) {
      for (let j = 0; j < components[i].length; j++) {
        clasters[i].push(data[components[i][j]]);
      }
    }

    return clasters;
  }

  return toDots(components);
}


function DBSCAN(points, eps=100, minPts=1) {
  let clusters = [];
  let noise = [];

  function distance(p1, p2) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function regionQuery(point) {
    return points.filter(p => distance(p, point) <= eps);
  }

  function expandCluster(point, neighborPoints, clusterId) {
    clusters[clusterId] = clusters[clusterId] || [];
    clusters[clusterId].push(point);
    point.visited = true;

    neighborPoints.forEach(neighbor => {
      if (!neighbor.visited) {
        neighbor.visited = true;
        const neighborNeighborPoints = regionQuery(neighbor);

        if (neighborNeighborPoints.length >= minPts) {
          neighborPoints = neighborPoints.concat(neighborNeighborPoints);
        }
      }

      if (!clusters.some(cluster => cluster.includes(neighbor))) {
        clusters[clusterId].push(neighbor);
      }
    });
  }

  points.forEach(point => {
      if (point.visited) return;

      point.visited = true;
      const neighborPoints = regionQuery(point);

      if (neighborPoints.length < minPts) {
          noise.push(point);
      } else {
          clusters.push([]);
          expandCluster(point, neighborPoints, clusters.length - 1);
      }
  });

  return clusters;
}

function KMeans(data, k, maxNumIters=10000) {
  /*
    Эвристика для генерации центроид
    Каждый следующий центр выбираем из случайного распределения 
    на объектах выборки, в котором вероятность выбрать объект пропорциональна 
    квадрату расстояния от него до ближайшего к нему центра кластера.
  */
  function generateCentroids(k, data) {
    function getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function calculateDistance(point1, point2) {
      return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
    }

    function getClosestCentroidIndex(point, centroids) {
      let minDistance = Infinity;
      let closestCentroidIndex = null;
      
      centroids.forEach((centroid, index) => {
        const distance = calculateDistance(point, centroid);
        if (distance < minDistance) {
            minDistance = distance;
            closestCentroidIndex = index;
        }
      });
        
      return closestCentroidIndex;
    }

    // Generate the first centroid randomly
    const centroids = [{
      x: getRandomInt(30, 670),
      y: getRandomInt(30, 670)
    }];

    // Generate the rest of the centroids
    for (let i = 1; i < k; i++) {
      let distances = data.map((point) => Math.pow(calculateDistance(point, centroids[getClosestCentroidIndex(point, centroids)]), 2));
      
      let sumDistances = distances.reduce((acc, val) => acc + val, 0);
      let probabilities = distances.map((distance) => distance / sumDistances);
      
      let randomValue = Math.random() * sumDistances;
      let index = 0;
      
      while (randomValue > 0) {
          randomValue -= distances[index];
          index++;
      }
      
      centroids.push(data[index - 1]);
    }

    return centroids;
  }

  let centroids = generateCentroids(k, data);
  console.log("Centroids:", centroids);

  let clusters = [];

  // Определение расстояния между двумя точками
  function distance(pointA, pointB) {
    const dx = pointA.x - pointB.x;
    const dy = pointA.y - pointB.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Функция для поиска ближайшего центроида для заданной точки
  function findClosestCentroid(point) {
    let closestCentroid = null;
    let minDistance = Infinity;
    
    centroids.forEach((centroid, index) => {
      const dist = distance(centroid, point);
      if (dist < minDistance) {
        closestCentroid = index;
        minDistance = dist;
      }
    });
    
    return closestCentroid;
  }

  // Проводим итерации
  for (let i = 0; i < maxNumIters; i++) {
    const prevClusters = JSON.stringify(clusters);
    clusters = new Array(k).fill().map(() => []);
    
    data.forEach((point) => {
      const closestCentroid = findClosestCentroid(point);
      clusters[closestCentroid].push(point);
    });

    // Пересчет положений центроидов
    const newCentroids = [];
    
    clusters.forEach(cluster => {
      const clusterSize = cluster.length;
      let sumX = 0;
      let sumY = 0;
      
      cluster.forEach(point => {
        sumX += point.x;
        sumY += point.y;
      });
      
      newCentroids.push({
        x: sumX / clusterSize,
        y: sumY / clusterSize
      });
    });

    // Обновляем положения центроидов
    centroids = newCentroids;
  }

  return clusters;
}

function roundedRectPath(x, y, w, h, r) {
  r = (Math.min(w, h) /2  > r) ? r : Math.min(w, h) / 2;

  return `M ${x + r} ${y} l ${w-2*r} 0 q ${r} 0 ${r} ${r}
      l 0 ${h - 2 * r} q 0 ${r} ${-r} ${r}
      l ${- w + 2 * r} 0 q ${-r} 0 ${-r} ${-r}
      l 0 ${- h + 2 * r} q 0 ${-r} ${r} ${-r}`;
}

function plotDot(x, y, color='white', epsilon=0, isInput=false) {
  context.beginPath();

  context.fillStyle = color; 
  context.strokeStyle = color;

  if (isInput) {
    context.stroke(new Path2D(roundedRectPath(x, y + epsilon, 30, 30, 10)));
    context.fill(new Path2D(roundedRectPath(x, y + epsilon, 30, 30, 10)));
  }
  else {
    context.stroke(new Path2D(roundedRectPath(x, y + epsilon, 30, 10, 10)));
    context.fill(new Path2D(roundedRectPath(x, y + epsilon, 30, 10, 10)));
  }

  context.closePath();
}

function coloring(clasters, k, epsilon=0) {
  const colors = ["#F73A4B", "#7000FF", "#3AC7F7", "#FFA7A7", "#59D499"];

  console.log("Clasters: ", clasters);
  let currentLenght = 0;
  for (let i = 0; i < k; i++) {
    for (let dot in clasters[i]) {
      currentLenght += 1;
    }
    for (let j = 0; j < currentLenght; j++) {
      plotDot(clasters[i][j].x, clasters[i][j].y, colors[i], epsilon);
    }
    currentLenght = 0;
  }
}

var data = [];

// расстоновка точек пользователем
canvas.addEventListener("click", (e) => {
  clicks++;
  const rect = canvas.getBoundingClientRect();
  // координаты точки
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  plotDot(x, y, 'white', 0, true);

  data.push({x: x, y: y})
});

// обработка значения под range
const KValue = document.querySelector("#k_value");
const KInput = document.querySelector("#K_range");
KValue.textContent = KInput.value;
KInput.addEventListener("input", (event) => {
  KValue.textContent = event.target.value;
});

const epsilonValue = document.querySelector("#epsilon_value");
const epsilonInput = document.querySelector("#epsilon_range");
epsilonValue.textContent = epsilonInput.value;
epsilonInput.addEventListener("input", (event) => {
  epsilonValue.textContent = event.target.value;
});

const distanceValue = document.querySelector("#distance_value");
const distanceInput = document.querySelector("#distance_range");
distanceValue.textContent = distanceInput.value;
distanceInput.addEventListener("input", (event) => {
  distanceValue.textContent = event.target.value;
});

// Запуск адгоритма по нажатию кнопки
document.getElementById('claster_button').onclick = buttonProcessing;

function buttonProcessing() {
  // Очистка canvas
  context.clearRect(0, 0, canvas.width, canvas.height);

  var numClasters = Number(document.getElementById('K_range').value);
  var epsilonValue = Number(document.getElementById('epsilon_range').value);

  let KmeanClasters = KMeans(data, numClasters);
  let DBSCANClasters = DBSCAN(data, epsilonValue);
  let connectedComponentsClasters = findConnectedComponents(data);

  coloring(KmeanClasters, numClasters, 0);
  coloring(DBSCANClasters, DBSCANClasters.length, 10);
  coloring(connectedComponentsClasters, connectedComponentsClasters.length, 20);

  for (let i = 0; i < clicks; i++) {
    data[i].visited = false;
  }
}

// Очистка канваса по нажатию кнопки
document.getElementById('reset_clasterization').onclick = resetProcessing;
function resetProcessing() {
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);

  data = [];
}