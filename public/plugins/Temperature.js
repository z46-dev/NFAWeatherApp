export default class Temperature {
    static interpretTemperature(value) {
        if (value === undefined) {
            return "N/A";
        }

        if (value > 100) {
            return "Unbearably Hot";
        }

        if (value > 90) {
            return "Very Hot";
        }

        if (value > 80) {
            return "Hot";
        }

        if (value > 70) {
            return "Warm";
        }

        if (value > 45) {
            return "Mild";
        }

        if (value > 32) {
            return "Cool";
        }

        if (value > 16) {
            return "Cold";
        }

        return "Freezing";
    }

    constructor(name) {
        this.name = name;
        this.temperatures = []; // Array of temperature values
        this.humidities = []; // Array of humidity values
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
        const currentTemperature = this.temperatures[this.temperatures.length - 1];
        const currentHumidity = this.humidities[this.humidities.length - 1];

        if (currentHumidity === undefined) {
            return;
        }

        ctx.fillStyle = "#CC5555";
        ctx.fillRect(0, 0, 512, 256);

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 32px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(this.name, 256, 32);

        ctx.font = "bold 24px sans-serif";
        ctx.textAlign = "left";
        ctx.fillText("Temperature: " + currentTemperature + "\u00B0 F", 24, 64);
        ctx.fillText("Humidity: " + currentHumidity + "%", 24, 96);

        ctx.fillStyle = "#CCCC55";
        ctx.fillRect(8, 64 - 12, 12, 24);
        ctx.fillStyle = "#55CCCC";
        ctx.fillRect(8, 96 - 12, 12, 24);

        ctx.font = "bold 18px sans-serif";
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText("HI: " + Math.max(...this.temperatures) + "\u00B0 F, " + Math.max(...this.humidities) + "%", 24, 128);
        ctx.fillText("LO: " + Math.min(...this.temperatures) + "\u00B0 F, " + Math.min(...this.humidities) + "%", 24, 160);

        ctx.font = "bold 32px sans-serif";
        ctx.textAlign = "right";
        ctx.fillText("It's " + Temperature.interpretTemperature(currentTemperature).toLocaleLowerCase() + " " + this.name.toLocaleLowerCase(), 512 - 32, 256 - 64);

        // History graph
        const entries = this.temperatures.length;
        const spacing = 512 / entries;
        const temperatureValues = [];
        const humidityValues = [];

        for (let i = 0; i < entries; i++) {
            {
                const value = this.temperatures[i];
                temperatureValues.push(value);
            } {
                const value = this.humidities[i];
                humidityValues.push(value);
            }
        }

        ctx.fillStyle = "#C92A39";
        ctx.fillRect(0, 256, 512, 128);

        ctx.beginPath();
        ctx.moveTo(0, 256 + 128 - (this.temperatures[0] / 100) * 128);

        for (let i = 1; i < entries; i++) {
            ctx.lineTo(i * spacing, 256 + 128 - (this.temperatures[i] / 100) * 128);
        }

        ctx.strokeStyle = "#CCCC55";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, 256 + 128 - (this.humidities[0] / 100) * 128);

        for (let i = 1; i < entries; i++) {
            ctx.lineTo(i * spacing, 256 + 128 - (this.humidities[i] / 100) * 128);
        }

        ctx.strokeStyle = "#55CCCC";
        ctx.lineWidth = 2;
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
                }) + " - " + this.temperatures[selected] + "\u00B0 F " + this.humidities[selected] + "%", 256, 256 - 8);

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