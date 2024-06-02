const backgroundCanvas = document.getElementById("background");
const backgroundCtx = backgroundCanvas.getContext("2d");
const particleCanvas = document.getElementById("particle");
const particleCtx = particleCanvas.getContext("2d");

const maxWidth = 20;
const maxHeight = 20;
const acceleration = 0.003;
const maxHorizontalVelocity = 0.3;
const maxVerticalVelocity = -0.7;
const maxBlocksPerClick = 10;

const maxBackgroundWidth = 200;
const maxBackgroundHeight = 200;
const maxBackgroundHorizontalVelocity = 0.2;

function resizeCanvas() {
    backgroundCanvas.width = window.innerWidth;
    backgroundCanvas.height = window.innerHeight;
    particleCanvas.width = window.innerWidth;
    particleCanvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

let blocks = [];
let backgroundBlocks = [];

function cullBlocks() {
    blocks = blocks.filter(function (item) { return item.y < particleCanvas.height });
    backgroundBlocks = backgroundBlocks.filter(function (item) { return item.x >= -maxBackgroundWidth - 50 && item.x <= backgroundCanvas.width + 50 })
}

function drawBackgroundBlocks(timestamp) {
    backgroundCtx.clearRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);

    for (let i = 0; i < backgroundBlocks.length; i++) {
        let block = backgroundBlocks[i]

        if (block.timestamp === 0) {
            block.timestamp = timestamp;
        }

        block.x = block.x_start + block.uHor * (timestamp - block.timestamp);

        backgroundCtx.fillStyle = "#f0f";
        backgroundCtx.globalCompositeOperation = "destination-over";
        backgroundCtx.fillRect(block.x, block.y, block.w, block.h);
        backgroundCtx.globalCompositeOperation = "lighter";
        backgroundCtx.shadowBlur = block.w / 10;
        backgroundCtx.shadowColor = "#f0f";
        backgroundCtx.shadowOffsetX = 0;
        backgroundCtx.shadowOffsetY = 0;
        backgroundCtx.fillRect(block.x - backgroundCtx.shadowBlur, block.y - backgroundCtx.shadowBlur, block.w + 2 * backgroundCtx.shadowBlur, block.h + 2 * backgroundCtx.shadowBlur);
    }
}

// Make the blocks fall
function updatePhysics(block, timestamp) {
    if (block.timestamp === 0) {
        block.timestamp = timestamp;
    }

    time = timestamp - block.timestamp;

    block.x = block.x_start + block.uHor * time;
    block.y = block.y_start + block.uVer * time + acceleration * time * time * 0.5;
}

function draw(timestamp) {
    particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
    drawBackgroundBlocks(timestamp);
    for (let i = 0; i < blocks.length; i++) {
        let block = blocks[i];
        updatePhysics(block, timestamp);
        if (block.colour === 0) {
            particleCtx.fillStyle = `rgba(255, 0, 255, ${block.opacity})`;
        } else if (block.colour === 1) {
            particleCtx.fillStyle = `rgba(0, 0, 255, ${block.opacity})`;
        } else {
            particleCtx.fillStyle = `rgba(255, 0, 0, ${block.opacity})`;
        }
        particleCtx.fillRect(block.x, block.y, block.w, block.h);
    }
    requestAnimationFrame(draw);
}

requestAnimationFrame(draw);

function handleClick(event) {
    let numOfBlocks = maxBlocksPerClick * Math.random();
    let opacity = Math.random() + 0.3;

    for (let i = 0; i < numOfBlocks; i++) {
        blocks.push({
            x: event.clientX,
            y: event.clientY,
            x_start: event.clientX,
            y_start: event.clientY,
            w: maxWidth * Math.random() + 10,
            h: maxHeight * Math.random() + 10,
            opacity: opacity,
            uHor: 2 * maxHorizontalVelocity * Math.random() - maxHorizontalVelocity,
            uVer: 4 * maxVerticalVelocity * Math.random() - maxVerticalVelocity,
            timestamp: 0,
            colour: 0,
        });
    }
}

document.addEventListener('click', handleClick);

function spawnBackgroundBlock() {
    if (!document.hidden) {
        let uHor = 2 * maxBackgroundHorizontalVelocity * Math.random() - maxBackgroundHorizontalVelocity + 0.0005;
        if (uHor > 0) {
            x = -maxBackgroundWidth - 50;
        } else {
            x = particleCanvas.width + 50;
        }

        backgroundBlocks.push({
            x: x,
            y: particleCanvas.height * Math.random(),
            x_start: x,
            w: maxBackgroundWidth * Math.random() + 50,
            h: maxBackgroundHeight * Math.random(),
            uHor: uHor,
            timestamp: 0,
        })
    }
}

setInterval(spawnBackgroundBlock, 1000)
setInterval(cullBlocks, 200)