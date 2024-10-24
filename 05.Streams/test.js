// PROMISES
// const fs = require("node:fs/promises");

// (async function name() {
//   const filename = "large_file.txt";
//   console.time("large");
//   const file = await fs.open(filename, "w");
//   for (let i = 0; i < 1_000_000; i++) {
//     await file.writeFile(` ${i} `);
//   }
//   console.timeEnd("large");
//   setTimeout(() => {
//     fs.unlink(filename);
//   }, 5000);
// })();

// const fs = require("fs");

// (async function () {
//     // large: 15.361s
//     // large: 14.815s
//     // large: 14.476s
//   const filename = "large_file.txt";
//   const cb = () => {};
//   console.time("large")
//   fs.open(filename, "w", (err, fd) => {
//     if (err) return console.log("Error occurred opening the file: ", err);

//     Array.from({ length: 1_000_000 }).forEach((_, idx) => {
//         const buffer = Buffer.from(` ${idx} `);
//       fs.writeSync(fd, buffer);
//     });
//     console.timeEnd("large")
//   });
//   // setTimeout(() => {
//   //   fs.unlink(filename, cb);
//   // }, 5000);
// })();

const fs = require("fs/promises");

(async function () {
// stream: 470.028ms
// stream: 457.328ms
// stream: 461.409ms
  try {
    const filename = "large_file.txt";
    console.time("stream");
    const fileHandler = await fs.open(filename, "w+");
    const stream = fileHandler.createWriteStream();

    Array.from({ length: 1_000_000 }).forEach((_, idx) => {
      const buffer = Buffer.from(` ${idx} `, "utf-8");
      stream.write(buffer);
      stream.on("drain", () => {
        buffer = null;
      })
    });
    console.timeEnd("stream");
    setTimeout(() => {
      fs.unlink(filename);
    }, 5000);
  } catch (error) {
    console.log(error);
  }
})();

