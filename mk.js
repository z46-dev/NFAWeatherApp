class PipeBarData {
    constructor() {
        this.initialized = false;
        this.keys = new Set();

        /**
         * @type {{timeStamp:Date,data:object}[]}
         */
        this.dataEntries = [];
    }

    /**
     * @param {String[]} data
     */
    pipe(data) {
        const dataEntry = {};
        while (data.length) {
            const rawEntry = data.shift().split(" ");
            const value = rawEntry.pop();
            const key = rawEntry.join(" ");

            if (!this.keys.has(key)) {
                this.keys.add(key);
            }

            dataEntry[key] = value;
        }

        this.dataEntries.push({
            timeStamp: new Date(Date.now()),
            data: dataEntry
        });
    }

    get raw() {
        const string = btoa(`${Array.from(this.keys).join(",")}:${this.keys.size},${this.dataEntries.length}:${this.dataEntries.map(entry => {
            let values = [];

            this.keys.forEach(key => {
                values.push(entry.data[key] ?? null);
            });

            console.log(values);

            return (entry.timeStamp.getTime() / 60000 | 0) + "," + values.join(",");
        }).join(",")}`);

        return new TextEncoder().encode(string);
    }

    /**
     * @param {Uint8Array} raw
     * @returns {PipeBarData}
     */
    static fromRaw(raw) {
        const string = new TextDecoder().decode(raw);
        const decoded = atob(string);
        const [rawKeys, sizes, entries] = decoded.split(":");
        
        const keys = rawKeys.split(",");
        const keySize = parseInt(sizes.split(",")[0]);
        const countOfEntries = parseInt(sizes.split(",")[1]);

        const dataEntries = [];
        const rawEntries = entries.split(",");

        for (let i = 0; i < countOfEntries; i++) {
            const time = new Date(parseInt(rawEntries.shift()) * 60000);
            const values = [];

            for (let j = 0; j < keySize; j++) {
                values.push(rawEntries.shift());
            }

            const data = {};

            for (let j = 0; j < keySize; j++) {
                data[keys[j]] = values[j];
            }

            dataEntries.push({
                timeStamp: time,
                data: data
            });
        }

        const piper = new PipeBarData();
        piper.keys = new Set(keys);
        piper.dataEntries = dataEntries;

        return piper;
    }
}

const piper = PipeBarData.fromRaw(new TextEncoder().encode("QkFSLEVMRVZBVElPTixERVcgUE9JTlQsVklSVFVBTCBURU1QLEMsUixCQVJDQUwsR0FJTixPRkZTRVQ6OSw4OjI4NDc4NzY4LDI5Mzc0LDEwMCw0MCw0MCwxNywxMDA0LDAsMCwtMjYsMjg0Nzg3NjgsMjkzNzQsMTAwLDQwLDQwLDE3LDEwMDQsMCwwLC0yNiwyODQ3ODc2OCwyOTM3NCwxMDAsNDAsNDAsMTcsMTAwNCwwLDAsLTI2LDI4NDc4NzY4LDI5Mzc0LDEwMCw0MCw0MCwxNywxMDA0LDAsMCwtMjYsMjg0Nzg3NjgsMjkzNzQsMTAwLDQwLDQwLDE3LDEwMDQsMCwwLC0yNiwyODQ3ODc2OCwyOTM3NCwxMDAsNDAsNDAsMTcsMTAwNCwwLDAsLTI2LDI4NDc4NzY4LDI5Mzc0LDEwMCw0MCw0MCwxNywxMDA0LDAsMCwtMjYsMjg0Nzg3NjgsMjkzNzQsMTAwLDQwLDQwLDE3LDEwMDQsMCwwLC0yNg=="));

console.log(piper.dataEntries);