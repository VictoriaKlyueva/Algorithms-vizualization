const canvas = document.getElementById("canvas_decision_tree");
const context = canvas.getContext('2d');

// Classification criterion functions
function entropy(y) {
    const uniqueValues = [...new Set(y)];
    const probabilities = uniqueValues.map(k => y.filter(val => val === k).length / y.length);
    return -1 * probabilities.reduce((sum, p) => sum + p * Math.log2(p), 0);
}

function gini(y) {
    const uniqueValues = [...new Set(y)];
    const probabilities = uniqueValues.map(k => y.filter(val => val === k).length / y.length);
    return 1 - probabilities.reduce((sum, p) => sum + p ** 2, 0);
}

// Regression criterion functions
function variance(y) {
    const mean = y.reduce((sum, val) => sum + val, 0) / y.length;
    return y.reduce((sum, val) => sum + (val - mean) ** 2, 0) / y.length;
}

function madMedian(y) {
    const sorted = y.slice().sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    return y.reduce((sum, val) => sum + Math.abs(val - median), 0) / y.length;
}

// Dictionary for easy mapping with input string
const criterionDict = {
    'entropy': entropy,
    'gini': gini,
    'mse': variance,
    'mad_median': madMedian
};

// the most popular class in leaf
function classificationLeaf(y) {
    const counts = {};
    y.forEach(val => counts[val] = (counts[val] || 0) + 1);
    return Object.entries(counts).reduce((a, b) => a[1] > b[1] ? a : b)[0];
}

// the mean of all values in a leaf
function regressionLeaf(y) {
    return y.reduce((sum, val) => sum + val, 0) / y.length;
}

class Node {
    constructor(featureIdx = 0, threshold = 0, labels = null, left = null, right = null) {
        this.featureIdx = featureIdx;
        this.threshold = threshold;
        this.labels = labels;
        this.left = left;
        this.right = right;
    }
}

class DecisionTree {
    constructor(maxDepth = Infinity, minSamplesSplit = 2, criterion = 'gini') {
        this.maxDepth = maxDepth;
        this.minSamplesSplit = minSamplesSplit;
        this.criterion = criterion;

        this._criterionFun = criterionDict[this.criterion];

        if (['mse', 'mad_median'].includes(this.criterion)) {
            this._leafValue = regressionLeaf;
        } else {
            this._leafValue = classificationLeaf;
        }
    }

    _functional(X, y, featureIdx, threshold) {
        if (isNaN(threshold)) {
            return 0;
        }

        const mask = X.map(row => row[featureIdx] < threshold);
        const X_l = X.filter((row, i) => mask[i]);
        const y_l = y.filter((val, i) => mask[i]);

        const X_r = X.filter((row, i) => !mask[i]);
        const y_r = y.filter((val, i) => !mask[i]);

        // if all the data goes to one of the child
        if (X_l.length === 0 || X_r.length === 0) {
            return 0;
        }

        return this._criterionFun(y) -
            (X_l.length / X.length) * this._criterionFun(y_l) -
            (X_r.length / X.length) * this._criterionFun(y_r);
    }

    _buildTree(X, y, depth = 1) {
        if (depth > this.maxDepth) {
            return new Node(0, 0, y);
        }

        const nSamples = X.length;
        const nFeatures = X[0].length;

        if (nSamples < this.minSamplesSplit) {
            return new Node(0, 0, y);
        }

        if (new Set(y).size === 1) {
            return new Node(0, 0, y);
        }

        let maxGain = 0;
        let bestFeatIdx = 0;
        let bestThreshold = 0;

        for (let featureIdx = 0; featureIdx < nFeatures; featureIdx++) {
            const allThresholds = [...new Set(X.map(row => row[featureIdx]))];

            const allGain = allThresholds.map(threshold => this._functional(X, y, featureIdx, threshold));

            const thresholdIdx = allGain.reduce((maxIdx, gain, i) => isNaN(gain) ? maxIdx : (gain > allGain[maxIdx] ? i : maxIdx), 0);

            if (allGain[thresholdIdx] > maxGain) {
                maxGain = allGain[thresholdIdx];
                bestFeatIdx = featureIdx;
                bestThreshold = allThresholds[thresholdIdx];
            }
        }

        const mask = X.map(row => row[bestFeatIdx] < bestThreshold);

        return new Node(bestFeatIdx, bestThreshold, null,
            this._buildTree(X.filter((row, i) => mask[i]), y.filter((val, i) => mask[i]), depth+1), 
            this._buildTree(X.filter((row, i) => !mask[i]), y.filter((val, i) => !mask[i]), depth+1));
    }

