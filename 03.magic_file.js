const fs = require("fs/promises");
const readline = require('readline');
const MyBuffer = require("./01.buffer.js");
const FileSystem = require("./02.filesystem.js");


function getCommandFileName() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question("Enter the name of the command file: ", (fileName) => {
      rl.close();
      resolve(fileName.trim() || 'command.txt');
    });
  });
}

(async function () {
  // const filePath = __dirname + "/command_file.txt";
  const filePath = await getCommandFileName();
  // const filePath = __dirname + "/" + commandFileName;
  await FileSystem.createFile(filePath);
  FileSystem.fileWatcher(filePath, { type: "change" }, cb);

  function splitOnFirstSpace(str) {
    const index = str.indexOf(" ");

    if (index === -1) {
      return [str];
    }

    const firstPart = str.slice(0, index);
    const secondPart = str.slice(index + 1);

    return [firstPart, secondPart];
  }

  async function cb() {
    const buffer = await FileSystem.readFile(filePath);
    const content = (await MyBuffer.getData(buffer)).utf8;

    if (content.length < 2) return;

    const actions = {
      CREATE_FILE: "create a file",
      DELETE_FILE: "delete a file",
      RENAME_FILE: "rename a file",
      ADD_TO_FILE: "add to file",
    };

    if (content.includes(actions.CREATE_FILE)) {
      const filename = content.substr(actions.CREATE_FILE.length);
      await FileSystem.createFile(filename.trim());
    }

    if (content.includes(actions.DELETE_FILE)) {
      const filename = content.substr(actions.DELETE_FILE.length);
      await FileSystem.deleteFile(filename.trim());
    }

    if (content.includes(actions.RENAME_FILE)) {
      const filename = content.substr(actions.RENAME_FILE.length);
      const [oldname, newname] = filename.trim().split(" ");
      await FileSystem.renameFile(oldname.trim(), newname.trim());
    }

    if (content.includes(actions.ADD_TO_FILE)) {
      const rest = content.substr(actions.ADD_TO_FILE.length);
      const [filename, new_content] = splitOnFirstSpace(rest.trim());

      await FileSystem.addToFile(filename, new_content);
    }
  }
})().catch(console.error);
