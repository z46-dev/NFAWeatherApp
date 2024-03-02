export default class Forecast {
    constructor() {
        this.forecasts = [];
        this.sunrises = [];
        this.sunsets = [];
        this.timestamps = []; // Array of timestamps

        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d");

        this.canvas.width = 512;
        this.canvas.height = 256 + 128;

        this.ctx.textBaseline = "middle";
        this.ctx.textAlign = "center";
        this.ctx.lineCap = this.ctx.lineJoin = "round";

        this.mouse = {
            x: 0,
            y: 0
        };

        this.canvas.addEventListener("mousemove", event => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = (event.clientX - rect.x) / rect.width * this.canvas.width;
            this.mouse.y = (event.clientY - rect.y) / rect.height * this.canvas.height;
        });
    }

    draw() {
        requestAnimationFrame(this.draw.bind(this));
        const canvas = this.canvas;
        const ctx = this.ctx;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Current value
        const currentForecast = this.forecasts[this.forecasts.length - 1];
        const currentSunrise = this.sunrises[this.sunrises.length - 1];
        const currentSunset = this.sunsets[this.sunsets.length - 1];

        if (currentForecast === undefined) {
            return;
        }

        ctx.fillStyle = "#CC5555";
        ctx.fillRect(0, 0, 512, 256 + 128);

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 32px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Forecast & Time Cycle", 256, 32);

        ctx.font = "bold 24px sans-serif";
        ctx.textAlign = "left";
        ctx.fillStyle = "#FFFFFF";
        
        let y = 64;
        const lines = this.getWrappedTextLines(currentForecast, 512 - 24);
        for (let i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i], 24, y);
            y += 32;
        }

        ctx.fillText("Sunrise: " + currentSunrise, 24, (y += 32, y - 32));
        ctx.fillText("Sunset: " + currentSunset, 24, (y += 32, y - 32));
    }

    getWrappedTextLines(text, maxWidth) {
        const lines = [];
        const words = text.split(" ");
        let line = "";

        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + " ";
            const metrics = this.ctx.measureText(testLine);
            const testWidth = metrics.width;

            if (testWidth > maxWidth && i > 0) {
                lines.push(line);
                line = words[i] + " ";
            } else {
                line = testLine;
            }
        }

        lines.push(line);

        return lines;
    }

    place(widthSize) {
        this.canvas.style.width = widthSize + "vmin";
        this.canvas.style.height = widthSize * (this.canvas.height / this.canvas.width) + "vmin";

        this.draw();

        return this.canvas;
    }
}