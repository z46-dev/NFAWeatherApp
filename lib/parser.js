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
        ["u8", "Inside Humidity", x => x / 100],
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
        ["u16LE", "Storm Start Date", x => new Date(2000 + (x & 0x7F), (x >> 7) & 0x1F, ((x >> 12) & 0xF) - 1).toLocaleDateString("en-US")],
        ["u16LE", "Day Rain", x => (x / 100)],
        ["u16LE", "Month Rain", x => (x / 100)],
        ["u16LE", "Year Rain", x => (x / 100)],
        ...new Array(3).fill(["u16LE", null]), // ET (Not connected)
        ...new Array(4).fill(["u8", null]), // Soil Moistures (Not connected)
        ...new Array(4).fill(["u8", null]), // Leaf Wetnesses (Not connected)
        ...new Array(16).fill(["u8", null]), // Alarms
        ["u8", "Transmitter Battery Status", x => x < 128 ? "OK" : "Low"],
        ["u16BE", "Console Battery Voltage", x => ((x * 300) / 512) / 100],
        ["u8", "Forecast Icons", x => ({
            "Rain": !!(x & (1 << 0)),
            "Cloudy": !!(x & (1 << 1)),
            "Partly Cloudy": !!(x & (1 << 2)),
            "Sunny": !!(x & (1 << 3)),
            "Snow": !!(x & (1 << 4))
        })],
        ["u8", "Forecast Rule Number", x => {
            let segments = ["error"],
                forecast = "error";

            switch (x) {
                case 0x08:
                    segments = ["Sun"];
                    forecast = "Mostly Clear";
                    break;
                case 0x06:
                    segments = ["Partial Sun", "Cloud"];
                    forecast = "Partly Cloudy";
                    break;
                case 0x02:
                    segments = ["Cloud"];
                    forecast = "Mostly Cloudy";
                    break;
                case 0x03:
                    segments = ["Cloud", "Rain"];
                    forecast = "Mostly Cloudy, Rain within 12 hours";
                    break;
                case 0x12:
                    segments = ["Cloud", "Snow"];
                    forecast = "Mostly Cloudy, Snow within 12 hours";
                    break;
                case 0x13:
                    segments = ["Cloud", "Rain", "Snow"];
                    forecast = "Mostly Cloudy, Rain or Snow within 12 hours";
                    break;
                case 0x07:
                    segments = ["Partial Sun", "Cloud", "Rain"];
                    forecast = "Partly Cloudy, Rain within 12 hours";
                    break;
                case 0x16:
                    segments = ["Partial Sun", "Cloud", "Snow"];
                    forecast = "Partly Cloudy, Snow within 12 hours";
                    break;
                case 0x17:
                    segments = ["Partial Sun", "Cloud", "Rain", "Snow"];
                    forecast = "Partly Cloudy, Rain or Snow within 12 hours";
                    break;
            }

            return { segments, forecast };
        }]
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