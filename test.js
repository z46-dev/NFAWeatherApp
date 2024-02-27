const { SerialPort } = require('serialport');
const Readline = require('@serialport/parser-readline');
const struct = require('bufferpack');

console.log(Readline)

// Serial port settings
const WX_PORT = "/dev/ttyUSB0";
const WX_BAUDRATE = 19200;
const WX_DELAY = 200; // milliseconds

const wx = new SerialPort({
  path: WX_PORT,
  baudRate: WX_BAUDRATE
});

const parser = new Readline.ReadlineParser;
wx.pipe(parser);

function wxWrite(s) {
  return new Promise((resolve, reject) => {
    wx.write(s + '\n', (err) => {
      if (err) {
        reject(err);
      } else {
        setTimeout(() => {
          wx.drain((err) => {
            if (err) {
              reject(err);
            } else {
              parser.once('data', (data) => {
console.log(Buffer.from(data));
                // Assuming data holds entire LOOP packet
                const barometer_INHG = parseFloat((struct.unpack('<H', data.slice(7, 9))[0] / 1000.0).toFixed(2));
                resolve(barometer_INHG);
              });
            }
          });
        }, WX_DELAY);
      }
    });
  });
}

wx.on('open', async () => {
  try {
    const barometer = await wxWrite('LOOP');
    console.log(barometer);
  } catch (err) {
    console.error('Error:', err);
  }
});