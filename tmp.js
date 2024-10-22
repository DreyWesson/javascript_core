const MyBuffer = require("./01.buffer.js");
const FileSystem = require("./02.filesystem.js");
const { getCommandFileName } = require("./utils/index.js");

(async function () {
  // const filePath = __dirname + "/command_file.txt";
  const filePath =  await getCommandFileName();
  await FileSystem.addToFile(filePath, "Hello world")

  FileSystem.fileWatcher(filePath, { type: "change" }, cb);

  async function cb() {
    const buffer = await FileSystem.readFile(filePath);
    console.log(await MyBuffer.getData(buffer));
  }

})().catch(console.error);
