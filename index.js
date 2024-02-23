import fs from "fs";
import { parse } from "./lib/parser.js";

const buffers = JSON.parse(fs.readFileSync("./buffers.json", "utf-8")).map(bufferedString => Buffer.from(bufferedString));
const parsed = buffers.map(parse).map(p => ({
    ...p,
    parsed: Object.fromEntries(p.parsed)
}));

fs.writeFileSync("./parsed.json", JSON.stringify(parsed, null, 4));