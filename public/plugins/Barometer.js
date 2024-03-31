export default class Barometer {
    static trendString(trendValue) {
        switch (trendValue) {
            case -3:
                return "Falling rapidly";
            case -2:
                return "Falling";
            case -1:
                return "Falling slowly";
            case 0:
                return "Steady";
            case 1:
                return "Rising slowly";
            case 2:
                return "Rising";
            case 3:
                return "Rising rapidly";
        }
    }

    constructor() {
        this.barometerValues = []; // Array of barometer values
        this.trends = []; // -2, -1, 0, 1, 2
        this.timestamps = []; // Array of timestamps

        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d");

        this.canvas.width = 512;
        this.canvas.height = 256 + 128;

        this.dots = [];

        for (let i = 0; i < this.canvas.width; i += 8) {
            this.dots.push({
                x: i,
                y: Math.random() * 256,
                speed: Math.random() * 2 + 2,
                idleVelocityLength: 0,
                idleVelocityAngle: 0,
                idleVelocityDrag: Math.random() * .2 + .8
            });
        }

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

        // Current value + Animation
        const currentValue = this.barometerValues[this.barometerValues.length - 1];
        const currentTrend = this.trends[this.trends.length - 1];

        if (currentTrend === undefined) {
            return;
        }

        ctx.fillStyle = "#CC5555";
        ctx.fillRect(0, 0, 512, 256);

        ctx.fillStyle = "#AA2222";
        ctx.globalAlpha = .5;

        for (let i = 0; i < this.dots.length; i++) {
            ctx.beginPath();
            ctx.arc(this.dots[i].x, this.dots[i].y, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.closePath();

            if (currentTrend === 0) {
                // this.dots[i].x += this.dots[i].speed * (Math.sin(performance.now() / 3000) + .5);
                // this.dots[i].y = i / this.dots.length * 256;

                if (this.dots[i].idleVelocityLength < .01) {
                    this.dots[i].idleVelocityLength = 3 + Math.random() * 3;
                    this.dots[i].idleVelocityAngle = Math.PI * 2 * Math.random();
                    this.dots[i].idleVelocityDrag = Math.random() * .2 + .8;
                }

                this.dots[i].x += this.dots[i].idleVelocityLength * Math.cos(this.dots[i].idleVelocityAngle);
                this.dots[i].y += this.dots[i].idleVelocityLength * Math.sin(this.dots[i].idleVelocityAngle);
                this.dots[i].idleVelocityLength *= this.dots[i].idleVelocityDrag;
            } else {
                this.dots[i].x = i / this.dots.length * canvas.width;
                this.dots[i].y -= this.dots[i].speed * currentTrend;
            }

            if (this.dots[i].x > canvas.width) {
                this.dots[i].x = 0;
            }

            if (this.dots[i].x < 0) {
                this.dots[i].x = canvas.width;
            }

            if (this.dots[i].y < 0) {
                this.dots[i].y = 256;
            }

            if (this.dots[i].y > 256) {
                this.dots[i].y = 0;
            }
        }

        ctx.globalAlpha = 1;
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 32px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Barometric Pressure", 256, 32);
        ctx.font = "bold 24px sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(currentValue + " inches Hg", 8, 64);
        ctx.fillText("Trend: " + Barometer.trendString(currentTrend), 8, 96);
        ctx.font = "bold 18px sans-serif";
        ctx.fillText("HI: " + Math.max(...this.barometerValues) + " inches Hg", 8, 128);
        ctx.fillText("LO: " + Math.min(...this.barometerValues) + " inches Hg", 8, 160);
        ctx.textAlign = "center";

        // History graph
        const entries = this.barometerValues.length;
        const spacing = 512 / entries;
        const values = [];

        let min = 9999,
            max = -9999;

        for (let i = 0; i < entries; i++) {
            const value = (this.barometerValues[i] - 20) / 12.5;
            values.push(value);

            if (value < min) {
                min = value;
            }

            if (value > max) {
                max = value;
            }
        }

        ctx.fillStyle = "#C92A39";
        ctx.fillRect(0, 256, 512, 128);

        ctx.beginPath();
        ctx.moveTo(0, 256 + 128 - ((values[0] - min) / (max - min)) * 128);

        for (let i = 1; i < entries; i++) {
            ctx.lineTo(i * spacing, 256 + 128 - ((values[i] - min) / (max - min)) * 128);
        }

        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 2;
        ctx.stroke();

        if (this.mouse.y > 256) {
            const selected = Math.round(this.mouse.x / spacing);

            if (selected >= 0 && selected < entries) {
                ctx.fillStyle = "#FFFFFF";
                ctx.font = "bold 16px sans-serif";
                ctx.fillText(new Date(this.timestamps[selected]).toLocaleString("en-US", {
                    dateStyle: "short",
                    timeStyle: "short"
                }) + " - " + this.barometerValues[selected] + " inches Hg", 256, 256 - 8);

                ctx.strokeStyle = "#FFFFFF";
                ctx.beginPath();
                ctx.moveTo(selected * spacing, 256);
                ctx.lineTo(selected * spacing, 256 + 128);
                ctx.stroke();
            }
        }
    }

    place(widthSize) {
        this.canvas.style.width = widthSize + "vmin";
        this.canvas.style.height = widthSize * (this.canvas.height / this.canvas.width) + "vmin";

        this.draw();

        return this.canvas;
    }
}