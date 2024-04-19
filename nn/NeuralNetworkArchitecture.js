export class NeuralNetwork {
  constructor(inputs, hidden, outputs) {
    this.first_layer = {};
    this.second_layer = {};

    this.input_size = inputs;
    this.hid_size = hidden;
    this.output_size = outputs;
  }

  activationFunction(z, type = 'relu', derivative = false) {
    if (type === 'relu') {
      if (derivative) {
        return z.map((i) => i > 0 ? 1 : 0);
      } else {
        return z.map((i) => i > 0 ? i : 0);
      }
    } else if (type === 'leakyrelu') {
      if (derivative) {
        return z.map((i) => i >= 0 ? 1 : 0.01);
      } else {
        return z.map((i) => i >= 0 ? i : 0.01 * i);
      }
    } else if (type === 'sigmoid') {
      if (derivative) {
        return z.map((i) => (1 / (1 + Math.exp(-i))) * (1 - 1 / (1 + Math.exp(-i))));
      } else {
        return z.map((i) => 1 / (1 + Math.exp(-i)));
      }
    } else if (type === 'tanh') {
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
    let result = Array(firstMatrix.length).fill(0);
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

export function makePrediction(model, image) {
    const probs = model.forward(image, 0)['f_X'][0];

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