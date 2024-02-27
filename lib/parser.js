import { validateCRC } from "./CRC.js";
import Format from "./Format.js";

/**
* @param {Buffer} originalBuffer
*/
export function parse(originalBuffer) {
    let validOffset = 0;

    while (originalBuffer.at(validOffset) !== 0x4C && validOffset < originalBuffer.length) {
        validOffset++;
    }
    
    const buffer = originalBuffer.slice(validOffset, validOffset + 108);
    const CRCScore = validateCRC(buffer);

    // https://cdn.shopify.com/s/files/1/0515/5992/3873/files/VantageSerialProtocolDocs_v261.pdf?v=1614399559
    // Page 22
    // s<n> = string of n bytes (s3, s4, s5, etc.)
    // u8 = unsigned 8-bit integer
    // u16 = unsigned 16-bit integer (little-endian)
    const format = new Format(buffer, [
        ["s3", "LOO"],
        ["i8", "P|Barometric Trend"],
        ["u8", "LOOP Type (0 or 1)"],
        ["u16BE", "Next Record Pointer"],
        ["u16LE", "Barometer", x => x / 1000],
        ["i16LE", "Inside Temperature", x => x / 10 + "° F"],
        ["u8", "Inside Humidity", x => x + "%"],
        ["i16LE", "Outside Temperature", x => x / 10 + "° F"],
        ["u8", "Wind Speed"],
        ["u8", "10min Wind Speed"],
        ["u16LE", "Wind Direction", x => (x % 360) + "°"],
        ["u8", "T1", x => (x - 90) + "° F"],
        ["u8", "T1", x => (x - 90) + "° F"],
        ["u8", "T1", x => (x - 90) + "° F"],
        ["u8", "T1", x => (x - 90) + "° F"],
        ["u8", "T1", x => (x - 90) + "° F"],
        ["u8", "T1", x => (x - 90) + "° F"],
        ["u8", "T1", x => (x - 90) + "° F"]
    ]);

    return {
        originalSize: originalBuffer.length,
        validOffset: validOffset,
        validSize: buffer.length,
        parsed: format.parse(),
        crc: {
            score: CRCScore,
            valid: CRCScore === 0
        }
    };
}