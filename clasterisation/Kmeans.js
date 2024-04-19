export function KMeans(data, k, maxNumIters=10000) {
  /*
    Эвристика для генерации центроид - K++
  */
  function generateCentroids(k, data) {
    function getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function calculateDistance(point1, point2) {
      return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
    }

    function getClosestCentroidIndex(point, centroids) {
      let minDistance = Infinity;
      let closestCentroidIndex = null;
      
      centroids.forEach((centroid, index) => {
        const distance = calculateDistance(point, centroid);
        if (distance < minDistance) {
            minDistance = distance;
            closestCentroidIndex = index;
        }
      });
        
      return closestCentroidIndex;
    }

    // Generate the first centroid randomly
    const centroids = [{
      x: getRandomInt(30, 670),
      y: getRandomInt(30, 670)
    }];

    // Generate the rest of the centroids
    for (let i = 1; i < k; i++) {
      let distances = data.map((point) => Math.pow(calculateDistance(point, centroids[getClosestCentroidIndex(point, centroids)]), 2));
      
      let sumDistances = distances.reduce((acc, val) => acc + val, 0);
      let probabilities = distances.map((distance) => distance / sumDistances);
      
      let randomValue = Math.random() * sumDistances;
      let index = 0;
      
      while (randomValue > 0) {
        randomValue -= distances[index];
        index++;
      }
      
      centroids.push(data[index - 1]);
    }

    return centroids;
  }

  let centroids = generateCentroids(k, data);

  let clusters = [];

  // Определение расстояния между двумя точками
  function distance(pointA, pointB) {
    const dx = pointA.x - pointB.x;
    const dy = pointA.y - pointB.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Функция для поиска ближайшего центроида для заданной точки
  function findClosestCentroid(point) {
    let closestCentroid = null;
    let minDistance = Infinity;
    
    centroids.forEach((centroid, index) => {
      const dist = distance(centroid, point);
      if (dist < minDistance) {
        closestCentroid = index;
        minDistance = dist;
      }
    });
    
    return closestCentroid;
  }

  // Проводим итерации
  for (let i = 0; i < maxNumIters; i++) {
    clusters = new Array(k).fill().map(() => []);
    
    data.forEach((point) => {
      const closestCentroid = findClosestCentroid(point);
      clusters[closestCentroid].push(point);
    });

    // Пересчет положений центроидов
    const newCentroids = [];
    
    clusters.forEach(cluster => {
      const clusterSize = cluster.length;
      let sumX = 0;
      let sumY = 0;
      
      cluster.forEach(point => {
        sumX += point.x;
        sumY += point.y;
      });
      
      newCentroids.push({
        x: sumX / clusterSize,
        y: sumY / clusterSize
      });
    });

    // Обновляем положения центроидов
    centroids = newCentroids;
  }

  return clusters;
}