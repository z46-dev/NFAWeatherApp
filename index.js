import fs from "fs";
import { validateCRC } from "./lib/CRC.js";
import Format from "./lib/Format.js";

const buffers = JSON.parse(fs.readFileSync("./buffers.json", "utf-8")).map(bufferedString => Buffer.from(bufferedString));

/**
 * @param {Buffer} originalBuffer
 */
function parse(originalBuffer) {
    console.log("Starting with a buffer", originalBuffer.length, "bytes long");

    let validOffset = 0;

    while (originalBuffer.at(validOffset) !== 0x4C && validOffset < originalBuffer.length) {
        validOffset++;
    }

    const buffer = originalBuffer.slice(validOffset);

    console.log("Valid offset:", validOffset, "Buffer length:", buffer.length);

    const CRCScore = validateCRC(buffer);

    console.log("CRC Score:", CRCScore, "Valid:", CRCScore === 0);

    // https://cdn.shopify.com/s/files/1/0515/5992/3873/files/VantageSerialProtocolDocs_v261.pdf?v=1614399559
    // Page 22
    // s<n> = string of n bytes (s3, s4, s5, etc.)
    // u8 = unsigned 8-bit integer
    // u16 = unsigned 16-bit integer (little-endian)
    const format = new Format(buffer, [
        ["s3", "LOO"],
        ["i8", "P|Barometric Trend"],
        ["i8", "LOOP Type (0 or 1)"],
        ["u16BE", "Next Record Pointer"],
        ["u16BE", "Barometer", x => x / 1000],
        ["u16LE", "Inside Temperature", x => x / 10 + "° F"],
        ["u8", "Inside Humidity", x => x + "%"],
        ["u16BE", "Outside Temperature", x => x / 10 + "° F"],
        ["u8", "Wind Speed"],
        ["u8", "10min Wind Speed"],
        ["u16LE", "Wind Direction", x => x + "°"]
    ]);

    console.log(format.parse());
    console.log("\n\n");
}

buffers.forEach(parse);