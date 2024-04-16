const canvas = document.getElementById("canvas_genetic_algorithm");
const context = canvas.getContext("2d");

// Количество кликов по canvas
var clicks = 0;

let vertecies = [];

const NUM_ITERATIONS = 1000;
const NUM_POPULATION = 1000;
const NUM_GENERATIONS = 100000;
const MUTATION_RATE = 0.3;

let lengthOfChromosome = 0;

function randomNumber(left, right) {
    return  Math.floor(Math.random() * (right - left) + left);
}

function getFirstPopulation(firstGeneration){
    let res = [];
    let current = firstGeneration.slice();
    current.push(chromosomeDistance(current));
    res.push(current);

    for (let i = 0; i < Math.pow(vertecies.length, 2); i++) {
        current = firstGeneration.slice();
        current = shuffleArray(current)
        current.push(chromosomeDistance(current));
        res.push(current)
    }

    return res;
}

function addToPopulation(population, chromosome) {
    if (!population.length) {
        population.push(chromosome);
    }
    else {
        let flag = false
        for (let i = 0; i < population.length; i++) {
            if (chromosome[chromosome.length - 1] < population[i][population[i].length - 1]) {
                population.splice(i, 0, chromosome);
                flag = true;
                break;
            }
        }
        if (!flag) {
            population.push(chromosome);
        }
    }
}

function chromosomeDistance(chromosome){
    let ans = 0;
    for (let i = 0; i < chromosome.length - 1; i++) {
        ans += Math.sqrt(Math.pow(chromosome[i][0] - chromosome[i + 1][0], 2) + Math.pow(chromosome[i][1] - chromosome[i + 1][1], 2));
    }
    ans += Math.sqrt(Math.pow(chromosome[chromosome.length - 1][0] - chromosome[0][0], 2) + Math.pow(chromosome[chromosome.length - 1][1] - chromosome[0][1], 2));
    return ans;
}

function cross(firstParent, secondParent){
    let child = [];

    let randomSubGen = firstParent.slice(randomNumber(0, firstParent.length), 
                                     randomNumber(randomNumber(0, firstParent.length) + 1, 
                                                  firstParent.length) + 1);

    child = randomSubGen;

    for (let num of secondParent) {
        if (!child.includes(num)) {
            child.push(num);
        }
    }

    if (Math.random() < MUTATION_RATE){
        let index1 = randomNumber(1, lengthOfChromosome);
        let index2 = randomNumber(1, lengthOfChromosome);

        if (index1 != index2) {
            child[index1], child[index2] = child[index2], child[index1];
        }
    }

    return child;
}

function makeChild(firstParent, secondParent) { // 18+
    let firstChild = cross(firstParent, secondParent);
    let secondChild = cross(firstParent, secondParent);

    firstChild.push(chromosomeDistance(firstChild));
    secondChild.push(chromosomeDistance(secondChild));

    let child = [firstChild, secondChild];
    return child;
}

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

    let population = getFirstPopulation(firstGeneration);
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

            let child = makeChild(firstParent, secondParent);

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
    bestPath.splice(bestPath.length - 1, 0, bestPath[0])
    console.log(bestPath)

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

function shuffleArray(array) {
    for (let i = 0; i < vertecies.length - 1; i++) {
        let index1 = randomNumber(1, vertecies.length - 1);
        let index2 = randomNumber(1, vertecies.length - 1);
        array[index1], array[index2] = array[index2], array[index1];
    }

    return array;
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
        clicks = 0;
    }
}