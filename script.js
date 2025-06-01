const choose_img_Btn = document.querySelector(".choose_img button");
const choose_Input = document.querySelector(".choose_img input");
const imgSrc = document.querySelector(".view_img img");
const filter_buttons = document.querySelectorAll(".filter-grid button");
const slider = document.querySelector(".slider input");
const filter_name = document.querySelector(".filter_info .name");
const slider_value = document.querySelector(".filter_info .value");
const rotate_btns = document.querySelectorAll(".transform-grid button");
const reset = document.querySelector(".reset");
const save = document.querySelector(".save");
const cropBtn = document.querySelector(".cropBtn");
const demo_Crop = document.querySelector("#demo_Crop");
const themeToggle = document.querySelector(".theme-toggle");

let filters = {
    brightness: 100,
    contrast: 100,
    saturate: 100,
    invert: 0,
    blur: 0,
    grayscale: 0,
    sepia: 0,
    hue: 0,
    noise: 0,
    pixelate: 0,
    vignette: 0
};

let transform = {
    rotate: 0,
    flip_x: 1,
    flip_y: 1
};

let cropper;

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light-theme");
    themeToggle.querySelector("i").classList.toggle("fa-sun");
    themeToggle.querySelector("i").classList.toggle("fa-moon");
});

choose_img_Btn.addEventListener("click", () => choose_Input.click());

choose_Input.addEventListener("change", () => {
    const file = choose_Input.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        imgSrc.src = e.target.result;
        imgSrc.addEventListener("load", () => {
            document.querySelector(".container").classList.remove("disabled");
            resetAll();
            imgSrc.style.animation = "fadeIn 0.5s ease-out";
        });
    };
    reader.readAsDataURL(file);
});

filter_buttons.forEach((element) => {
    element.addEventListener("click", () => {
        document.querySelector(".filter-grid .active")?.classList.remove("active");
        element.classList.add("active");
        filter_name.innerText = element.id;

        switch (element.id) {
            case "brightness":
            case "contrast":
            case "saturate":
                slider.max = "200";
                slider.value = filters[element.id];
                break;
            case "invert":
            case "blur":
            case "grayscale":
            case "sepia":
            case "noise":
            case "pixelate":
            case "vignette":
                slider.max = "100";
                slider.value = filters[element.id];
                break;
            case "hue":
                slider.max = "360";
                slider.value = filters[element.id];
                break;
        }
        slider_value.innerText = `${slider.value}%`;
    });
});

slider.addEventListener("input", () => {
    slider_value.innerText = `${slider.value}%`;
    const activeFilter = document.querySelector(".filter-grid .active").id;
    filters[activeFilter] = slider.value;
    applyFilters();
});

rotate_btns.forEach((element) => {
    element.addEventListener("click", () => {
        switch (element.id) {
            case "rotate_left":
                transform.rotate -= 90;
                break;
            case "rotate_right":
                transform.rotate += 90;
                break;
            case "flip_x":
                transform.flip_x = transform.flip_x === 1 ? -1 : 1;
                break;
            case "flip_y":
                transform.flip_y = transform.flip_y === 1 ? -1 : 1;
                break;
            case "crop":
                cropimgFunction();
                break;
        }
        applyTransformations();
    });
});

cropBtn.addEventListener("click", () => {
    const canvas = cropper.getCroppedCanvas();
    imgSrc.src = canvas.toDataURL();
    cropper.destroy();
    cropBtn.style.display = "none";
    demo_Crop.style.display = "block";
    demo_Crop.src = imgSrc.src;
});

reset.addEventListener("click", () => {
    resetAll();
    imgSrc.style.animation = "fadeIn 0.5s ease-out";
});

