const { exec } = require("child_process");
const MyBuffer = require("./01.buffer.js");
const FileSystem = require("./02.filesystem.js");
const {
  getCommandFileName,
  isHttpRequest,
  parseHttpRequest,
} = require("./utils/index.js");
const {
  handleHttpRequest,
  handleAllRequests,
} = require("./helper/httpRequestHandler.js");
const fileOperations = require("./helper/fileOps.js");
const { handleMath, executeCommand } = require("./helper/commandExecutor.js");

(async function () {
  const filePath = await getCommandFileName();
  const extIdx = filePath.lastIndexOf(".");
  const ext = extIdx !== -1 ? filePath.substring(extIdx + 1) : "";

  await FileSystem.createFile(filePath);
  FileSystem.fileWatcher(filePath, { type: "change" }, cb);

  async function cb() {
    const buffer = await FileSystem.readFile(filePath);
    const content = (await MyBuffer.getData(buffer)).utf8;

    if (!content || content.length < 2) return;

    if (content.includes("[WAIT]")) return;

    if (ext.length === 0) {
      executeCommand(content);
    }

    if (ext === "txt" || ext === "file") {
      await fileOperations(content);
    }

    if (ext === "math") {
      handleMath(content);
    }

    if (ext === "http" || ext === "rest") {
      await handleAllRequests(content);
    }
  }
})().catch(console.error);
