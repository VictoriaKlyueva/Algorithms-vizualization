function k_means_clasterisation(data, k, num_iters) {
  // Генерируем случайные начальные положения центроидов
  let centroids = [];
  for (let i = 0; i < k; i++) {
    centroids.push({
      x: Math.random() * 10,
      y: Math.random() * 10
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

// обработчка значения под range
const value = document.querySelector("#k_value");
const input = document.querySelector("#K_range");
value.textContent = input.value;
input.addEventListener("input", (event) => {
  value.textContent = event.target.value;
});

const canvas = document.getElementById("canvas_clasterisation");
const context = canvas.getContext("2d");
let clicks = 0; //number of clicks

canvas.addEventListener("click", (e) => {
  clicks++;
  const rect = canvas.getBoundingClientRect();
  // координаты точки
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  console.log("Нажатие!");
  context.beginPath();

  context.fillStyle = 'white'; 

  context.fillRect(x, y, 10, 10);
  context.closePath();
});

const k = 3;
const num_iter = 100;
// Создаем массив тестовых объектов для кластеризации
const data = [
  { x: 1, y: 2 },
  { x: 2, y: 1 },
  { x: 2, y: 3 },
  { x: 6, y: 7 },
  { x: 7, y: 6 },
  { x: 8, y: 9 },
  {x: 20, y: 20 },
];

console.log(k_means_clasterisation(data, k, num_iter));