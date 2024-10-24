const fs = require("fs/promises");
const path = require('path');
const { spawn } = require('child_process');
const MyBuffer = require("../01.Buffer/01.buffer.js");
const { debounce } = require("../utils/index.js");

const COLORS = {
  RESET: "\x1b[0m",
  BOLD: "\x1b[1m",
  GREEN: "\x1b[32m",
  YELLOW: "\x1b[33m",
  BLUE: "\x1b[34m",
  MAGENTA: "\x1b[35m",
  CYAN: "\x1b[36m",
  GRAY: "\x1b[90m",
  RED: "\x1b[31m",
};

class FileSystem {
  static async createFile(filename) {
    try {
      const file = await fs.open(filename, "wx");
      await file.close();
      console.log(`${filename} created successfully!`);
      return true;
    } catch (error) {
      if (error.code === "EEXIST") {
        console.log(`${filename} already exists`);
        return false;
      } else {
        console.log(`Error creating file ${filename}: `, error);
        throw error;
      }
    }
  }

  static async renameFile(oldname, newname) {
    try {
      await fs.rename(oldname, newname);
      console.log(`${oldname} rename successful: ${newname}`);
      return true;
    } catch (error) {
      if (error.code === "ENOENT") {
        console.log(`${oldname} does not exist`);
      } else {
        console.log(`Error occurred when renaming: ${oldname}`);
        throw error;
      }
    }
  }

  static async openFile(filePath, options = {}) {
    try {
      return await fs.open(filePath, options.flags || "r");
    } catch (error) {
      console.error("Error opening file:", error);
    }
  }

  static async deleteFile(filename) {
    try {
      await fs.unlink(filename);
      console.log(`File deleted successfully: ${filename}`);
      return true;
    } catch (error) {
      if (error.code === "ENOENT") {
        console.log(`File not found: ${filename}`);
      } else {
        console.log(`Error deleting ${filename}: ${error.message}`);
      }
      throw error;
    }
  }

  static async addToFile(filename, content) {
    try {
      await fs.appendFile(filename, content);
      console.log(`Successfully added content to ${filename}`);
    } catch (error) {
      console.log(`Error occurred adding content to ${filename} error`);
      throw error;
    }
  }

  static async readFile(filePath, options = {}) {
    let file;
    try {
      file = await this.openFile(filePath, { flags: options.flags });
      const { size } = (await this.getFileStat(filePath)).size;
      const buffer = Buffer.alloc(options?.size ?? size ?? 1024);
      const { bytesRead } = await file.read({
        buffer: buffer,
        offset: options.offset || 0,
        length: buffer.byteLength,
        position: options.position || null,
      });

      return buffer.slice(0, bytesRead);
    } catch (error) {
      throw new Error(`Error reading file: ${error.message}`);
    } finally {
      if (file) await file.close();
    }
  }

  static async getFileStat(filePath, options = {}) {
    let file;
    try {
      file = await this.openFile(filePath, { flags: options.flags });
      return await file.stat();
    } catch (error) {
      throw new Error(`Error getting file stats: ${error.message}`);
    } finally {
      if (file && options.shouldClose !== false) await file.close();
    }
  }

  static async reader(filePath, options = {}) {
    try {
      const buffer = await this.readFile(filePath, options);
      return MyBuffer.getData(buffer, options.dataTypes || []);
    } catch (error) {
      if (error.code === "ENOENT") {
        throw new Error(`File not found: ${filePath}`);
      }
      throw new Error(`Error reading file content: ${error.message}`);
    }
  }

  static async fileWatcher(filePath, options = {}, cb) {
    const debouncedCallback = debounce(cb, 100);
    let watcher;
    try {
      // console.log(`Watching ${filePath} for changes...`);
      console.log(`${COLORS.CYAN}Watching ${COLORS.YELLOW}${filePath}${COLORS.CYAN} for changes...${COLORS.RESET}`);
      watcher = fs.watch(filePath, { recursive: true, ...options.watchOptions });
  
      for await (const event of watcher) {
        console.log(`Change detected: ${event.eventType} - ${event.filename}`);
        if (options.type ? event.eventType === options.type.toLowerCase() : true) {
          debouncedCallback();
        }
      }
    } catch (error) {
      console.error(`Error watching file: ${error.message}`);
    }
  }
  
  static async startNodemon(filePaths) {
    if (!Array.isArray(filePaths)) {
      filePaths = [filePaths];
    }
  
    console.log(`Watching for changes in: ${filePaths.join(", ")}...`);
    let childProcess = null;
  
    const startChildProcess = () => {
      if (childProcess) {
        childProcess.kill();
      }
      console.log("Starting/Restarting application...");
      const entryFile = path.join(filePaths[0], 'index.js');
      childProcess = spawn("node", [entryFile], { stdio: "inherit" });
      childProcess.on("close", (code) => {
        if (code !== null) {
          console.log(`Child process exited with code ${code}`);
        }
      });
    };
  
    startChildProcess();
  
    const watchers = filePaths.map(async (filePath) => {
      await this.fileWatcher(
        filePath,
        { watchOptions: { recursive: true } },
        async () => {
          console.log(`Change detected in ${filePath}. Restarting...`);
          startChildProcess();
        }
      );
    });
  
    await Promise.all(watchers);
  }
}

module.exports = FileSystem;
