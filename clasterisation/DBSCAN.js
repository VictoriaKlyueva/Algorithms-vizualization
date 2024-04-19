export function DBSCAN(points, eps = 100, minPts = 1) {
  let clusters = [];
  let noise = [];

  function distance(p1, p2) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function regionQuery(point) {
    return points.filter(p => distance(p, point) <= eps);
  }

  function expandCluster(point, neighborPoints, clusterId) {
    clusters[clusterId] = clusters[clusterId] || [];
    clusters[clusterId].push(point);
    point.visited = true;

    neighborPoints.forEach(neighbor => {
      if (!neighbor.visited) {
        neighbor.visited = true;
        const neighborNeighborPoints = regionQuery(neighbor);

        if (neighborNeighborPoints.length >= minPts) {
          neighborPoints.push(...neighborNeighborPoints);
        }
      }

      if (!clusters.some(cluster => cluster.includes(neighbor))) {
        clusters[clusterId].push(neighbor);
      }
    });
  }

  points.forEach(point => {
    if (point.visited) return;

    point.visited = true;
    const neighborPoints = regionQuery(point);

    if (neighborPoints.length < minPts) {
      noise.push(point);
    } else {
      clusters.push([]);
      expandCluster(point, neighborPoints, clusters.length - 1);
    }
  });

  return clusters;
}