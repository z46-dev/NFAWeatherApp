import fs from "fs";
import { SerialPort } from "serialport";
import parse from "./lib/parser.js";
import LZ77 from "./lib/LZ77.js";

let promiseListener = undefined;

const port = new SerialPort({
    path: "/dev/ttyUSB0",
    baudRate: 19200
});

port.on("open", function onOpen() {
    console.log("Port is open");

    setTimeout(function onTimeout() {
        readData();
    }, 1000);
});

port.on("data", function onData(data) {
    if (data.length >= 99 && promiseListener !== undefined) {
        promiseListener(data);
        promiseListener = undefined;
    }
});

function loop(timeout = 1000) {
    return new Promise((resolve, reject) => {
        if (promiseListener !== undefined) {
            reject(new Error("Another LOOP is already running"));
            return;
        }

        setTimeout(reject, timeout, new Error("LOOP Timeout"));

        port.write("LOOP 1\n", function onWrite(err) {
            if (err) {
                return reject(err);
            }

            promiseListener = resolve;
        });
    });
}

const list = fs.existsSync("data.txt") ? JSON.parse(LZ77.decompress(fs.readFileSync("data.txt", "utf-8"))) : [];

async function readData() {
    let loopData;

    try {
        loopData = await loop();
    } catch (err) {
        console.error("LOOP Error:", err);
    }

    if (loopData !== undefined) {
        const data = parse(loopData);

        if (data.crc.valid && data.parsed.get("LOO") === "Valid") {
            console.log("[" + (performance.now() / 1000 | 0) + "]", "Received valid data");
            list.push({
                timestamp: Date.now(),
                data: Object.fromEntries(data.parsed)
            });
        } else {
            console.log("[" + (performance.now() / 1000 | 0) + "]", "Received invalid data");
        }
    }

    saveData();

    setTimeout(readData, 1000 * 60 * 5);
}

function saveData() {
    if (list.length === 0) {
        return;
    }

    while (list.length > 0 && list[0].timestamp < Date.now() - 1000 * 60 * 60 * 24 * 14) {
        list.shift();
    }

    try {
        const data = JSON.stringify(list);
        const compressed = LZ77.compress(data);

        console.log(data.length, compressed.length, (1 - compressed.length / data.length) * 100 + "% saved");

        fs.writeFileSync("data.txt", compressed, "utf-8");
    } catch (err) {
        console.error("Error saving data:", err);
    }
}