import { SerialPort } from "serialport";
import { parse } from "./lib/parser.js";

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
    console.log(data.toString());

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

async function readData() {
    let loopData;

    try {
        loopData = await loop();
    } catch (err) {
        console.error("LOOP Error:", err);
    }

    if (loopData !== undefined) {
        console.log(parse(loopData));
    }

    setTimeout(readData, 5000);
}