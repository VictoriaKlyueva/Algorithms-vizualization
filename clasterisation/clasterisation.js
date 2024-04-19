import { KMeans } from "./Kmeans.js";
import { findConnectedComponents } from "./findConnectedComponents.js";
import { DBSCAN } from "./DBSCAN.js";

const canvas = document.getElementById("canvas_clasterisation");
const context = canvas.getContext("2d");

// Количесвто нажатий на canvas
var clicks = 0;

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

  let numClasters = Number(document.getElementById('K_range').value);
  let epsilonValue = Number(document.getElementById('epsilon_range').value);

  const KmeanClasters = KMeans(data, numClasters);
  const DBSCANClasters = DBSCAN(data, epsilonValue);
  const connectedComponentsClasters = findConnectedComponents(data);

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