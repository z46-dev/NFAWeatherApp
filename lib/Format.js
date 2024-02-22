class BufferProcessor {
    /**
     * @param {Buffer} buffer
     * @param {number} [offset]
     */
    constructor(buffer, offset = 0) {
        this.buffer = buffer;
        this.offset = offset;
    }

    string(length) {
        let string = "";

        for (let i = 0; i < length; i++) {
            string += String.fromCharCode(this.buffer.at(this.offset + i));
        }

        return this.offset += string.length, string;
    }

    i8() {
        return this.buffer.readInt8(this.offset++);
    }

    u8() {
        return this.buffer.readUint8(this.offset++);
    }

    i16BE() {
        return this.offset += 2, this.buffer.readInt16BE(this.offset - 2);
    }

    i16LE() {
        return this.offset += 2, this.buffer.readInt16LE(this.offset - 2);
    }

    u16BE() {
        return this.offset += 2, this.buffer.readUint16BE(this.offset - 2);
    }

    u16LE() {
        return this.offset += 2, this.buffer.readUint16LE(this.offset - 2);
    }
}

export default class Format extends BufferProcessor {
    constructor(buffer, format = []) {
        super(buffer, 0);
        this.format = format;
    }

    getExpectedLength() {
        let l = 0;

        for (let i = 0; i < this.format.length; i++) {
            switch (this.format[i][0]) {
                case "i8":
                case "u8":
                    l++;
                    break;
                case "i16BE":
                case "i16LE":
                case "u16BE":
                case "u16LE":
                    l += 2;
                    break;
                default:
                    if (this.format[i][0].startsWith("s")) {
                        l += +this.format[i][0].slice(1);
                    }
            }
        }

        return l;
    }

    parse() {
        if (this.buffer.length < this.getExpectedLength()) {
            throw new Error("Buffer is too short for expected format");
        }

        const data = new Map();
        while (this.format.length) {
            const format = this.format.shift();

            switch (format[0]) {
                case "i8":
                    data.set(format[1], this.i8());
                    break;
                case "u8":
                    data.set(format[1], this.u8());
                    break;
                case "i16BE":
                    data.set(format[1], this.i16BE());
                    break;
                case "i16LE":
                    data.set(format[1], this.i16LE());
                    break;
                case "u16BE":
                    data.set(format[1], this.u16BE());
                    break;
                case "u16LE":
                    data.set(format[1], this.u16LE());
                    break;
                default:
                    if (format[0][0] === "s") {
                        data.set(format[1], this.string(+format[0].slice(1)));
                    }
            }

            if (format[2] instanceof Function) {
                data.set(format[1], format[2](data.get(format[1])));
            }
        }

        return data;
    }
}