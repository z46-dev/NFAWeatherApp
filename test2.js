import { SerialPort } from "serialport";

const port = new SerialPort({
    path: "/dev/ttyUSB0",
    baudRate: 19200
})

port.on("open", function onOpen() {
    console.log("Port is open");

    setTimeout(function onTimeout() {
        port.write("LOOP\n", function onWrite(err) {
            if (err) {
                console.error("Error:", err);
            }
        });
    }, 1000);
});

port.on("data", function onData(data) {
    console.log("Data:", data);
});