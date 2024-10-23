const FileSystem = require("../02.filesystem");

function splitOnFirstSpace(str) {
  const index = str.indexOf(" ");
  if (index === -1) return [str];
  return [str.slice(0, index), str.slice(index + 1)];
}

const actions = {
  CREATE_FILE: "create a file",
  DELETE_FILE: "delete a file",
  RENAME_FILE: "rename a file",
  ADD_TO_FILE: "add to file",
  CALCULATE: "calculate",
  EXECUTE_COMMAND: "execute command",
};

async function fileOperations(content) {
  if (content.includes(actions.CREATE_FILE)) {
    const filename = content.substr(actions.CREATE_FILE.length).trim();
    await FileSystem.createFile(filename);
  }

  if (content.includes(actions.DELETE_FILE)) {
    const filename = content.substr(actions.DELETE_FILE.length).trim();
    await FileSystem.deleteFile(filename);
  }

  if (content.includes(actions.RENAME_FILE)) {
    const filename = content.substr(actions.RENAME_FILE.length).trim();
    const [oldname, newname] = filename.split(" ");
    await FileSystem.renameFile(oldname.trim(), newname.trim());
  }

  if (content.includes(actions.ADD_TO_FILE)) {
    const rest = content.substr(actions.ADD_TO_FILE.length).trim();
    const [filename, new_content] = splitOnFirstSpace(rest);
    await FileSystem.addToFile(filename, new_content);
  }
}

module.exports = fileOperations;
