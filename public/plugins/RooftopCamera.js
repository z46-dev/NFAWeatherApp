export default class RooftopCamera {
    constructor(name, src) {
        this.name = name;
        this.image = new Image();
        this.image.src = src;

        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d");

        this.canvas.width = 512;
        this.canvas.height = 256 + 128;

        this.ctx.textBaseline = "middle";
        this.ctx.textAlign = "center";
        this.ctx.lineCap = this.ctx.lineJoin = "round";

        document.getElementById("displayWindow").src = src;
        this.canvas.addEventListener("mousedown", () => {
            document.getElementById("displayWindow").style.display = "block";
        });
    }

    draw() {
        requestAnimationFrame(this.draw.bind(this));
        const canvas = this.canvas;
        const ctx = this.ctx;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw the image as width important
        const heightRatio = this.image.height / this.image.width;
        ctx.drawImage(this.image, 0, 0, canvas.width, canvas.width * heightRatio);

        ctx.fillStyle = "#C92A39";
        ctx.fillRect(0, 256, 512, 128);

        ctx.font = "bold 48px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Click to Enlarge!", 256, 320);
    }

    place(widthSize) {
        this.canvas.style.width = widthSize + "vmin";
        this.canvas.style.height = widthSize * (this.canvas.height / this.canvas.width) + "vmin";

        this.draw();

        return this.canvas;
    }
}