var { exec } = require("child_process");

async function nodeShellExecutor(scriptCall) {
  return new Promise((resolve, reject) => {
    	exec(scriptCall, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      }
      resolve(stdout);
    });
  });
}

module.exports = {nodeShellExecutor}