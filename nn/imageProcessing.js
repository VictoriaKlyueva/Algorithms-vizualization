export function compressPhoto(photo, width, height, newWidth, newHeight) {
  const pixelSizeX = width / newWidth;
  const pixelSizeY = height / newHeight;
  let compressedPhoto = [];

  for (let i = 0; i < newHeight; i++) {
    for (let j = 0; j < newWidth; j++) {
      let sum = 0;
      for (let y = i * pixelSizeY; y < (i + 1) * pixelSizeY; y++) {
        for (let x = j * pixelSizeX; x < (j + 1) * pixelSizeX; x++) {
          sum += photo[y * width + x];
        }
      }
      const average = Math.floor(sum / (pixelSizeX * pixelSizeY));
      compressedPhoto.push(average);
    }
  }

  return compressedPhoto;
}

// Получение изображения с canvas
export function getImage(context, w, h) {
  const imageData = context.getImageData(0, 0, w, h);
  const pixels = imageData.data;

  const monochromeImage = [];

  for (let i = 0; i < pixels.length; i += 4) {
    // Получаем значения RGB компонент пикселя
    const red = pixels[i];
    const green = pixels[i + 1];
    const blue = pixels[i + 2];
  
    // Вычисляем яркость пикселя
    // const brightness = Math.round((red + green + blue) / 3);
    const brightness = Math.round((red + green + blue) / 3);
  
    // Создаем новый пиксель в черно-белом цвете и добавляем его в массив
    monochromeImage.push(brightness);
  }

  return monochromeImage;
}