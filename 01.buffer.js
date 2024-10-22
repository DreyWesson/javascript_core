const { Buffer } = require("buffer");

/**
 * NB: To convert from binary to hexadecimal. convert to decimal first then to hex
 * 0100 1000 0110 1001 0010 0001 since 2^n
 *  4    8    6    9    2    1    = 0x48, 0x69, 0x21
 * 0100 1000 = 0x48
 * 0110 1001 = 0x69
 * 0010 0001 = 0x21
 * Should you need to convert hexadecimal to decimal? use 16^n
 *
 * * Three ways of setting hex values to the allocated memory
 * * const buffer = Buffer.alloc(3)
 * * buffer[0] = 0x48
 * * buffer[1] = 0x69
 * * buffer[2] = 0x21
 * * or
 * * let buf = Buffer.from([0x48, 0x69, 0x21])
 * * or
 * * let buf = Buffer.from("486921", "hex"); // I find this most convenient
 */

class MyBuffer {
  static keys = ["ascii", "binary", "hex", "octal", "utf8"];

  static convertBuffer(buffer) {
    let init = Object.fromEntries(this.keys.map(key => [key, ""]));

    buffer.reduce((acc, char) => {
      acc.binary += `${char.toString(2)} `;
      acc.ascii += `${char} `;
      acc.octal += `${char.toString(8)} `;
      return acc;
    }, init);

    init.hex = buffer.toString("hex");
    init["utf8"] = buffer.toString("utf-8")

    return init;
  }

  static getData(buffer, type) {
    if (!buffer) return {};
    if (!Buffer.isBuffer(buffer)) buffer = Buffer.from(buffer);

    const val = this.convertBuffer(buffer);

    if (!type || type.length === 0) type = this.keys;

    const res = {};
    type.forEach((key) => {
      if (val[key]) res[key] = val[key].trim();
    });
    return res;
  }
}

module.exports = MyBuffer;
