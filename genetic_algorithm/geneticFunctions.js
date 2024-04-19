function shuffleArray(vertecies, array) {
    for (let i = 0; i < vertecies.length - 1; i++) {
        let index1 = randomNumber(1, vertecies.length - 1);
        let index2 = randomNumber(1, vertecies.length - 1);
        array[index1], array[index2] = array[index2], array[index1];
    }

    return array;
}

export function randomNumber(left, right) {
    return  Math.floor(Math.random() * (right - left) + left);
}

export function getFirstPopulation(vertices, firstGeneration){
    let res = [];
    let current = [...firstGeneration];
    current.push(chromosomeDistance(current));
    res.push(current);

    for (let i = 0; i < Math.pow(vertices.length, 2); i++) {
        current = [...firstGeneration];
        current = shuffleArray(vertices, current)
        current.push(chromosomeDistance(current));
        res.push(current)
    }

    return res;
}


function chromosomeDistance(chromosome){
    let ans = 0;
    for (let i = 0; i < chromosome.length - 1; i++) {
        ans += Math.sqrt(Math.pow(chromosome[i][0] - chromosome[i + 1][0], 2) + Math.pow(chromosome[i][1] - chromosome[i + 1][1], 2));
    }
    ans += Math.sqrt(Math.pow(chromosome[chromosome.length - 1][0] - chromosome[0][0], 2) + Math.pow(chromosome[chromosome.length - 1][1] - chromosome[0][1], 2));
    return ans;
}

function cross(firstParent, secondParent, mutationRate, lengthOfChromosome){
    let child = [];

    let start = randomNumber(0, firstParent.length);
    let end = randomNumber(start + 1, firstParent.length);
    let randomSubGen = firstParent.slice(start, end);

    child = [...randomSubGen];

    for (let num of secondParent) {
        if (!child.includes(num)) {
            child.push(num);
        }
    }

    if (Math.random() < mutationRate){
        let index1 = randomNumber(1, lengthOfChromosome);
        let index2 = randomNumber(1, lengthOfChromosome);

        if (index1 != index2) {
            [child[index1], child[index2]] = [child[index2], child[index1]];
        }
    }

    return child;
}

// 18+
export function makeChild(firstParent, secondParent, mutationRate, lengthOfChromosome) {
    let firstChild = cross(firstParent, secondParent, mutationRate, lengthOfChromosome);
    let secondChild = cross(firstParent, secondParent, mutationRate, lengthOfChromosome);

    firstChild.push(chromosomeDistance(firstChild));
    secondChild.push(chromosomeDistance(secondChild));

    let child = [firstChild, secondChild];
    return child;
}
