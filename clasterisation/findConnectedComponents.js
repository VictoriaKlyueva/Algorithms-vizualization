export function findConnectedComponents(data, distance=100) {
    const adjacencyList = {};
    const visited = new Set();
    const components = [];
  
    for (let i = 0; i < data.length; i++) {
      adjacencyList[i] = [];
    }
  
    // Build adjacency list
    for (let i = 0; i < data.length - 1; i++) {
      const x1 = data[i].x;
      const y1 = data[i].y;
      adjacencyList[i] = [];
      
      for (let j = i + 1; j < data.length; j++) {
        const x2 = data[j].x;
        const y2 = data[j].y;
        
        const currentDistance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        
        if (currentDistance < distance) {
          adjacencyList[i].push(j);
          adjacencyList[j].push(i);
        }
      }
    }
  
    // Depth-first search function
    function dfs(node, component) {
      visited.add(node);
      component.push(node);
      
      for (const neighbor of adjacencyList[node]) {
        if (!visited.has(neighbor)) {
          dfs(neighbor, component);
        }
      }
    }
  
    // Find connected components
    for (let i = 0; i < data.length; i++) {
      if (!visited.has(i)) {
        const component = [];
        dfs(i, component);
        components.push(component);
      }
    }
  
    function toDots(components) {
      let clasters = [];
      for (let i = 0; i < components.length; i++) {
        clasters[i] = [];
      }
  
      for (let i = 0; i < components.length; i++) {
        for (let j = 0; j < components[i].length; j++) {
          clasters[i].push(data[components[i][j]]);
        }
      }
  
      return clasters;
    }
  
    return toDots(components);
  }