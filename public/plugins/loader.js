const canvas = document.createElement("canvas");
canvas.id = "loadingCanvas";

const ctx = canvas.getContext("2d", {
    desynchronized: true
});

canvas.width = 512;
canvas.height = 512;

let enabled = false;

const dots = [];

function resetDots() {
    dots.length = 0;
    for (let i = 0; i < 50; i ++) {
        dots.push({
            x: Math.random() * 512,
            y: Math.random() * 512
        });
    }
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function draw() {
    if (enabled) {
        requestAnimationFrame(draw);
    }

    ctx.clearRect(0, 0, 512, 512);
    ctx.fillStyle = "#40434E";
    ctx.globalAlpha = .4;
    ctx.beginPath();
    ctx.arc(256, 256, 252, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.fillStyle = "#AA3333";

    const baseAngle = performance.now() / 800 + Math.PI * ((performance.now() | 0) % 3000 > 1500);
    const baseRadius = 128 + 96 - 16;
    const a = performance.now() / 667;
    const b = performance.now() / 333;
    for (let i = 0; i < dots.length; i ++) {
        const angle = baseAngle + i / dots.length * Math.PI * 2;
        const gx = 256 + Math.cos(angle) * (baseRadius + 16 * (Math.sin(a + i) * 2));
        const gy = 256 + Math.sin(angle) * (baseRadius + 16 * (Math.sin(a + i) * 2));

        dots[i].x = lerp(dots[i].x, gx, .1);
        dots[i].y = lerp(dots[i].y, gy, .1);

        ctx.beginPath();
        ctx.arc(dots[i].x, dots[i].y, 8 + Math.sin(b + i) * 4, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.font = "bold 64px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#FFFFFF";
    ctx.strokeStyle = "#C8C8C8";
    ctx.lineJoin = ctx.lineCap = "round";
    ctx.lineWidth = 4;
    const dotdotdot = ".".repeat(1 + ((performance.now() / 1000 | 0) % 3));
    ctx.strokeText("Loading Data" + dotdotdot, 256, 256);
    ctx.fillText("Loading Data" + dotdotdot, 256, 256);
}

export function on() {
    enabled = true;
    canvas.style.display = "block";
    resetDots();
    draw();
}

export function off() {
    enabled = false;
    canvas.style.display = "none";
}

document.body.appendChild(canvas);