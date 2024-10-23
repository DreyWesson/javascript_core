const { exec } = require("child_process");

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
  const expression = content.trim();
  exec(`echo "${expression}" | bc`, (error, stdout) => {
    if (error) {
      console.error(`Error calculating: ${error.message}`);
    } else {
      console.log(`Result:\n\t${stdout}`);
    }
  });
}

module.exports = { executeCommand, handleMath };
