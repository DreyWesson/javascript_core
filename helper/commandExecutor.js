const { exec } = require("child_process");

function executeCommand(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(`Error executing command: ${error.message}`);
                return;
            }
            if (stderr) {
                reject(`Command error output: ${stderr}`);
                return;
            }
            resolve(stdout);
        });
    });
}

module.exports = { executeCommand };