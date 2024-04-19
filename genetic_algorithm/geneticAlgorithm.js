import { randomNumber, getFirstPopulation, makeChild } from "./geneticFunctions.js"

const canvas = document.getElementById("canvas_genetic_algorithm");
const context = canvas.getContext("2d");

let vertecies = [];

const numIterations = 1000;
const numGenerations = 10000;
const mutationRate = 0.3;

const badChromosomesColor = 'rgba(255,255,255,0.1)';
const trailColor = '#7000FF';

async function geneticAlgorithm() {
    resetProcessing(false);
    plotVertecies();
    let firstGeneration = [];

    for (let i = 0; i < vertecies.length; i++) {
        firstGeneration.push(vertecies[i]);
    }

    let population = getFirstPopulation(vertecies, firstGeneration);
    population.sort((function (a, b) { return a[a.length - 1] - b[b.length - 1]}));

    let bestChromosome = population[0];

    for(let i = 0; i < numGenerations; i++) {
        if (i === numIterations) {
            plotLines(bestChromosome);
            break;
        }

        population = population.slice(0, Math.pow(vertecies.length, 2));

        for (let j = 0; j < Math.pow(vertecies.length, 2); j++) {
            let index1 = randomNumber(0, population.length);
            let index2 = randomNumber(0, population.length);

            let firstParent = population[index1].slice(0, population[index1].length - 1);
            let secondParent = population[index2].slice(0, population[index2].length - 1);

            let child = makeChild(firstParent, secondParent, mutationRate);

            population.push(child[0]);
            population.push(child[1]);
        }

        population.sort((function (a, b) {
            return a[a.length - 1] - b[b.length - 1];
        }));

        // Путь изменился
        if (JSON.stringify(bestChromosome) !== JSON.stringify(population[0])) {
            // Рисуем предполагаемый путь на текуще шаге
            if (i >= 100) {
                plotLines(bestChromosome, badChromosomesColor);
            }
            bestChromosome = population[0].slice();
        }
    }
    plotVertecies();
}

function plotVertecies() {
    for (let vertex of vertecies) {
        plotDot(vertex[0], vertex[1], 20);
    }
}

function plotDot(x, y, radius, color='white') {
    context.beginPath();
  
    context.fillStyle = color; 
  
    context.arc(x, y, radius, 0, 2 * Math.PI, false);
  
    context.lineWidth = 5;
    context.strokeStyle = 'white';
  
    context.stroke();
    context.closePath();
}

function plotLines(bestPath, color=trailColor) {
    bestPath.splice(bestPath.length - 1, 0, bestPath[0]);
    console.log("Best path lenght: ", bestPath[bestPath.length - 1]);

    context.strokeStyle = color;
    context.lineWidth = 7;
    context.lineCap = "round";

    context.beginPath();
    for (let i = 0; i < bestPath.length - 2; i++) {
        let vector = [bestPath[i + 1][0] - bestPath[i][0] , bestPath[i + 1][1] - bestPath[i][1]];
        let s = Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1]);

        context.moveTo(bestPath[i][0] + vector[0] * 10 / s, bestPath[i][1] + vector[1] * 10 / s);
        context.lineTo(bestPath[i + 1][0] - vector[0] * 10 / s, bestPath[i + 1][1] - vector[1] * 10 / s);

        context.stroke();
    }
    context.closePath();
}

// Расстановка точек пользователем
canvas.addEventListener("click", (e) => {
    let x = e.pageX - e.target.offsetLeft;
    let y = e.pageY - e.target.offsetTop;

    context.beginPath();
    plotDot(x, y, 20);
    vertecies.push([x, y]);
    context.closePath();
});

// Запуск алгоритма по нажатию кнопки
document.getElementById("genetic_algorithm_button").onclick = buttonProcessing;
function buttonProcessing() {
    geneticAlgorithm();
}

// Очистка canvas по нажатию кнопки
document.getElementById("genetic_algorithm_reset").onclick = resetProcessing;
function resetProcessing(resetVertecies=true) {
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    if (resetVertecies) {
        vertecies = [];
    }
}