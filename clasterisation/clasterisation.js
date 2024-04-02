const canvas = document.getElementById("canvas_clasterisation");
const context = canvas.getContext("2d");

// Количесвто нажатий на canvas
var clicks = 0;

function KMeansClasterisation(data, k, maxNumIters=10000) {
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

function plotDot(x, y, color='white') {
  context.beginPath();

  context.fillStyle = color; 

  context.fillRect(x, y, 15, 15);
  context.closePath();
}

function coloring(clasters, k) {
  const colors = ["#F83A3A", "#F13DD4", "#7000FF", "#34AEE2", "white"];

  console.log("Clasters: ", clasters);
  let currentLenght = 0;
  for (let i = 0; i < k; i++) {
    for (let dot in clasters[i]) {
      currentLenght += 1;
    }
    for (let j = 0; j < currentLenght; j++) {
      plotDot(clasters[i][j].x, clasters[i][j].y, colors[i]);
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

// обработчка значения под range
const value = document.querySelector("#k_value");
const input = document.querySelector("#K_range");
value.textContent = input.value;
input.addEventListener("input", (event) => {
  value.textContent = event.target.value;
});

// Запуск адгоритма по нажатию кнопки
document.getElementById('claster_button').onclick = buttonProcessing;

function buttonProcessing() {
  var numClasters = Number(document.getElementById('K_range').value);
  let clasters = KMeansClasterisation(data, numClasters);
  coloring(clasters, numClasters);
}