const MyBuffer = require("./01.buffer.js");
const FileSystem = require("./02.filesystem.js");

(async function () {
  const filePath = __dirname + "/command_file.txt";
  FileSystem.fileWatcher(filePath, { type: "change" }, cb);

  async function cb() {
    const buffer = await FileSystem.readFile(filePath);
    console.log(await MyBuffer.getData(buffer));
  }

})().catch(console.error);
