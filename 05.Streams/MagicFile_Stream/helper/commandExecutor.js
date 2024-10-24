const { exec } = require("child_process");
const { COLORS } = require("../utils/constant");

function executeCommand(content) {
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

function handleMath(content) {
  const { GREEN, RESET } = COLORS;
  const expression = content.trim();
  exec(`echo "${expression}" | bc`, (error, stdout) => {
    if (error) {
      console.error(`Error calculating: ${error.message}`);
    } else {
      console.log(`Result:\n\t${GREEN}${stdout}${RESET}`);
    }
  });
}

module.exports = { executeCommand, handleMath };
