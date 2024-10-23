const readline = require("readline");

const getCommandFileName = () => {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question("Enter the name of the command file: ", (fileName) => {
      rl.close();
      resolve(fileName.trim() || "command.txt");
    });
  });
};

const debounce = (fn, delay) => {
  let timeId;
  let lastCallTime = 0;

  return function (...args) {
      const now = Date.now();
      if (now - lastCallTime < delay) {
          clearTimeout(timeId);
      }
      lastCallTime = now;

      timeId = setTimeout(() => {
          fn.apply(this, args);
      }, delay);
  };
};

module.exports = { getCommandFileName, debounce };