    fit(X, y) {
        // remember the number classes for classification task
        if (['gini', 'entropy'].includes(this.criterion)) {
            this._nClasses = new Set(y).size;
        }

        this.root = this._buildTree(X, y);
        return this;
    }

    // predict only for one object
    _predictObject(x) {
        let node = this.root;

        while (node.labels === null) {
            node = x[node.featureIdx] < node.threshold ? node.left : node.right;
        }

        return this._leafValue(node.labels);
    }

    predict(X) {
        return X.map(x => this._predictObject(x));
    }

    _predictProbObject(x) {
        let node = this.root;

        while (node.labels === null) {
            node = x[node.featureIdx] < node.threshold ? node.left : node.right;
        }

        const counts = {};
        node.labels.forEach(label => counts[label] = (counts[label] || 0) + 1);
        return Array.from({ length: this._nClasses }, (_, k) => counts[k] / node.labels.length || 0);
    }

    predictProba(X) {
        return X.map(x => this._predictProbObject(x));
    }
}

// print results of trained regression model
function printResultsReg(model) {
    const y_pred = model.predict(X_test);
    let mse = y_test.reduce((sum, val, i) => sum + (val - y_pred[i]) ** 2, 0) / y_test.length;
    console.log(y_pred);
}

function drawDecisionTree(tree) {
    // Очистить canvas перед отрисовкой нового дерева
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.strokeStyle = 'white';
    context.fillStyle = 'white';

    // Вычислить ширину и высоту узлов дерева
    const nodeWidth = 80;
    const nodeHeight = 40;

    // Рекурсивная функция для отрисовки узлов дерева
    function drawNode(node, x, y) {
        // Отрисовать прямоугольник для узла
        context.beginPath();
        context.rect(x - nodeWidth / 2, y - nodeHeight / 2, nodeWidth, nodeHeight);
        context.stroke();
        context.closePath();

        // Нарисовать текст в узле
        context.font = '14px Inter';
        context.fillText(`Feat: ${node.featureIdx}`, x - 35, y - 10);
        context.fillText(`Thresh: ${node.threshold.toFixed(2)}`, x - 45, y + 5);
        
        // Рекурсивно отрисовать дочерние узлы, если они существуют
        if (node.left) {
            drawNode(node.left, x - 100, y + 80);
            // Нарисовать связь между текущим узлом и его левым дочерним узлом
            context.beginPath();
            context.moveTo(x, y);
            context.lineTo(x - 100, y + 20);
            context.stroke();
            context.closePath();
        }
        if (node.right) {
            drawNode(node.right, x + 100, y + 80);
            // Нарисовать связь между текущим узлом и его правым дочерним узлом
            context.beginPath();
            context.moveTo(x, y);
            context.lineTo(x + 100, y + 20);
            context.stroke();
            context.closePath();
        }
    }

    // Начать отрисовку с корневого узла дерева
    drawNode(tree.root, canvas.width / 2, 40);
}

const actualBtn = document.getElementById('actual-btn');
actualBtn.addEventListener('change', function() {
    // Код
});

// Пример ииспользования
const data = Array.from({ length: 300 }, () => [Math.random()]);

const y = data.map(row => row[0] * 10 + Math.random() * 5 - 2.5);

// Split data into train and test sets
const X_train = data.slice(0, data.length - 2);
const X_test = data.slice(data.length - 2);
const y_train = y.slice(0, data.length - 2);
const y_test = y.slice(data.length - 1);

const model = new DecisionTree(6, 2, 'mse');
model.fit(X_train, y_train);
printResultsReg(model);

console.log(model);
drawDecisionTree(model);