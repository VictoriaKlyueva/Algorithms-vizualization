function getImage(context) {
    const imageData = context.getImageData(0, 0, w, h);
    const pixels = imageData.data;

    const bw_image = [];

    for (let i = 0; i < pixels.length; i += 4) {
        // Получаем значения RGB компонент пикселя
        const red = pixels[i];
        const green = pixels[i + 1];
        const blue = pixels[i + 2];
      
        // Вычисляем яркость пикселя
        const brightness = Math.round((red + green + blue) / 3);
      
        // Создаем новый пиксель в черно-белом цвете и добавляем его в массив
        bw_image.push(brightness);
      }

    return bw_image;
}

const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

const w = canvas.width;
const h = canvas.height;

// координаты мыши
const mouse = { x: 0, y: 0};
let draw = false;
                
// нажатие мыши
canvas.addEventListener("mousedown", function(e) {
    mouse.x = e.pageX - this.offsetLeft;
    mouse.y = e.pageY - this.offsetTop;
    draw = true;
    context.beginPath();

    context.lineWidth = 20; 
    context.lineCap = 'round'; 
    context.strokeStyle = 'white'; 

    context.moveTo(mouse.x, mouse.y);
});

// перемещение мыши
canvas.addEventListener("mousemove", function(e) {
    if(draw==true){
        mouse.x = e.pageX - this.offsetLeft;
        mouse.y = e.pageY - this.offsetTop;
        context.lineTo(mouse.x, mouse.y);
        context.stroke();
    }
});

// отпускаем мышь
canvas.addEventListener("mouseup", function(e) {
    mouse.x = e.pageX - this.offsetLeft;
    mouse.y = e.pageY - this.offsetTop;
    context.lineTo(mouse.x, mouse.y);
    context.stroke();
    context.closePath();
    draw = false;

    // сохраняем изображение
    image = getImage(context);

    let compressedImage = [];
    for (let i = 0; i < 28; i++) {
        for (let j = 0; j < 28; j++) {
            let pixelSum = 0;

            // Суммируем значения всех пикселей, относящихся к одному пикселю сжатого изображения
            for (let k = i * 25; k < (i + 1) * 25; k++) {
                for (let l = j * 25; l < (j + 1) * 25; l++) {
                    pixelSum += image[k * 700 + l];
                }
            }

            // Вычисляем среднее значение цвета
            let avgPixel = Math.floor(pixelSum / 625);
            compressedImage.push(avgPixel);
        }
    }
    console.log(compressedImage);
});
