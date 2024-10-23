const readline = require("readline");
const { printWelcome } = require("../03.MagicFile/utils");


const getCommandFileName = () => {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    
    printWelcome();

    const promptText = "Enter the name of the command file: ";
    let visible = true;
    let intervalId;

    const startPulsating = () => {
      intervalId = setInterval(() => {
        readline.cursorTo(process.stdout, 0);
        readline.clearLine(process.stdout, 0);
        process.stdout.write(visible ? promptText : " ".repeat(promptText.length));
        visible = !visible;
      }, 500);
    };

    startPulsating();

    // Stop pulsation when a key is pressed
    process.stdin.on('data', (char) => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;

        // Display the prompt text permanently and include the first typed character
        readline.cursorTo(process.stdout, 0);
        readline.clearLine(process.stdout, 0);
        process.stdout.write(promptText + char);
      }
    });

    rl.question(promptText, (fileName) => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      readline.cursorTo(process.stdout, 0);
      readline.clearLine(process.stdout, 0);
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
