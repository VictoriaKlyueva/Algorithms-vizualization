async function getfile(filename) {
  let result;
  try {
    const res = await fetch(filename);
    const text = await res.text();
    
    // from string to 2d array
    const rows = text.split("\n");
    const result = rows.map(row => row.split("\t").map(Number));
    
    console.log("исходный массив", result);
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function getData() {
  const second_layer_para = await getfile("nn/second_layer_para.txt");
  const second_layer_bias = await getfile("nn/second_layer_bias.txt");
  
  console.log("новый массив1: ", second_layer_para);
  console.log("новый массив2: ", second_layer_bias);

  
}

getData();