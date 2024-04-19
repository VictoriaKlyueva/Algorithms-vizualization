import { NeuralNetwork, makePrediction } from "./NeuralNetworkArchitecture.js"
import { first_layer, second_layer } from "./weights/weights.js";
import { getImage, compressPhoto } from "./imageProcessing.js"

const canvas = document.getElementById("canvas_nn");
const context = canvas.getContext("2d");

const w = canvas.width;
const h = canvas.height;

// Задаем параметры модели
const NUM_INPUTS = 28 * 28;
const HIDDEN_SIZE = 300;
const NUM_OUTPUTS = 10;
  
// Задаем модели считанные веса
function loadWeights() {
  model.first_layer = first_layer;
  model.second_layer = second_layer;
}

// Создаем модель
const model = new NeuralNetwork(NUM_INPUTS, HIDDEN_SIZE, NUM_OUTPUTS);
// Загружаем веса
loadWeights();

// Координаты мыши
const mouse = { x: 0, y: 0};
let draw = false;
                
// Нажатие мыши
canvas.addEventListener("mousedown", function(e) {
  mouse.x = e.pageX - this.offsetLeft;
  mouse.y = e.pageY - this.offsetTop;

  draw = true;
  context.beginPath();

  context.lineWidth = 15; 
  context.lineCap = 'round'; 
  context.strokeStyle = 'white'; 

  context.moveTo(mouse.x, mouse.y);
});

// перемещение мыши
canvas.addEventListener("mousemove", function(e) {
  if(draw === true){
    mouse.x = e.pageX - this.offsetLeft;
    mouse.y = e.pageY - this.offsetTop;

    context.lineTo(mouse.x, mouse.y);
    context.stroke();
  }
});

// Мышь опущена
canvas.addEventListener("mouseup", function(e) {
  mouse.x = e.pageX - this.offsetLeft;
  mouse.y = e.pageY - this.offsetTop;

  context.lineTo(mouse.x, mouse.y);
  context.stroke();
  context.closePath();
  draw = false;

  // Cохраняем изображение
  let image = getImage(context, w, h);

  // Сжатие изображения до 28 x 28
  let compressedImage = compressPhoto(image, 700, 700, 28, 28);
  
  // Вывод предсказания модели
  const prediction = makePrediction(model, compressedImage);
  document.getElementsByClassName("predict")[0].innerHTML = "Вердикт: " +  prediction;
});

// Очистка канваса по нажатию кнопки
document.getElementById('reset_nn').onclick = resetProcessing;
function resetProcessing() {
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);

  document.getElementsByClassName("predict")[0].innerHTML = "Вердикт: ";
}