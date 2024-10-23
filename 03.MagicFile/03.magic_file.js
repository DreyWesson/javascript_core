const MyBuffer = require("../01.Buffer/01.buffer.js");
const FileSystem = require("../02.FileSystem/02.filesystem.js");
const { handleAllRequests } = require("./helper/httpRequestHandler.js");
const fileOperations = require("./helper/fileOps.js");
const { handleMath, executeCommand } = require("./helper/commandExecutor.js");
const { getCommandFileName } = require("../utils/index.js");
const { printWelcome } = require("./utils/index.js");

(async function () {
  let filePath;

  // Loop until a valid filename is provided
  printWelcome();
  while (!filePath) {
    filePath = await getCommandFileName();

    // Validate the filename (you can add more validation logic as needed)
    if (!filePath || filePath.trim() === "") {
      console.log("Invalid filename. Please enter a valid command file name.");
      filePath = null; // Reset to prompt again
    }
  }

  const extIdx = filePath.lastIndexOf(".");
  const ext = extIdx !== -1 ? filePath.substring(extIdx + 1) : "";

  await FileSystem.createFile(filePath);
  const options = { type: "change" };

  FileSystem.fileWatcher(filePath, options, cb);

  async function cb() {
    const buffer = await FileSystem.readFile(filePath);
    const { utf8: content } = await MyBuffer.getData(buffer);

    if (!content || content.length < 2) return;

    if (content.includes("[WAIT]")) return;

    if (ext === "") executeCommand(content);

    if (ext === "math") handleMath(content);

    if (ext === "txt" || ext === "file")
      await fileOperations.fileHandler(filePath);

    if (ext === "http" || ext === "rest") await handleAllRequests(content);
  }
})().catch(console.error);
