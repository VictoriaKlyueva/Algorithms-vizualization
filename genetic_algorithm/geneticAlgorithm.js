import { randomNumber, getFirstPopulation, makeChild } from "./geneticFunctions.js"

const canvas = document.getElementById("canvas_genetic_algorithm");
const context = canvas.getContext("2d");

let vertecies = [];

const NUM_ITERATIONS = 1000;
const NUM_GENERATIONS = 100000;
const MUTATION_RATE = 0.3;

let lengthOfChromosome = 0;


document.getElementById("genetic_algorithm_button").onclick = geneticAlgorithm;
async function geneticAlgorithm() {
    resetProcessing(false);
    for (let i = 0; i < vertecies.length; i++) {
        plotDot(vertecies[i][0], vertecies[i][1], 20);
    }

    let firstGeneration = [];

    for (let i = 0; i < vertecies.length; i++) {
        firstGeneration.push(vertecies[i]);
    }

    lengthOfChromosome = firstGeneration.length;

    let population = getFirstPopulation(vertecies, firstGeneration);
    population.sort((function (a, b) { return a[a.length - 1] - b[b.length - 1]}));

    let bestChromosome = population[0];

    for(let i = 0; i < NUM_GENERATIONS; i++) {
        if (i === NUM_ITERATIONS) {
            plotLines(bestChromosome);
            break;
        }

        population = population.slice(0, vertecies.length * vertecies.length);

        for (let j = 0; j < vertecies.length * vertecies.length; j++) {
            let index1 = randomNumber(0, population.length);
            let index2 = randomNumber(0, population.length);

            let firstParent = population[index1].slice(0, population[index1].length - 1);
            let secondParent = population[index2].slice(0, population[index2].length - 1);

            let child = makeChild(firstParent, secondParent, MUTATION_RATE);

            population.push(child[0]);
            population.push(child[1]);
        }

        population.sort((function (a, b) {
            return a[a.length - 1] - b[b.length - 1];
        }));

        if (JSON.stringify(bestChromosome) !== JSON.stringify(population[0])) {
            bestChromosome = population[0].slice();
        }

        for (let i = 0; i < vertecies.length; i++) {
            plotDot(vertecies[i][0], vertecies[i][1], 20);
        }
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

function plotLines(bestPath, color="white") {
    bestPath.splice(bestPath.length - 1, 0, bestPath[0]);
    console.log("Best path lenght: ", bestPath[bestPath.length - 1]);

    context.strokeStyle = color;
    context.lineWidth = "7";
    context.lineCap = "round";

    context.beginPath();
    for (let i = 0; i < bestPath.length - 2; i++) {
        let vector = [bestPath[i + 1][0] - bestPath[i][0] , bestPath[i + 1][1] - bestPath[i][1]];
        let s = Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1]);

        context.moveTo(bestPath[i][0] + vector[0] * 10 / s, bestPath[i][1] + vector[1] * 10 / s);
        context.lineTo(bestPath[i + 1][0] - vector[0] * 10 / s, bestPath[i + 1][1] - vector[1] * 10 / s);

        context.stroke();
    }
}

// Расстановка точек пользователем
canvas.addEventListener("click", (e) => {
    let x = e.pageX - e.target.offsetLeft;
    let y = e.pageY - e.target.offsetTop;

    context.beginPath();

    plotDot(x, y, 20);

    vertecies.push([x, y]);
});

// Очистка canvas по нажатию кнопки
document.getElementById("genetic_algorithm_reset").onclick = resetProcessing;
function resetProcessing(resetVertecies=true) {
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    if (resetVertecies) {
        vertecies = [];
    }
}