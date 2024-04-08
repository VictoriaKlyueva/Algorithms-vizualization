// https://github.com/abbas-taher/decision-tree-algorithm-example
// https://github.com/pbharrin/machinelearninginaction3x


function calculateEntropy(dataset) {
    // Подсчет количесвта уникальных лейблов данных
    let counter = {};
    for (let record of dataset) {
      let label = record[record.length - 1]; // always assuming last column is the label column
      if (counter[label]) {
        counter[label] += 1;
      } else {
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
        let reducedFeatVec = featVec.slice(0, axis);
        reducedFeatVec = reducedFeatVec.concat(featVec.slice(axis + 1));
        retDataSet.push(reducedFeatVec);
      }
    }
    return retDataSet;
}
  
function chooseBestFeatureToSplit(dataset) {
    let baseEntropy = calculateEntropy(dataset);
    let bestInfoGain = 0.0;
    let bestFeature = -1;

    let numFeat = dataset[0].length - 1; // do not include last label column
    for (let indx = 0; indx < numFeat; indx++) {
        let featValues = new Set();
        for (let record of dataset) {
        featValues.add(record[indx]);
        }
        let featEntropy = 0.0;
        for (let value of featValues) {
        let subDataset = splitDataset(dataset, indx, value);
        let probability = subDataset.length / dataset.length;

        // Сумма энтропии для всех фич
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
  
    // Первое условие разбиения
    if (labels.filter((label) => label === labels[0]).length === labels.length) {
      // Прекращаем разбиение, когда все лейблы одинаковы
      return labels[0];
    }

    // Второе уловие разбиения
    if (dataset[0].length === 1) {
      // stop splitting when there are no more features in dataset
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

    // Копия лейблов
    let subLabels = features.slice();
    // Удаляем bestFeature из списка лейблов
    subLabels.splice(bestFeat, 1);
  
    let tree = {};
    tree[bestFeatLabel] = {};

    for (let value of featValues) {
      let subDataset = splitDataset(dataset, bestFeat, value);
      let subTree = createTree(subDataset, subLabels);
      tree[bestFeatLabel][value] = subTree; // add (key,val) item into empty object
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
      } else {
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
  
function createDataset(dataset) {
  let features = ["non-surfacing", "flippers", "something"];
  return [dataset, features];
}

/*

let [dataset, features] = createDataset();
let tree = createTree(dataset, features);
printTree(tree);

// Пример тестового датасета
let testVectors = [
    [0, 0, 0],
    [0, 1, 0],
    [1, 0, 2],
    [1, 1, 3],
];

for (let vec of testVectors) {
    let pred = predict(tree, features, vec);
    console.log(pred);
}
*/

// Загрузка обучающей выборки по нажатию кнопки
const actualBtn = document.getElementById('actual-btn');
const input = document.querySelector("input");

actualBtn.addEventListener('change', function() {
  const reader = new FileReader();
  
  reader.onload = function(e) {
    const csv = e.target.result;
    const rows = csv.split('\n');

    const labels = [];
    const dataArray = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i].split(',');
      if (i === 0) {
        labels.push(row);
      }
      else {
        dataArray.push(row);
      }
    }

    console.log("Держимся");
    console.log(dataArray);

    let [dataset, features] = createDataset(dataArray);
    let tree = createTree(dataset, features);
    printTree(tree);
  };

  reader.readAsText(this.files[0]);
});