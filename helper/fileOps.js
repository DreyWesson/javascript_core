const fs = require('fs').promises;

async function createFile(filePath) {
    await fs.writeFile(filePath, '');
}

async function deleteFile(filePath) {
    await fs.unlink(filePath);
}

async function addToFile(filePath, content) {
    await fs.appendFile(filePath, content);
}

async function readFile(filePath) {
    return await fs.readFile(filePath);
}

module.exports = { createFile, deleteFile, addToFile, readFile };