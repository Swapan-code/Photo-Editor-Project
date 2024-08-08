let choose_img_Btn = document.querySelector(".choose_img button");
let choose_Input = document.querySelector(".choose_img input");
let imgSrc = document.querySelector(".view_img img");
let filter_buttons = document.querySelectorAll(".icons_room button");
let slider = document.querySelector(".slider input");
let filter_name = document.querySelector(".filter_info .name");
let slider_value = document.querySelector(".filter_info .value");
let rotate_btns = document.querySelectorAll(".icons_room1 button");
let reset = document.querySelector(".reset");
let save = document.querySelector(".save");
let cropBtn = document.querySelector(".cropBtn");
let demo_Crop = document.querySelector("#demo_Crop");

let brightness = 100,
  contrast = 100,
  saturate = 100,
  invert = 0,
  blur = 0,
  rotate = 0,
  flip_x = 1,
  flip_y = 1;

let cropper;

choose_img_Btn.addEventListener("click", () => choose_Input.click());

choose_Input.addEventListener("change", () => {
  let file = choose_Input.files[0];
  if (!file) return;
  imgSrc.src = URL.createObjectURL(file);
  imgSrc.addEventListener("load", () => {
    document.querySelector(".container").classList.remove("disabled");
    resetAll();
  });
});

filter_buttons.forEach((element) => {
  element.addEventListener("click", () => {
    document.querySelector(".active").classList.remove("active");
    element.classList.add("active");
    filter_name.innerText = element.id;

    switch (element.id) {
      case "brightness":
        slider.max = "200";
        slider.value = brightness;
        break;
      case "contrast":
        slider.max = "200";
        slider.value = contrast;
        break;
      case "saturate":
        slider.max = "200";
        slider.value = saturate;
        break;
      case "invert":
        slider.max = "100";
        slider.value = invert;
        break;
      case "blur":
        slider.max = "100";
        slider.value = blur;
        break;
    }
    slider_value.innerText = `${slider.value}%`;
  });
});

slider.addEventListener("input", () => {
  slider_value.innerText = `${slider.value}%`;
  let activeFilter = document.querySelector(".icons_room .active").id;

  switch (activeFilter) {
    case "brightness":
      brightness = slider.value;
      break;
    case "contrast":
      contrast = slider.value;
      break;
    case "saturate":
      saturate = slider.value;
      break;
    case "invert":
      invert = slider.value;
      break;
    case "blur":
      blur = slider.value;
      break;
  }
  applyFilters();
});

rotate_btns.forEach((element) => {
  element.addEventListener("click", () => {
    switch (element.id) {
      case "rotate_left":
        rotate -= 90;
        break;
      case "rotate_right":
        rotate += 90;
        break;
      case "flip_x":
        flip_x = flip_x === 1 ? -1 : 1;
        break;
      case "flip_y":
        flip_y = flip_y === 1 ? -1 : 1;
        break;
      case "crop":
        cropimgFunction();
        break;
    }
    applyTransformations();
  });
});

cropBtn.addEventListener("click", () => {
  let canvas = cropper.getCroppedCanvas();
  imgSrc.src = canvas.toDataURL();
  cropper.destroy();
  cropBtn.style.display = "none";

  demo_Crop.style.display = "block";
  demo_Crop.src = imgSrc.src;
});

reset.addEventListener("click", () => {
  resetAll();
});

save.addEventListener("click", () => {
  let canvas = document.createElement("canvas");
  let ctx = canvas.getContext("2d");
  canvas.width = imgSrc.naturalWidth;
  canvas.height = imgSrc.naturalHeight;
  ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%) invert(${invert}%) blur(${blur}px)`;
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.scale(flip_x, flip_y);
  ctx.rotate((rotate * Math.PI) / 180);
  ctx.drawImage(
    imgSrc,
    -canvas.width / 2,
    -canvas.height / 2,
    canvas.width,
    canvas.height
  );
  const link = document.createElement("a");
  link.download = "image.jpg";
  link.href = canvas.toDataURL();
  link.click();
});

function applyFilters() {
  imgSrc.style.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%) invert(${invert}%) blur(${blur}px)`;
}

function applyTransformations() {
  imgSrc.style.transform = `rotate(${rotate}deg) scale(${flip_x}, ${flip_y})`;
}

function resetAll() {
  brightness = 100;
  contrast = 100;
  saturate = 100;
  invert = 0;
  blur = 0;
  rotate = 0;
  flip_x = 1;
  flip_y = 1;

  applyFilters();
  applyTransformations();

  if (cropper) {
    cropper.destroy();
    cropBtn.style.display = "none";
  }
  demo_Crop.style.display = "none";

  slider.max = "200";
  slider.value = brightness;
  slider_value.innerText = `${brightness}%`;
  filter_name.innerText = "brightness";
  document.querySelector(".active").classList.remove("active");
  filter_buttons[0].classList.add("active");
}

function cropimgFunction() {
  if (cropper) cropper.destroy();
  cropper = new Cropper(imgSrc, {
    aspectRatio: 1,
    viewMode: 2,
  });
  cropBtn.style.display = "block";
}
