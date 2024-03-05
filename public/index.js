import Barometer from "./plugins/Barometer.js";
import Forecast from "./plugins/Forecast.js";
import Rain from "./plugins/Rain.js";
import Temperature from "./plugins/Temperature.js";
import Wind from "./plugins/Wind.js";
import { off, on } from "./plugins/loader.js";

const barometer = new Barometer();
const insideTemperature = new Temperature("Inside");
const outsideTemperature = new Temperature("Outside");
const wind = new Wind();
const rain = new Rain();
const forecast = new Forecast();

class Data {
    static #DATA_URL = location.hostname === "wx.nfaschool.org" ? "//wx.nfaschool.org/api/data.json" : "./data.json";

    /**
     * @type {{timestamp:number,data:object}[]}
     */
    static data = [];
    static time = 1000 * 60 * 60 * 3;

    static async load(maxTime = Data.time) {
        on();
        try {
            const response = await fetch(Data.#DATA_URL + "?t=" + maxTime);
            Data.data = await response.json();
        } catch (error) {
            console.error("Error fetching data", error);
        }

        Data.parse(maxTime);
        init();
        off();
    }

    static parse(maxTime) {
        const end = Data.data[Data.data.length - 1].timestamp;

        while (Data.data.length > 0 && Data.data[0].timestamp + maxTime < end) {
            Data.data.shift();
        }
    }

    static async loop() {
        await Data.load();
        setTimeout(Data.loop, 1000 * 60 * 3);
    }
}

await Data.loop();
window.Data = Data;

function init() {
    barometer.barometerValues.length = 0;
    barometer.trends.length = 0;
    barometer.timestamps.length = 0;

    insideTemperature.temperatures.length = 0;
    insideTemperature.humidities.length = 0;
    insideTemperature.timestamps.length = 0;

    outsideTemperature.temperatures.length = 0;
    outsideTemperature.humidities.length = 0;
    outsideTemperature.timestamps.length = 0;

    wind.windSpeeds.length = 0;
    wind.avg10Min.length = 0;
    wind.windDirections.length = 0;
    wind.timestamps.length = 0;

    rain.rainRates.length = 0;
    rain.dayRains.length = 0;
    rain.monthRains.length = 0;
    rain.yearRains.length = 0;
    rain.stormRains.length = 0;
    rain.stormStartDates.length = 0;
    rain.timestamps.length = 0;

    forecast.forecasts.length = 0;
    forecast.sunrises.length = 0;
    forecast.sunsets.length = 0;
    forecast.timestamps.length = 0;

    Data.data.forEach(entry => {
        barometer.barometerValues.push(entry.data["Barometer"]);
        barometer.trends.push(entry.data["P|Barometric Trend"] / 20);
        barometer.timestamps.push(entry.timestamp);

        insideTemperature.temperatures.push(entry.data["Inside Temperature"]);
        insideTemperature.humidities.push(entry.data["Inside Humidity"] * 100 | 0);
        insideTemperature.timestamps.push(entry.timestamp);

        outsideTemperature.temperatures.push(entry.data["Outside Temperature"]);
        outsideTemperature.humidities.push(entry.data["Outside Humidity"] * 100 | 0);
        outsideTemperature.timestamps.push(entry.timestamp);

        wind.windSpeeds.push(entry.data["Wind Speed"]);
        wind.avg10Min.push(entry.data["10min Wind Speed"]);
        wind.windDirections.push(entry.data["Wind Direction"]);
        wind.timestamps.push(entry.timestamp);

        rain.rainRates.push(entry.data["Rain Rate"]);
        rain.dayRains.push(entry.data["Day Rain"]);
        rain.monthRains.push(entry.data["Month Rain"]);
        rain.yearRains.push(entry.data["Year Rain"]);
        rain.stormRains.push(entry.data["Storm Rain"]);
        rain.stormStartDates.push(entry.data["Storm Start Date"]);
        rain.timestamps.push(entry.timestamp);

        forecast.forecasts.push(entry.data["Forecast"]);
        forecast.sunrises.push(entry.data["Time of Sunrise"]);
        forecast.sunsets.push(entry.data["Time of Sunset"]);
        forecast.timestamps.push(entry.timestamp);
    });
}

const canvasGrid = document.getElementById("canvasGrid");
canvasGrid.appendChild(barometer.place(64));
canvasGrid.appendChild(insideTemperature.place(64));
canvasGrid.appendChild(outsideTemperature.place(64));
canvasGrid.appendChild(wind.place(64));
canvasGrid.appendChild(rain.place(64));
canvasGrid.appendChild(forecast.place(64));

const timeSelect = document.getElementById("timeSelect");
timeSelect.onchange = function () {
    const value = timeSelect.value;
    const chunks = value.split(" ");

    let v = 0,
        k = 0; // ["+", "-", "*", "/"]

    while (chunks.length) {
        const chunk = chunks.shift();

        if (chunk == "Infinity") {
            v = Infinity;
            break;
        }

        if (Number.isFinite(parseFloat(chunk))) {
            const num = parseFloat(chunk);

            switch (k) {
                case 0:
                    v += num;
                    break;
                case 1:
                    v -= num;
                    break;
                case 2:
                    v *= num;
                    break;
                case 3:
                    v /= num;
                    break;
                default:
                    break;
            }
        } else {
            switch (chunk) {
                case "+":
                    k = 0;
                    break;
                case "-":
                    k = 1;
                    break;
                case "*":
                    k = 2;
                    break;
                case "/":
                    k = 3;
                    break;
                default:
                    break;
            }
        }
    }

    v *= 1000 * 60 * 60;

    Data.time = v;
    Data.load(v);
}

fetch("https://www.example.com/").then($ => $.text()).then(() => {
    document.getElementById("w1hloLink").style.display = "block";
}).catch(e => {
    console.log("Club website not up, not bothering to show link", e);
});