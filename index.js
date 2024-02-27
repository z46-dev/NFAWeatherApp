import { SerialPort } from "serialport";
import { parse } from "./lib/parser.js";

let loopListener = undefined,
    barDataListener = undefined;

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
    console.log(data.length, "bytes of data received");

    if (data.length > 95) {
        if (loopListener !== undefined) {
            loopListener(data);
            loopListener = undefined;
        }
    } else if (barDataListener !== undefined) {
        barDataListener(data);
        barDataListener = undefined;
    }
});

function loop(timeout = 1000) {
    return new Promise((resolve, reject) => {
        if (loopListener !== undefined) {
            reject(new Error("Another LOOP is already running"));
            return;
        }

        setTimeout(reject, timeout, new Error("LOOP Timeout"));

        port.write("LOOP 1\n", function onWrite(err) {
            if (err) {
                return reject(err);
            }

            loopListener = resolve;
        });
    });
}

function getBarData(timeout = 1000) {
    return new Promise((resolve, reject) => {
        if (barDataListener !== undefined) {
            reject(new Error("Another BARDATA is already running"));
            return;
        }

        setTimeout(reject, timeout, new Error("BARDATA Timeout"));

        port.write("BARDATA\n", function onWrite(err) {
            if (err) {
                return reject(err);
            }

            barDataListener = resolve;
        });
    });
}

async function readData() {
    let loopData,
        barData;

    try {
        loopData = await loop();
    } catch (err) {
        console.error("LOOP Error:", err);
    }

    try {
        barData = await getBarData();
    } catch (err) {
        console.error("BARDATA Error:", err);
    }

    if (loopData !== undefined) {
        console.log(parse(loopData));
    }

    if (barData !== undefined) {
        console.log(barData);
    }

    setTimeout(readData, 5000);
}