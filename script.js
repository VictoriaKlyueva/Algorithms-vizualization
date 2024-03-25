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
      const z = this.matrixMultiply(this.first_layer.para, x).map((i) => [i]) + this.first_layer.bias;
      const h = this.activationFunction(z).map((i) => [i]);
      const u = this.matrixMultiply(this.second_layer.para, h).map((i) => [i]) + this.second_layer.bias;
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
    
    matrixMultiply(mat1, mat2) {
      const result = [];

      const rows1 = mat1.length;
      const cols1 = mat1[0].length;
      const rows2 = mat2.length;
      const cols2 = mat2[0].length;
  
      if (cols1 != rows2) {
        throw new Error('Matrix dimensions are not compatible for multiplication');
      }
  
      for (let i = 0; i < rows1; i++) {
        result[i] = [];
        for (let j = 0; j < cols2; j++) {
          let sum = 0;
          for (let k = 0; k < cols1; k++) {
            sum += mat1[i][k] * mat2[k][j];
          }
          result[i][j] = sum;
        }
      }
      return result;
    }
}

function make_prediction(model, image) {
    return model.forward(image, 0)['f_X'];
}

async function getfile(filename) {
  let result;
  try {
    const res = await fetch(filename);
    const text = await res.text();
    
    // from string to 2d array
    const rows = text.split("\n");
    const result = rows.map(row => row.split("\t").map(Number));
    
    return result;
  }
  catch (error) {
    console.error(error);
    throw error;
  }
}

async function main() {
  const first_layer_para = await getfile("nn/first_layer_para.txt");
  const first_layer_bias = await getfile("nn/first_layer_bias.txt");
  const second_layer_para = await getfile("nn/second_layer_para.txt");
  const second_layer_bias = await getfile("nn/second_layer_bias.txt");
  
  const num_inputs = 28 * 28;
  const hidden_size = 300;
  const num_outputs = 10;

  const model = new NeuralNetwork(num_inputs, hidden_size, num_outputs);

  console.log("Программа завершена");
}

main();


// Usage
/*
const num_inputs = 28 * 28;
const hidden_size = 300;
const num_outputs = 10;

const model = new NeuralNetwork(num_inputs, hidden_size, num_outputs);
*/

// image = Array.from({length: 28 * 28}, () => Math.floor(Math.random() * 40));

//console.log(make_prediction(model, image));