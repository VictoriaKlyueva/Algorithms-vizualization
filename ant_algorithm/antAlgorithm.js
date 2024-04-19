import { antAlgorithm } from "./antAlgorithmProcessing.js"

const canvas = document.getElementById("canvas_ant_algorithm");
const context = canvas.getContext("2d");
let clicks = 0; //number of clicks

let data = [];

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
  
// расстоновка точек пользователем
canvas.addEventListener("click", (e) => {
  clicks++;
  let rect = canvas.getBoundingClientRect();
  // координаты точки
  let x = e.clientX - rect.left;
  let y = e.clientY - rect.top;
  let radius = 20;

  plotDot(x, y, radius);

  data.push({x: x, y: y})
});

// Запуск адгоритма по нажатию кнопки
document.getElementById('ant_algorithm_button').onclick = buttonProcessing;
function buttonProcessing() {
  let bestTrail = antAlgorithm(data, clicks);

  // Отрисовка рёбер и вершин на canvas
  plotLines(data, bestTrail);
}

// Очистка канваса по нажатию кнопки
document.getElementById('ant_algorithm_reset').onclick = resetProcessing;
function resetProcessing(clearingData=true) {
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
  
  if (clearingData) {
    data.length = 0
    clicks = 0;
  }
}