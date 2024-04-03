const canvas = document.getElementById("canvas_clasterisation");
const context = canvas.getContext("2d");

// Количесвто нажатий на canvas
var clicks = 0;

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


function KMeansClasterisation(data, k, maxNumIters=100000) {
  // Генерируем случайные начальные положения центроидов
  let centroids = [];
  for (let i = 0; i < k; i++) {
    centroids.push({
      x: Math.random() * 600 + 50,
      y: Math.random() * 600 + 50
    });
  }

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

    // Выходим из цикла, если кластеры не изменились
    if (JSON.stringify(clusters) === prevClusters) {
      break;
    }

    // Обновляем положения центроидов
    centroids = newCentroids;
  }

  return clusters;
}

function plotDot(x, y, color='white', epsilon=0) {
  context.beginPath();

  context.fillStyle = color; 

  context.fillRect(x + epsilon, y + epsilon, 15, 15);
  context.closePath();
}

function coloring(clasters, k, epsilon=0) {
  const colors = ["#F83A3A", "#F13DD4", "#7000FF", "#34AEE2", "white"];

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

  plotDot(x, y);

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

// Запуск адгоритма по нажатию кнопки
document.getElementById('claster_button').onclick = buttonProcessing;

function buttonProcessing() {
  console.log("data: ", data);

  var numClasters = Number(document.getElementById('K_range').value);
  var epsilonValue = Number(document.getElementById('epsilon_range').value);

  let KmeanClasters = KMeansClasterisation(data, numClasters);
  let DBSCANClasters = DBSCAN(data, epsilonValue);

  coloring(KmeanClasters, numClasters);
  coloring(DBSCANClasters, DBSCANClasters.length, 5);

  console.log("DBSCAN ", DBSCANClasters);
}