import { validateCRC } from "./CRC.js";
import Format from "./Format.js";

/**
* @param {Buffer} originalBuffer
*/
export default function parse(originalBuffer) {
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
    // u16LE = unsigned 16-bit integer (little-endian)
    const format = new Format(buffer, [
        ["s3", "LOO", x => x.toString() === "LOO" ? "Valid" : "Invalid"],
        ["i8", "P|Barometric Trend"],
        ["u8", "LOOP Type (0 or 1)"],
        ["u16BE", "Next Record Pointer"],
        ["u16LE", "Barometer", x => x / 1000],
        ["i16LE", "Inside Temperature", x => x / 10],
        ["u8", "Inside Humidity", x => x + "%"],
        ["i16LE", "Outside Temperature", x => x / 10],
        ["u8", "Wind Speed"],
        ["u8", "10min Wind Speed"],
        ["u16LE", "Wind Direction", x => (x % 360)],
        ...new Array(7 + 4 + 4).fill(["u8", null]), // Various sensors that are not connected
        ["u8", "Outside Humidity", x => x / 100],
        ...new Array(7).fill(["u8", null]), // Extra humidity sensors that are not connected
        ["u16LE", "Rain Rate", x => (x / 100)],
        ["u8", null], // UV Index (Not connected, it defaults to 0xFF)
        ["u16BE", null], // Solar Radiation (Not connected, it defaults to 0xFFFF)
        ["u16LE", "Storm Rain", x => (x / 100)],
        ["u16LE", "Storm Start Date", x => new Date(2000 + (x >> 9), (x >> 5) & 0xF, x & 0x1F).toLocaleDateString()],
        ["u16LE", "Day Rain", x => (x / 100)],
        ["u16LE", "Month Rain", x => (x / 100)],
        ["u16LE", "Year Rain", x => (x / 100)],
        ...new Array(3).fill(["u8", null]), // ET (Not connected)
        ["u16LE", null], // Soil Moistures (Not connected, it defaults to 0xFFFF)
        ["u16LE", null], // Leaf Wetnesses (Not connected, it defaults to 0xFFFF)
        ...new Array(4).fill(["u8", null]), // Alarms (2u8 + 1u16BE)
        ["u8", "Transmitter Battery Status", x => x < 128 ? "OK" : "Low"],
        ["u16BE", "Console Battery Voltage", x => ((x * 300) / 512) / 100],
        ["u8", "Forecast Icons", x => ({
            "Rain": (x & 0x01) === 0x01,
            "Cloud": (x & 0x02) === 0x02,
            "Partly Cloudy": (x & 0x04) === 0x04,
            "Sun": (x & 0x08) === 0x08,
            "Snow": (x & 0x10) === 0x10
        })],
        ["u8", "Forecast Rule Number"]
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