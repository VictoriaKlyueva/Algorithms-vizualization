// https://github.com/abbas-taher/decision-tree-algorithm-example
// https://github.com/pbharrin/machinelearninginaction3x


const canvas = document.getElementById("canvas_decision_tree");
const context = canvas.getContext('2d');

const width = canvas.width;
const height = canvas.height;

var tree;

function calculateEntropy(dataset) {
  let counter = {};
  for (let record of dataset) {
    let label = record[record.length - 1];
    if (counter[label]) {
      counter[label] += 1;
    }
    else {
      counter[label] = 1;
    }
  }

  let entropy = 0.0;
  for (let key in counter) {
    let probability = counter[key] / dataset.length;
    entropy -= probability * Math.log2(probability);
  }
  return entropy;
}

function splitDataset(dataSet, axis, value) {
  let retDataSet = [];
  for (let featVec of dataSet) {
    if (featVec[axis] == value) {
      let reducedFeatVec = featVec.slice();
      reducedFeatVec.splice(axis, 1);
      retDataSet.push(reducedFeatVec);
    }
  }
  return retDataSet;
}

function chooseBestFeatureToSplit(dataset) {
  let baseEntropy = calculateEntropy(dataset);
  let bestInfoGain = 0.0;
  let bestFeature = -1;

  let numFeat = dataset[0].length - 1;
  for (let indx = 0; indx < numFeat; indx++) {
    let featValues = new Set();
    for (let record of dataset) {
      featValues.add(record[indx]);
    }

    let featEntropy = 0.0;
    for (let value of featValues) {
      let subDataset = splitDataset(dataset, indx, value);
      let probability = subDataset.length / dataset.length;

      featEntropy += probability * calculateEntropy(subDataset);
    }

    let infoGain = baseEntropy - featEntropy;
    if (infoGain > bestInfoGain) {
      bestInfoGain = infoGain;
      bestFeature = indx;
    }
  }

  return bestFeature;
}

function createTree(dataset, features) {
  let labels = dataset.map((record) => record[record.length - 1]);

  if (labels.filter((label) => label === labels[0]).length === labels.length) {
    return labels[0];
  }

  if (dataset[0].length === 1) {
    let majorityCount = labels.reduce(function (a, b) {
        return labels.filter(function (v) {
            return v === a;
        }).length >= labels.filter(function (v) {
            return v === b;
        }).length ? a : b;
    });

    return majorityCount;
  }

  let bestFeat = chooseBestFeatureToSplit(dataset);
  let bestFeatLabel = features[bestFeat];
  let featValues = new Set();

  for (let record of dataset) {
      featValues.add(record[bestFeat]);
  }

  let subLabels = features.slice();
  subLabels.splice(bestFeat, 1);

  let tree = {};
  tree[bestFeatLabel] = {};

  for (let value of featValues) {
    let subDataset = splitDataset(dataset, bestFeat, value);
    let subTree = createTree(subDataset, subLabels);
    tree[bestFeatLabel][value] = subTree;
  }
  return tree;
}

function predict(inputTree, features, testVec) {
  function classify(inputTree, testDict) {
    let key = Object.keys(inputTree)[0];
    let subtree = inputTree[key];
    let testValue = testDict[key];
    delete testDict[key];
    if (Object.keys(testDict).length === 0) {
      return subtree[testValue];
    }
    else {
      return classify(subtree[testValue], testDict);
    }
  }

  let testDict = {};
  for (let i = 0; i < features.length; i++) {
    testDict[features[i]] = testVec[i];
  }
  return classify(inputTree, testDict);
}

function printTree(tree) {
  console.log(JSON.stringify(tree, null, 4));
}

function roundedRectPath(x, y, w, h, r) {
  r = (Math.min(w, h) /2  > r) ? r : Math.min(w, h) / 2;

  return `M ${x + r} ${y} l ${w-2*r} 0 q ${r} 0 ${r} ${r}
      l 0 ${h - 2 * r} q 0 ${r} ${-r} ${r}
      l ${- w + 2 * r} 0 q ${-r} 0 ${-r} ${-r}
      l 0 ${- h + 2 * r} q 0 ${-r} ${r} ${-r}`;
}

// Функция для отображения дерева на странице
function createCanvasTree(tree) {
  console.log(tree);

  const margin = 50;
  const nodeWidth = 10;
  const nodeHeight = 50;
  const levelSpacing = 100;

  const font = '16px Inter';
  const colorNode = '#F63A62';
  const colorLeaf = '#FFFFFF';

  function drawNode(node, level, x, y, name='') {
    const type = typeof node === 'string' ? 'leaf' : 'node';
    const fill = type === 'leaf' ? colorLeaf : colorNode;
     let mainText, secondText = '';
    if (type === 'leaf') {
      mainText = node;
      // secondText = 'leaf';
    }
    else {
      mainText = Object.keys(node)[0];
    }

    context.fillStyle = fill;
    context.stroke(new Path2D(roundedRectPath(x, y, nodeWidth * (mainText.length + 5), nodeHeight, 10)));
    context.fill(new Path2D(roundedRectPath(x, y, nodeWidth * (mainText.length + 5), nodeHeight, 10)));
    context.fillStyle = 'black';
    context.font = font;
    context.fillText(mainText, x + 5, y + 20);
    context.fillText(secondText, x + 5, y + 40);

    if (type === 'node') {
      const children = node[mainText];
      const childCount = Object.keys(children).length;
      const childWidth = nodeWidth / childCount;
      const childHeight = nodeHeight / 2;
      const childMargin = 90;

      let childX = x - childCount / 2 * (childWidth + childMargin);
      for (let i = 0; i < childCount; i++) {
        const child = children[Object.keys(children)[i]];
        childX += childWidth + childMargin;
        const childY = y + nodeHeight + levelSpacing;
        drawNode(child, level + 1, childX, childY);
        
        // Рисуем ребра от родителя к детям
        context.beginPath();
        context.strokeStyle = '#000';
        context.moveTo(x + nodeWidth * (mainText.length) / 2, y + nodeHeight);
        context.lineTo(childX + childWidth / 2, childY);
        context.stroke();
      }
    }
  }

  const rootNode = tree;
  const rootX = (width - nodeWidth) / 4;
  const rootY = margin;
  drawNode(rootNode, 0, rootX, rootY);
}

// Загрузка обучающей выборки по нажатию кнопки
const actualBtn = document.getElementById('actual-btn');
const input = document.querySelector("input");

actualBtn.addEventListener('change', function() {
  const reader = new FileReader();
  
  reader.onload = function(e) {
    // Очистка canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    const csv = e.target.result;
    const rows = csv.split('\n');

    let features = [];
    const dataArray = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i].split(',');
      console.log(row);
      if (i === 0) {
        features = row;
      }
      else {
        dataArray.push(row);
      }
    }

    console.log("Держимся");
    console.log(dataArray);

    tree = createTree(dataArray, features);

    console.log(tree);
    context.scale(0.9 * tree.size, 0.9 * tree.size)
    printTree(tree);

    createCanvasTree(tree);
  };

  reader.readAsText(this.files[0]);
});

// Очистка канваса по нажатию кнопки
document.getElementById('tree_reset').onclick = resetProcessing;
function resetProcessing() {
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
  tree = {};
}