const canvas = document.getElementById("canvas_clasterisation");
const context = canvas.getContext("2d");
var clicks = 0; //number of clicks

class DisjointSet {
  constructor(size) {
      this.parent = new Array(size);
      this.rank = new Array(size);
      for (let i = 0; i < size; i++) {
          this.parent[i] = i;
          this.rank[i] = 0;
      }
  }

  find(x) {
      if (x !== this.parent[x]) {
          this.parent[x] = this.find(this.parent[x]);
      }
      return this.parent[x];
  }

  union(x, y) {
      let rootX = this.find(x);
      let rootY = this.find(y);

      if (rootX === rootY) return;

      if (this.rank[rootX] < this.rank[rootY]) {
          this.parent[rootX] = rootY;
      } else if (this.rank[rootX] > this.rank[rootY]) {
          this.parent[rootY] = rootX;
      } else {
          this.parent[rootY] = rootX;
          this.rank[rootX]++;
      }
  }
}

function clusterizeByConnectedComponents(graph) {
  const n = graph.length;
  const dsu = new DisjointSet(n);

  for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
          if (graph[i][j] === 1) {
              dsu.union(i, j);
          }
      }
  }

  const clusters = {};
  for (let i = 0; i < n; i++) {
      const root = dsu.find(i);
      if (!(root in clusters)) {
          clusters[root] = [];
      }
      clusters[root].push(i);
  }

  return Object.values(clusters);
}

// Пример использования
/*
const graph = [
  [1, 1, 0, 0],
  [1, 1, 0, 0],
  [0, 0, 1, 1],
  [0, 0, 1, 1]
];

const clusters = clusterizeByConnectedComponents(graph);
console.log(clusters);
*/

function k_means_clasterisation(data, k, max_num_iters=10000) {
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
  for (let i = 0; i < max_num_iters; i++) {
    const prevclusters = JSON.stringify(clusters);
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

    if (JSON.stringify(clusters) === prevclusters) {
      break; // выходим из цикла, если кластеры не изменились
    }

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

var data = [];

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
  var k = Number(document.getElementById('K_range').value);
  let clasters = k_means_clasterisation(data, k);
  coloring(clasters, k);
}