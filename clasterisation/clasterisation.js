const canvas = document.getElementById("canvas_clasterisation");
const context = canvas.getContext("2d");
var clicks = 0; //number of clicks

function k_means_clasterisation(data, k, num_iters=1000) {
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
  for (let i = 0; i < num_iters; i++) {
    clusters = new Array(k).fill().map(() => []);
    
    data.forEach((point, index) => {
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

function plot_dot(x, y, color='white') {
  context.beginPath();

  context.fillStyle = color; 

  context.fillRect(x, y, 10, 10);
  context.closePath();
}

function coloring(clasters, k) {
  colors = ["#F83A3A", "#F13DD4", "#7000FF", "#34AEE2", "white"];

  console.log("Clasters: ", clasters);
  let current_lenght = 0;
  for (let i = 0; i < k; i++) {
    for (dot in clasters[i]) {
      current_lenght += 1;
    }
    for (let j = 0; j < current_lenght; j++) {
      plot_dot(clasters[i][j].x, clasters[i][j].y, colors[i]);
    }
    current_lenght = 0;
  }
}

const data = [];

// расстоновка точек пользователем
canvas.addEventListener("click", (e) => {
  clicks++;
  const rect = canvas.getBoundingClientRect();
  // координаты точки
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  plot_dot(x, y);

  data.push({x: x, y: y})
});

var k = 3; // получить из range


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
  // const k = 3; // получить из range

  var received_k = Number(document.getElementById('K_range').value);
  console.log(received_k);
  console.log(typeof received_k);

  let clasters = k_means_clasterisation(data, received_k);
  coloring(clasters, k);
}