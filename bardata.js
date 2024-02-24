import fs from "fs";
import { spawn } from "child_process";

const minicomProcess = spawn("minicom", ["-D", "/dev/ttyUSB0", "-b", "19200"]);

const pipeData = [];
let lastSTDOut = -1;

function parseBuffer(buff) {
    const rawStr = buff.toString().trim().split("").filter(e => e.charCodeAt(0) > 30).join("").split("[")[0];
    pipeData.push(rawStr);
}

minicomProcess.stdout.on("data", (data) => {
    parseBuffer(data);
    lastSTDOut = performance.now();
});

minicomProcess.stderr.on("data", (data) => {
    console.error(`stderr: ${data}`);
});

minicomProcess.on("close", (code) => {
    console.log(`child process exited with code ${code}`);
});

setInterval(() => {
    minicomProcess.stdin.write("BARDATA\n");
}, 5000);

setInterval(() => {
    if (performance.now() - lastSTDOut < 1024) {
        return false;
    }

    const barData = [];
    let inside = false;
    while (pipeData.length) {
        if (!inside) {
            const subData = pipeData.shift();
            if (subData === "OK") {
                inside = true;
            } else if (subData.startsWith("BAR ")) {
                barData.push(subData);
                inside = true;
            }

            continue;
        }

        if (inside) {
            barData.push(pipeData.shift());
            continue;
        }

        pipeData.shift();
    }

    if (barData.length > 0) {
        piper.pipe(barData);
    }
}, 250);

class PipeBarData {
    constructor() {
        this.initialized = false;
        this.keys = new Set();

        /**
         * @type {{timeStamp:Date,data:object}[]}
         */
        this.dataEntries = [];
    }

    /**
     * @param {String[]} data
     */
    pipe(data) {
        const dataEntry = {};
        while (data.length) {
            const rawEntry = data.shift().split(" ");
            const value = rawEntry.pop();
            const key = rawEntry.join(" ");

            if (!this.keys.has(key)) {
                this.keys.add(key);
            }

            dataEntry[key] = value;
        }

        this.dataEntries.push({
            timeStamp: new Date(Date.now()),
            data: dataEntry
        });
    }

    get raw() {
        const string = btoa(`${Array.from(this.keys).join(",")}:${this.keys.size},${this.dataEntries.length}:${this.dataEntries.map(entry => {
            let values = [];

            this.keys.forEach(key => {
                values.push(entry.data[key] ?? null);
            });

            console.log(values);

            return (entry.timeStamp.getTime() / 60000 | 0) + "," + values.join(",");
        }).join(",")}`);

        return new TextEncoder().encode(string);
    }

    /**
     * @param {Uint8Array} raw
     * @returns {PipeBarData}
     */
    static fromRaw(raw) {
        const string = new TextDecoder().decode(raw);
        const decoded = atob(string);
        const [rawKeys, sizes, entries] = decoded.split(":");
        
        const keys = rawKeys.split(",");
        const keySize = parseInt(sizes.split(",")[0]);
        const countOfEntries = parseInt(sizes.split(",")[1]);

        const dataEntries = [];
        const rawEntries = entries.split(",");

        for (let i = 0; i < countOfEntries; i++) {
            const time = new Date(parseInt(rawEntries.shift()) * 60000);
            const values = [];

            for (let j = 0; j < keySize; j++) {
                values.push(rawEntries.shift());
            }

            const data = {};

            for (let j = 0; j < keySize; j++) {
                data[keys[j]] = values[j];
            }

            dataEntries.push({
                timeStamp: time,
                data: data
            });
        }

        const piper = new PipeBarData();
        piper.keys = new Set(keys);
        piper.dataEntries = dataEntries;

        return piper;
    }
}

const piper = new PipeBarData();

setInterval(function writeData() {
    fs.writeFileSync("./pipeData.txt", piper.raw, "utf-8");
}, 15000);