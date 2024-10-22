const readline = require('readline');

exports.getCommandFileName = () => {
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

exports.debounce = (fn, delay) => {
  let timeId;

  return function (...args) {
    if (timeId) {
      clearTimeout(timeId);
    }
    timeId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
};
