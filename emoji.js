const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const hCanvas = document.getElementById('hcanvas');
const hctx = hCanvas.getContext('2d');
const emojiName = document.getElementById('name');
const dlButton = document.getElementById('download');

const validName = /^[\w\d_]{2,}$/;  // alphanumeric or '_', at least 2 characters long

const reader = new FileReader();
const img = new Image();
var zoom = 1;   // scale probably would have been a better name
var xpos = 0, ypos = 0; // old mouse position to track mouse movement
var picx = 0, picy = 0; // image top-left offset
var imgw = 0, imgh = 0; // image dimensions
var fitImgw = 0, fitImgh = 0;   // image dimensions after fitting to canvas

function uploadImage(e) {
    reader.onload = () => {
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            var ratio = img.width / img.height;
            zoom = 1;   // reset zoom

            // resizes image to fit the canvas
            // then centers it
            if (ratio > 1) {
                picx = 0;
                picy = (canvas.height - canvas.width / ratio) / 2;
                imgw = canvas.width;
                imgh = canvas.width / ratio;
            } else {
                picx = (canvas.width - canvas.height * ratio) / 2;
                picy = 0;
                imgw = canvas.height * ratio;
                imgh = canvas.height;
            }

            fitImgw = imgw;
            fitImgh = imgh;
            ctx.drawImage(img, picx, picy, imgw, imgh);

            //drawViewer();
        };
        img.src = reader.result;
    };
    reader.readAsDataURL(e.target.files[0]);
    emojiName.value = e.target.files[0].name.split('.').slice(0,-1).join('.');    // assumes there is a file extension and gets rid of it
    checkName();
}

/*
function drawViewer() {
    ctx.strokeStyle = 'gray';
    ctx.strokeRect(100,100,300,300);
}*/

function onMouseDown(e) {
    e.preventDefault();
    xpos = e.offsetX;
    ypos = e.offsetY;
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
}

function onMouseMove(e) {
    e.preventDefault();

    //move picture around
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    picx = picx + e.offsetX - xpos;
    picy = picy + e.offsetY - ypos;
    xpos = e.offsetX;
    ypos = e.offsetY;
    ctx.drawImage(img, picx, picy, imgw, imgh);
    //drawViewer();
}

function onMouseUp(e) {
    e.preventDefault();
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
}

function reset() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var ratio = img.width / img.height;
    zoom = 1;

    // resizes image to fit the canvas
    // then centers it
    if (ratio > 1) {
        picx = 0;
        picy = (canvas.height - canvas.width / ratio) / 2;
        imgw = canvas.width;
        imgh = canvas.width / ratio;
    } else {
        picx = (canvas.width - canvas.height * ratio) / 2;
        picy = 0;
        imgw = canvas.height * ratio;
        imgh = canvas.height;
    }
    ctx.drawImage(img, picx, picy, imgw, imgh);
    //drawViewer();
}

function onWheel(e) {
    e.preventDefault();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var lastZoom = zoom;    // need to keep track of previous scale amount for scaling from cursor
    zoom += e.deltaY * -0.001;
    zoom = Math.max(0.001,zoom);
    imgw = fitImgw * zoom;
    imgh = fitImgh * zoom;
    picx = e.offsetX - (e.offsetX-picx) * zoom/lastZoom;
    picy = e.offsetY - (e.offsetY-picy) * zoom/lastZoom;

    ctx.drawImage(img, picx, picy, imgw, imgh);
}

function checkName() {
    if(emojiName.value.match(validName)) {
        dlButton.disabled = false;
    } else {
        dlButton.disabled = true;
    }
}

function onEnter(e) {
    if(e.keyCode === 13) {
        e.preventDefault();
        dlButton.click();
    }
}

function getPNGSize(cnv) {
    // google said this was an accurate way to get the size of a png
    var head = 'data:image/png;base64,';
    return (cnv.toDataURL().length - head.length)*3/4;
}

function download() {
    hctx.clearRect(0,0,hCanvas.width,hCanvas.height);
    hctx.drawImage(canvas,0,0,hCanvas.width,hCanvas.height);

    let smallEnough = getPNGSize(hCanvas)/1024 < 256;

    // if the file is too large, reduce both dimensions by 10 pixels until it is small enough
    // not the prettiest algorithm, but i don't think the situation really calls for a fancier one
    while(!smallEnough) {
        console.log(getPNGSize(hCanvas)/1024);
        hCanvas.width -= 10;
        hCanvas.height -= 10;
        hctx.clearRect(0,0,hCanvas.width,hCanvas.height);
        hctx.drawImage(canvas,0,0,hCanvas.width,hCanvas.height);
        smallEnough = getPNGSize(hCanvas)/1024 < 256;
    }

    const link = document.createElement('a');
    link.download = emojiName.value;
    link.href = hCanvas.toDataURL();
    link.click();
}

const imageLoader = document.getElementById('uploader');
imageLoader.addEventListener('change', uploadImage);

canvas.addEventListener('mousedown', onMouseDown);
canvas.addEventListener('wheel', onWheel);

emojiName.addEventListener('input', checkName);
emojiName.addEventListener('keyup', onEnter);
document.getElementById("reset").addEventListener('click', reset);
dlButton.addEventListener('click', download);