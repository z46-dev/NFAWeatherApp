export default class Rain {
    constructor() {
        this.rainRates = []; // Array of rain rate values
        this.dayRains = []; // Array of day rain values
        this.monthRains = []; // Array of month rain values
        this.yearRains = []; // Array of year rain values
        this.stormRains = []; // Array of storm rain values
        this.stormStartDates = []; // Array of storm start dates (mm/dd/yyyy)
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

        // Current Value
        const index = this.rainRates.length - 1;
        const currentRainRate = this.rainRates[index];
        const currentDayRain = this.dayRains[index];
        const currentMonthRain = this.monthRains[index];
        const currentYearRain = this.yearRains[index];
        const currentStormRain = this.stormRains[index];
        const currentStormStartDate = this.stormStartDates[index];

        ctx.fillStyle = "#CC5555";
        ctx.fillRect(0, 0, 512, 256);

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 32px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Rain & Storm History", 256, 32);

        ctx.font = "bold 24px sans-serif";
        ctx.textAlign = "left";
        ctx.fillText("Rain Rate: " + currentRainRate + " in", 24, 64);
        ctx.fillText("Day's Rain: " + currentDayRain + " in", 24, 96);
        ctx.fillText("Month's Rain: " + currentMonthRain + " in", 24, 128);
        ctx.fillText("Year's Rain: " + currentYearRain + " in", 24, 160);
        if (currentStormRain > 0) {
            ctx.fillText("Storm's Rain: " + currentStormRain + " in", 24, 192);
            ctx.fillText("Storm started on " + currentStormStartDate, 24, 224);
        } else {
            ctx.fillText("No Storm", 24, 192);
        }

        ctx.fillStyle = "#CCCC55";
        ctx.fillRect(8, 64 - 12, 12, 24);
        ctx.fillStyle = "#55CCCC";
        ctx.fillRect(8, 96 - 12, 12, 24);

        // History graph
        const entries = this.rainRates.length;
        const spacing = 512 / entries;
        
        let min = Math.min(...this.rainRates, ...this.dayRains),
            max = Math.max(...this.rainRates, ...this.dayRains);

        ctx.fillStyle = "#C92A39";
        ctx.fillRect(0, 256, 512, 128);

        ctx.beginPath();
        ctx.moveTo(0, 256 + 128 - ((this.rainRates[0] - min) / (max - min)) * 128);

        for (let i = 1; i < entries; i++) {
            ctx.lineTo(i * spacing, 256 + 128 - ((this.rainRates[i] - min) / (max - min)) * 128);
        }

        ctx.strokeStyle = "#CCCC55";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, 256 + 128 - ((this.dayRains[0] - min) / (max - min)) * 128);

        for (let i = 1; i < entries; i++) {
            ctx.lineTo(i * spacing, 256 + 128 - ((this.dayRains[i] - min) / (max - min)) * 128);
        }

        ctx.strokeStyle = "#55CCCC";
        ctx.stroke();

        if (this.mouse.y > 256) {
            const selected = Math.round(this.mouse.x / spacing);

            if (selected >= 0 && selected < entries) {
                ctx.fillStyle = "#FFFFFF";
                ctx.font = "bold 16px sans-serif";
                ctx.textAlign = "center";
                ctx.fillText(new Date(this.timestamps[selected]).toLocaleString("en-US", {
                    dateStyle: "short",
                    timeStyle: "short"
                }) + " - Rain Rate: " + this.rainRates[selected] + " in Day's Rain: " + this.dayRains[selected] + " in", 256, 256 - 8);

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