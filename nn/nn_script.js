import { first_layer, second_layer } from "./weights/weights.js";

class NeuralNetwork {
    constructor(inputs, hidden, outputs) {
      this.first_layer = {};
      this.second_layer = {};
  
      this.first_layer.para = this.getRandomMatrix(hidden, inputs) / Math.sqrt(inputs);
      this.first_layer.bias = this.getRandomMatrix(hidden, 1) / Math.sqrt(hidden);
      this.second_layer.para = this.getRandomMatrix(outputs, hidden) / Math.sqrt(hidden);
      this.second_layer.bias = this.getRandomMatrix(outputs, 1) / Math.sqrt(hidden);
  
      this.input_size = inputs;
      this.hid_size = hidden;
      this.output_size = outputs;
    }
  
    activationFunction(z, type = 'relu', derivative = false) {
      if (type == 'relu') {
        if (derivative) {
          return z.map((i) => i > 0 ? 1 : 0);
        } else {
          return z.map((i) => i > 0 ? i : 0);
        }
      } else if (type == 'leakyrelu') {
        if (derivative) {
          return z.map((i) => i >= 0 ? 1 : 0.01);
        } else {
          return z.map((i) => i >= 0 ? i : 0.01 * i);
        }
      } else if (type == 'sigmoid') {
        if (derivative) {
          return z.map((i) => (1 / (1 + Math.exp(-i))) * (1 - 1 / (1 + Math.exp(-i))));
        } else {
          return z.map((i) => 1 / (1 + Math.exp(-i)));
        }
      } else if (type == 'tanh') {
        if (derivative) {
          return z.map((i) => 1 - Math.pow(Math.tanh(i), 2));
        } else {
          return z.map((i) => 1 - Math.pow(Math.tanh(i), 2));
        }
      } else {
        throw new TypeError('Invalid type!');
      }
    }
  
    softmax(z) {
      const expZ = z.map((i) => Math.exp(i));
      const sumExpZ = expZ.reduce((sum, i) => sum + i);
      return expZ.map((i) => i / sumExpZ);
    }
  
    crossEntropyError(v, y) {
      return -Math.log(v[y]);
    }
  
    forward(x, y) {
      const z = this.addMatrices(this.matrixMultiply(this.first_layer.para, x).map((i) => [i]), this.first_layer.bias);
      const h = this.activationFunction(z).map((i) => [i]);
      const u = this.addMatrices(this.matrixMultiply(this.second_layer.para, h).map((i) => [i]), this.second_layer.bias);
      const predictList = this.softmax(u).flat();
      const error = this.crossEntropyError(predictList, y);
  
      const dataDict = {
        z: z,
        h: h,
        u: u,
        f_X: [predictList],
        error: error
      };
      return dataDict;
    }
  
    getRandomMatrix(rows, cols) {
      const matrix = [];
      for (let i = 0; i < rows; i++) {
        matrix[i] = [];
        for (let j = 0; j < cols; j++) {
          matrix[i][j] = Math.random();
        }
      }
      return matrix;
    }
  
    addMatrices(matrix1, matrix2) {
      // Проверка, что размеры матриц совпадают
      if (matrix1.length !== matrix2.length || matrix1[0].length !== matrix2[0].length) {
        throw new Error('Размеры матриц не совпадают');
      }
    
      const result = [];
    
      for (let i = 0; i < matrix1.length; i++) {
        const row1 = matrix1[i];
        const row2 = matrix2[i];
    
        const newRow = [];
  
        for (let j = 0; j < row1.length; j++) {
          newRow.push(row1[j] + row2[j]);
        }
    
        result.push(newRow);
      }
      return result;
    }
    
    matrixMultiply(a, b) {
      let result = Array(a.length)
      for (let i = 0; i < a.length; i++) {
        let sum = 0;
        for (let j = 0; j < a[0].length; j++) {
          sum += a[i][j] * b[j]
        }
        result[i] = sum;
      }
      // console.log('mult ' + result);
      return result;
    }
}
  
function make_prediction(model, image) {
  const probs = model.forward(image, 0)['f_X'][0];

  console.log("Probs:", probs);

  let max_index = 0;
  let max_value = probs[0];

  for (let i = 0; i < 10; i++) {
    if (probs[i] > max_value) {
      max_value = probs[i];
      max_index = i;
    }
  }

  return max_index;
}
  
function set_weights() {
  // задаем считанные веса
  model.first_layer = first_layer;
  model.second_layer = second_layer;
}

// получение изображения с canvas
function getImage(context) {
  const imageData = context.getImageData(0, 0, w, h);
  const pixels = imageData.data;

  const bw_image = [];

  for (let i = 0; i < pixels.length; i += 4) {
      // Получаем значения RGB компонент пикселя
      const red = pixels[i];
      const green = pixels[i + 1];
      const blue = pixels[i + 2];
    
      // Вычисляем яркость пикселя
      const brightness = Math.round((red + green + blue) / 3);
    
      // Создаем новый пиксель в черно-белом цвете и добавляем его в массив
      bw_image.push(brightness);
    }

  return bw_image;
}

// задаем параметры модели
const num_inputs = 28 * 28;
const hidden_size = 300;
const num_outputs = 10;

// создаем модель
const model = new NeuralNetwork(num_inputs, hidden_size, num_outputs);

set_weights();


const canvas = document.getElementById("canvas_nn");
const context = canvas.getContext("2d");

const w = canvas.width;
const h = canvas.height;

// координаты мыши
const mouse = { x: 0, y: 0};
let draw = false;
                
// нажатие мыши
canvas.addEventListener("mousedown", function(e) {
    mouse.x = e.pageX - this.offsetLeft;
    mouse.y = e.pageY - this.offsetTop;
    draw = true;
    context.beginPath();

    context.lineWidth = 35; 
    context.lineCap = 'round'; 
    context.strokeStyle = 'white'; 

    context.moveTo(mouse.x, mouse.y);
});

// перемещение мыши
canvas.addEventListener("mousemove", function(e) {
    if(draw==true){
        mouse.x = e.pageX - this.offsetLeft;
        mouse.y = e.pageY - this.offsetTop;
        context.lineTo(mouse.x, mouse.y);
        context.stroke();
    }
});

// отпускаем мышь
canvas.addEventListener("mouseup", function(e) {
  mouse.x = e.pageX - this.offsetLeft;
  mouse.y = e.pageY - this.offsetTop;
  context.lineTo(mouse.x, mouse.y);
  context.stroke();
  context.closePath();
  draw = false;

  // сохраняем изображение
  const image = getImage(context);

  let compressedImage = [];
  for (let i = 0; i < 28; i++) {
    for (let j = 0; j < 28; j++) {
      let pixelSum = 0;

      // Суммируем значения всех пикселей, относящихся к одному пикселю сжатого изображения
      for (let k = i * 25; k < (i + 1) * 25; k++) {
        for (let l = j * 25; l < (j + 1) * 25; l++) {
          pixelSum += image[k * 700 + l];
        }
      }

      // Вычисляем среднее значение цвета
      let avgPixel = Math.floor(pixelSum / 625 - 1);
      compressedImage.push(avgPixel);
    }
  }
  
  const predict = make_prediction(model, compressedImage);
  console.log("Pred:", predict);
  document.getElementsByClassName("predict")[0].innerHTML = "Вердикт: " +  predict;

  // const test_image = Array.from({length: 28 * 28}, () => Math.floor(Math.random() * 40));  
  // console.log("Test:", make_prediction(model, test_image));
});
