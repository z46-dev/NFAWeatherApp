import fs from "fs";
import { URL } from "url";
import { SerialPort } from "serialport";

import Server from "./lib/Server.js";
import redirectServer from "./lib/redirectServer.js";
import parse from "./lib/parser.js";
import DataManager from "./lib/DataManager.js";

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
            DataManager.saveData(Date.now(), Object.fromEntries(data.parsed));
        } else {
            console.log("[" + (performance.now() / 1000 | 0) + "]", "Received invalid data");
        }
    }

    setTimeout(readData, 1000 * 60 * 5);
}

const sslCertificate = {
    key: fs.readFileSync("/etc/letsencrypt/live/wx.nfaschool.org/privkey.pem"),
    cert: fs.readFileSync("/etc/letsencrypt/live/wx.nfaschool.org/cert.pem"),
    ca: fs.readFileSync("/etc/letsencrypt/live/wx.nfaschool.org/chain.pem")
};

const server = new Server(443, sslCertificate);

server.publicize("./public");
server.get("/api/data.json", (request, response) => {
    try {
        const url = new URL(request.url, "https://wx.nfaschool.org");
        const maxAge = +(url.searchParams.get("t") || Infinity);

        if (maxAge === Infinity) {
            response.json(DataManager.getAll());
            return;
        }

        response.json(DataManager.getTimePeriod(maxAge));
    } catch (e) {
        console.log(e);
        response.send("error");
    }
});

server.listen(() => console.log("Web Server is listening"));
redirectServer.listen(80, () => console.log("Redirect server is listening"));