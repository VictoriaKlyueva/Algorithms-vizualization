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
      if (featVec[axis] === value) {
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
  
export function createTree(dataset, features) {
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
  
export function predict(inputTree, features, testVec) {
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
  