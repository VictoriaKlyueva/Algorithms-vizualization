import { first_layer, second_layer } from "./weights/weights.js";

const canvas = document.getElementById("canvas_nn");
const context = canvas.getContext("2d");

const w = canvas.width;
const h = canvas.height;

// Задаем параметры модели
const NUM_INPUTS = 28 * 28;
const HIDDEN_SIZE = 300;
const NUM_OUTPUTS = 10;

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
    
    matrixMultiply(firstMatrix, secondMatrix) {
      let result = Array(firstMatrix.length)
      for (let i = 0; i < firstMatrix.length; i++) {
        let sum = 0;
        for (let j = 0; j < firstMatrix[0].length; j++) {
          sum += firstMatrix[i][j] * secondMatrix[j]
        }
        result[i] = sum;
      }
      return result;
    }
}
  
function makePrediction(model, image) {
  const probs = model.forward(image, 0)['f_X'][0];

  console.log("Probs:", probs);

  let maxIndex = 0;
  let maxValue = probs[0];

  for (let i = 0; i < 10; i++) {
    if (probs[i] > maxValue) {
      maxValue = probs[i];
      maxIndex = i;
    }
  }

  return maxIndex;
}
  
function loadWeights() {
  // Задаем считанные веса
  model.first_layer = first_layer;
  model.second_layer = second_layer;
}

// Получение изображения с canvas
function getImage(context) {
  const imageData = context.getImageData(0, 0, w, h);
  const pixels = imageData.data;

  console.log(pixels);

  const monochromeImage = [];

  for (let i = 0; i < pixels.length; i += 4) {
    // Получаем значения RGB компонент пикселя
    const red = pixels[i];
    const green = pixels[i + 1];
    const blue = pixels[i + 2];
  
    // Вычисляем яркость пикселя
    // const brightness = Math.round((red + green + blue) / 3);
    const brightness = Math.round((red + green + blue) / 3);
  
    // Создаем новый пиксель в черно-белом цвете и добавляем его в массив
    monochromeImage.push(brightness);
  }

  return monochromeImage;
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
    if(draw==true){
        mouse.x = e.pageX - this.offsetLeft;
        mouse.y = e.pageY - this.offsetTop;

        context.lineTo(mouse.x, mouse.y);
        context.stroke();
    }
});

function compressPhoto(photo, width, height, newWidth, newHeight) {
  const pixelSizeX = width / newWidth;
  const pixelSizeY = height / newHeight;
  let compressedPhoto = [];

  for (let i = 0; i < newHeight; i++) {
    for (let j = 0; j < newWidth; j++) {
      let sum = 0;
      for (let y = i * pixelSizeY; y < (i + 1) * pixelSizeY; y++) {
        for (let x = j * pixelSizeX; x < (j + 1) * pixelSizeX; x++) {
          sum += photo[y * width + x];
        }
      }
      const average = Math.floor(sum / (pixelSizeX * pixelSizeY));
      compressedPhoto.push(average);
    }
  }

  return compressedPhoto;
}

// Мышь опущена
canvas.addEventListener("mouseup", function(e) {
  mouse.x = e.pageX - this.offsetLeft;
  mouse.y = e.pageY - this.offsetTop;

  context.lineTo(mouse.x, mouse.y);
  context.stroke();
  context.closePath();
  draw = false;

  // Cохраняем изображение
  let image = getImage(context);

  // Сжатие изображения до 28 x 28
  let compressedImage = compressPhoto(image, 700, 700, 28, 28);;
  
  console.log("Image:", image, "Compressed:", compressedImage);
  
  const prediction = makePrediction(model, compressedImage);
  console.log("Pred:", prediction);
  document.getElementsByClassName("predict")[0].innerHTML = "Вердикт: " +  prediction;

  // const test_image = Array.from({length: 28 * 28}, () => Math.floor(Math.random() * 40));  
  // console.log("Test:", make_prediction(model, test_image));
});

// Очистка канваса по нажатию кнопки
document.getElementById('reset_nn').onclick = resetProcessing;
function resetProcessing() {
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);

  document.getElementsByClassName("predict")[0].innerHTML = "Вердикт: ";
}
