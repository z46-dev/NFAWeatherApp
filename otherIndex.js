import fs from "fs";
import { URL } from "url";
import Server from "./lib/Server.js";

let allData = [];

function loadData() {
    try {
        allData = JSON.parse(fs.readFileSync("../loopParser/data.json", "utf-8"));
    } catch (e) {
        console.log(e);
    }

    setTimeout(loadData, 1000 * 60);
}

loadData();

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
        const output = [];

        for (let i = 0; i < allData.length; i++) {
            if (allData[i].timestamp + maxAge >= allData[allData.length - 1].timestamp) {
                output.push(allData[i]);
            }
        }

        response.json(output);
    } catch (e) {
        console.log(e);
        response.send("error");
    }
});

server.listen(console.log);