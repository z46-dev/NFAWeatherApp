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

        const files = fs.readdirSync(PATH);
        const times = files.map(file => new Date(file.slice(0, 10)).getTime());
        const mostRecent = Math.max(...times);
        const data = [];

        for (let i = 0; i < files.length; i++) {
            const time = times[i];

            if (mostRecent - time > milliseconds) {
                continue;
            }

            const list = JSON.parse(LZ77.decompress(fs.readFileSync(PATH + files[i], "utf-8")));
            data.push(...list);
        }

        while (data.length > 1 && data[data.length - 1].timestamp - data[0].timestamp > milliseconds) {
            data.shift();
        }

        return data;
    }
}