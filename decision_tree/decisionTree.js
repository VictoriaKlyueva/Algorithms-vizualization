// https://github.com/pbharrin/machinelearninginaction3x

import { createTree, predict } from "./creatingTree.js"

const canvas = document.getElementById("canvas_decision_tree");
const context = canvas.getContext('2d');

const width = canvas.width;
const height = canvas.height;

let tree;

function printTree(tree) {
  console.log(JSON.stringify(tree, null, 4));
}

function roundedRectPath(x, y, w, h, r) {
  r = (Math.min(w, h) /2  > r) ? r : Math.min(w, h) / 2;

  return `M ${x + r} ${y} l ${w - 2 * r} 0 q ${r} 0 ${r} ${r}
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

  function drawNode(node, level, x, y) {
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

// Загрузка обучающей выборки по нажатию кнопки и построение дерева
const actualBtn = document.getElementById('actual-btn');

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
      if (i === 0) {
        features = row;
      }
      else {
        dataArray.push(row);
      }
    }

    tree = createTree(dataArray, features);

    console.log("Tree structure: ", tree);

    context.scale(0.8 * tree.size, 0.8 * tree.size)
    printTree(tree);

    createCanvasTree(tree);

    console.log(predict(tree, features, dataArray));
  };

  reader.readAsText(this.files[0]);
});



// // Очистка канваса по нажатию кнопки
// document.getElementById('tree_reset').onclick = resetProcessing;
// function resetProcessing() {
//   const context = canvas.getContext('2d');
//   context.clearRect(0, 0, canvas.width, canvas.height);
//   tree = {};
// }