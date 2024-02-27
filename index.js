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
        port.write("LOOP 1\n", function onWrite(err) {
            if (err) {
                console.error("Error:", err);
            }
        });
    }, 1000);
});

port.on("data", function onData(data) {
    console.log(data.length, "bytes of data received");
    
    if (loopListener !== undefined) {
        loopListener();
        loopListener = undefined;
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

loop().then(data => {
    console.log("LOOP 1 is done", data);
    console.log(parse(data));
}).catch((err) => {
    console.error("Error:", err);
});