save.addEventListener("click", () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = imgSrc.naturalWidth;
    canvas.height = imgSrc.naturalHeight;

    ctx.filter = `brightness(${filters.brightness}%) 
                 contrast(${filters.contrast}%) 
                 saturate(${filters.saturate}%) 
                 invert(${filters.invert}%) 
                 blur(${filters.blur}px)
                 grayscale(${filters.grayscale}%)
                 sepia(${filters.sepia}%)
                 hue-rotate(${filters.hue}deg)`;

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(transform.flip_x, transform.flip_y);
    ctx.rotate((transform.rotate * Math.PI) / 180);
    ctx.drawImage(
        imgSrc,
        -canvas.width / 2,
        -canvas.height / 2,
        canvas.width,
        canvas.height
    );

    if (filters.noise > 0) {
        applyNoise(ctx, canvas.width, canvas.height, filters.noise);
    }
    if (filters.pixelate > 0) {
        applyPixelate(ctx, canvas.width, canvas.height, filters.pixelate);
    }
    if (filters.vignette > 0) {
        applyVignette(ctx, canvas.width, canvas.height, filters.vignette);
    }

    const link = document.createElement("a");
    link.download = "edited-image.jpg";
    link.href = canvas.toDataURL("image/jpeg", 0.9);
    link.click();
});

function applyFilters() {
    imgSrc.style.filter = `brightness(${filters.brightness}%) 
                          contrast(${filters.contrast}%) 
                          saturate(${filters.saturate}%) 
                          invert(${filters.invert}%) 
                          blur(${filters.blur}px)
                          grayscale(${filters.grayscale}%)
                          sepia(${filters.sepia}%)
                          hue-rotate(${filters.hue}deg)`;
}

function applyTransformations() {
    imgSrc.style.transform = `rotate(${transform.rotate}deg) scale(${transform.flip_x}, ${transform.flip_y})`;
}

function resetAll() {
    Object.keys(filters).forEach(key => {
        filters[key] = key === "brightness" || key === "contrast" || key === "saturate" ? 100 : 0;
    });

    transform.rotate = 0;
    transform.flip_x = 1;
    transform.flip_y = 1;

    applyFilters();
    applyTransformations();

    if (cropper) {
        cropper.destroy();
        cropBtn.style.display = "none";
    }
    demo_Crop.style.display = "none";

    slider.max = "200";
    slider.value = filters.brightness;
    slider_value.innerText = `${filters.brightness}%`;
    filter_name.innerText = "brightness";

    document.querySelector(".filter-grid .active")?.classList.remove("active");
    filter_buttons[0].classList.add("active");
}

function cropimgFunction() {
    if (cropper) cropper.destroy();
    cropper = new Cropper(imgSrc, {
        aspectRatio: NaN,
        viewMode: 2,
        dragMode: "move",
        autoCropArea: 1,
        restore: false,
        guides: true,
        center: true,
        highlight: false,
        cropBoxMovable: true,
        cropBoxResizable: true,
        toggleDragModeOnDblclick: false,
    });
    cropBtn.style.display = "block";
}

function applyNoise(ctx, width, height, intensity) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * intensity;
        data[i] += noise;
        data[i + 1] += noise;
        data[i + 2] += noise;
    }
    ctx.putImageData(imageData, 0, 0);
}

function applyPixelate(ctx, width, height, intensity) {
    const size = Math.max(1, Math.floor(intensity / 10));
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");
    tempCanvas.width = width;
    tempCanvas.height = height;
    tempCtx.drawImage(ctx.canvas, 0, 0);
    
    ctx.clearRect(0, 0, width, height);
    for (let y = 0; y < height; y += size) {
        for (let x = 0; x < width; x += size) {
            const pixel = tempCtx.getImageData(x, y, 1, 1).data;
            ctx.fillStyle = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
            ctx.fillRect(x, y, size, size);
        }
    }
}

function applyVignette(ctx, width, height, intensity) {
    const gradient = ctx.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, Math.max(width, height) / 2
    );
    gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
    gradient.addColorStop(1, `rgba(0, 0, 0, ${intensity / 100})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
}

document.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
            case "z":
                e.preventDefault();
                resetAll();
                break;
            case "s":
                e.preventDefault();
                save.click();
                break;
        }
    }
});
