const { exec } = require("child_process");
const MyBuffer = require("./01.buffer.js");
const FileSystem = require("./02.filesystem.js");
const {
  getCommandFileName,
  isHttpRequest,
  parseHttpRequest,
} = require("./utils/index.js");
const { handleHttpRequest } = require("./helper/httpRequestHandler.js");
const fileOperations = require("./helper/fileOps.js");

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

    const actions = {
      CREATE_FILE: "create a file",
      DELETE_FILE: "delete a file",
      RENAME_FILE: "rename a file",
      ADD_TO_FILE: "add to file",
      CALCULATE: "calculate",
      EXECUTE_COMMAND: "execute command",
    };

    if (content.includes("[WAIT]")) return;

    if (ext.length === 0) {
      const command = content.trim();
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing command: ${error.message}`);
          return;
        }
        if (stderr) {
          console.error(`Command error output: ${stderr}`);
          return;
        }
        console.log(`Command output:\n${stdout}`);
      });
      return;
    }

    if (ext === "txt" || ext === "file") {
      await fileOperations(content);
    }

    if (ext === "math") {
      const expression = content.trim();
      exec(`echo "${expression}" | bc`, (error, stdout) => {
        if (error) {
          console.error(`Error calculating: ${error.message}`);
        } else {
          console.log(`Result:\n\t${stdout}`);
        }
      });
    }

    if (ext === "http" || ext === "rest") {
      const requests = parseHttpRequest(content);

      for (const request of requests) {
        if (isHttpRequest(request)) {
          await handleHttpRequest(request);
        } else {
          console.log("Not a valid HTTP request:", request);
        }
      }
    }
  }
})().catch(console.error);
