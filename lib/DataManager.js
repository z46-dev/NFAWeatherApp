import fs from "fs";
import LZ77 from "./LZ77.js";

const PATH = "./data/";

export default class DataManager {
    static saveData(timestamp, data) {
        const entry = { timestamp, data };
        const fileName = new Date(timestamp).toISOString().slice(0, 10) + ".txt";

        try {
            if (!fs.existsSync(PATH)) {
                fs.mkdirSync(PATH);
            }
    
            const list = fs.existsSync(PATH + fileName) ? JSON.parse(LZ77.decompress(fs.readFileSync(PATH + fileName, "utf-8"))) : [];
            list.push(entry);
    
            fs.writeFileSync(PATH + fileName, LZ77.compress(JSON.stringify(list)), "utf-8");
        } catch (err) {
            console.error("DataManager.saveData Error:", err);
        }
    }

    static getAll() {
        const allData = [];

        if (!fs.existsSync(PATH)) {
            return allData;
        }

        const files = fs.readdirSync(PATH);

        for (const file of files) {
            const list = JSON.parse(LZ77.decompress(fs.readFileSync(PATH + file, "utf-8")));
            allData.push(...list);
        }

        return allData;
    }

    static getTimePeriod(milliseconds) {
        // Find most recent
        if (!fs.existsSync(PATH)) {
            return [];
        }

        const files = fs.readdirSync(PATH).map(file => new Date(file.slice(0, 10)).getTime());
        const mostRecent = Math.max(...files);

        const list = JSON.parse(LZ77.decompress(fs.readFileSync(PATH + new Date(mostRecent).toISOString().slice(0, 10) + ".txt", "utf-8")));
        const finalEntry = list[list.length - 1];
        const maxTime = finalEntry.timestamp;
        const minTime = maxTime - milliseconds;
        const data = [];

        for (const file of files) {
            if (file >= minTime) {
                const list = JSON.parse(LZ77.decompress(fs.readFileSync(PATH + new Date(file).toISOString().slice(0, 10) + ".txt", "utf-8")));
                data.push(...list);
            }
        }

        return data;
    }
}