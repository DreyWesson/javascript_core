const { exec } = require('child_process');
const MyBuffer = require("./01.buffer.js");
const FileSystem = require("./02.filesystem.js");
const { getCommandFileName } = require("./utils/index.js");
// const fetch = require('node-fetch'); // Ensure you have node-fetch installed

(async function () {
  const filePath = await getCommandFileName();

  await FileSystem.createFile(filePath);
  FileSystem.fileWatcher(filePath, { type: "change" }, cb);

  function splitOnFirstSpace(str) {
    const index = str.indexOf(" ");

    if (index === -1) {
      return [str];
    }

    const firstPart = str.slice(0, index);
    const secondPart = str.slice(index + 1);

    return [firstPart, secondPart];
  }

  async function cb() {
    const buffer = await FileSystem.readFile(filePath);
    const content = (await MyBuffer.getData(buffer)).utf8;

    if (content.length < 2) return;

    const actions = {
      CREATE_FILE: "create a file",
      DELETE_FILE: "delete a file",
      RENAME_FILE: "rename a file",
      ADD_TO_FILE: "add to file",
      OPEN_URL: "url",
      CALCULATE: "calculate",
    };

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

    if (content.startsWith(actions.CALCULATE)) {
      const expression = content.substr(actions.CALCULATE.length).trim();
      exec(`echo "${expression}" | bc`, (error, stdout) => {
        if (error) {
          console.error(`Error calculating: ${error.message}`);
        } else {
          console.log(`Result: ${stdout}`);
        }
      });
    }

    // New Functionality for RESTful Calls
    const requests = parseRequests(content);
    
    for (const request of requests) {
      await handleHttpRequest(request);
    }

    function parseRequests(content) {
      // Split requests by double newlines for multi-request files
      const requestBlocks = content.split(/\n\n+/);
      return requestBlocks.map(block => {
        const lines = block.split('\n');
        const [method, url] = lines[0].split(' ');

        const headers = {};
        let body = '';
        let isBody = false;

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (isBody) {
            body += line + '\n';
          } else if (line === '') {
            isBody = true;
          } else {
            const [key, value] = line.split(/:\s*/);
            headers[key] = value;
          }
        }

        return { method, url, headers, body: body.trim() };
      });
    }

    async function handleHttpRequest({ method, url, headers, body }) {
      let requestBody = body;

      // Check if body is a file reference like "< ./demo.xml"
      if (body.startsWith('<')) {
        const filePath = body.slice(1).trim();
        try {
          requestBody = await FileSystem.readFile(filePath, 'utf8');
        } catch (err) {
          console.error(`Error reading file ${filePath}: ${err.message}`);
          return;
        }
      }

      const methodUpper = method.toUpperCase();

      // Prepare request options
      const requestOptions = {
        method: methodUpper,
        headers,
        // Include body only for methods that allow it
        body: ['POST', 'PUT', 'PATCH'].includes(methodUpper) ? requestBody : undefined,
      };

      try {
        const response = await fetch(url, requestOptions);
        const responseData = await response.text();
        console.log(`Response from ${methodUpper} ${url}:`, responseData);
      } catch (error) {
        console.error(`Error during HTTP request: ${error.message}`);
      }
    }
  }
})().catch(console.error);













// const { exec } = require('child_process');
// const MyBuffer = require("./01.buffer.js");
// const FileSystem = require("./02.filesystem.js");
// const { getCommandFileName } = require("./utils/index.js");

// (async function () {
//   const filePath = await getCommandFileName();

//   await FileSystem.createFile(filePath);
//   FileSystem.fileWatcher(filePath, { type: "change" }, cb);

//   function splitOnFirstSpace(str) {
//     const index = str.indexOf(" ");

//     if (index === -1) {
//       return [str];
//     }

//     const firstPart = str.slice(0, index);
//     const secondPart = str.slice(index + 1);

//     return [firstPart, secondPart];
//   }

//   async function cb() {
//     const buffer = await FileSystem.readFile(filePath);
//     const content = (await MyBuffer.getData(buffer)).utf8;

//     if (content.length < 2) return;

//     const actions = {
//       CREATE_FILE: "create a file",
//       DELETE_FILE: "delete a file",
//       RENAME_FILE: "rename a file",
//       ADD_TO_FILE: "add to file",
//       OPEN_URL: "url",
//       CALCULATE: "calculate",
//     };

//     if (content.includes(actions.CREATE_FILE)) {
//       const filename = content.substr(actions.CREATE_FILE.length).trim();
//       await FileSystem.createFile(filename);
//     }

//     if (content.includes(actions.DELETE_FILE)) {
//       const filename = content.substr(actions.DELETE_FILE.length).trim();
//       await FileSystem.deleteFile(filename);
//     }

//     if (content.includes(actions.RENAME_FILE)) {
//       const filename = content.substr(actions.RENAME_FILE.length).trim();
//       const [oldname, newname] = filename.split(" ");
//       await FileSystem.renameFile(oldname.trim(), newname.trim());
//     }

//     if (content.includes(actions.ADD_TO_FILE)) {
//       const rest = content.substr(actions.ADD_TO_FILE.length).trim();
//       const [filename, new_content] = splitOnFirstSpace(rest);
//       await FileSystem.addToFile(filename, new_content);
//     }

//     if (content.startsWith(actions.CALCULATE)) {
//       const expression = content.substr(actions.CALCULATE.length).trim();
//       exec(`echo "${expression}" | bc`, (error, stdout) => {
//         if (error) {
//           console.error(`Error calculating: ${error.message}`);
//         } else {
//           console.log(`Result: ${stdout}`);
//         }
//       });
//     }

//     function parseRequests(content) {
//       // Split requests by double newlines for multi-request files
//       const requestBlocks = content.split(/\n\n+/);
//       return requestBlocks.map(block => {
//         const lines = block.split('\n');
//         const [method, url] = lines[0].split(' ');
  
//         const headers = {};
//         let body = '';
//         let isBody = false;
  
//         for (let i = 1; i < lines.length; i++) {
//           const line = lines[i].trim();
//           if (isBody) {
//             body += line + '\n';
//           } else if (line === '') {
//             isBody = true;
//           } else {
//             const [key, value] = line.split(/:\s*/);
//             headers[key] = value;
//           }
//         }
  
//         return { method, url, headers, body: body.trim() };
//       });
//     }
  
//     async function handleHttpRequest({ method, url, headers, body }) {
//       let requestBody = body;
    
//       // Check if body is a file reference like "< ./demo.xml"
//       if (body.startsWith('<')) {
//         const filePath = body.slice(1).trim();
//         try {
//           requestBody = await fs.readFile(filePath, 'utf8');
//         } catch (err) {
//           console.error(`Error reading file ${filePath}: ${err.message}`);
//           return;
//         }
//       }
    
//       const methodUpper = method.toUpperCase();
    
//       // Prepare request options
//       const requestOptions = {
//         method: methodUpper,
//         headers,
//         // Include body only for methods that allow it
//         body: ['POST', 'PUT', 'PATCH'].includes(methodUpper) ? requestBody : undefined,
//       };
    
//       try {
//         const response = await fetch(url, requestOptions);
//         const responseData = await response.text();
//         console.log(`Response from ${methodUpper} ${url}:`, responseData);
//       } catch (error) {
//         console.error(`Error during HTTP request: ${error.message}`);
//       }
//     }
    
//   }
// })().catch(console.error);




// const MyBuffer = require("./01.buffer.js");
// const FileSystem = require("./02.filesystem.js");
// const { getCommandFileName } = require("./utils/index.js");

// (async function () {
//   const filePath = await getCommandFileName();

//   await FileSystem.createFile(filePath);
//   FileSystem.fileWatcher(filePath, { type: "change" }, cb);

//   function splitOnFirstSpace(str) {
//     const index = str.indexOf(" ");

//     if (index === -1) {
//       return [str];
//     }

//     const firstPart = str.slice(0, index);
//     const secondPart = str.slice(index + 1);

//     return [firstPart, secondPart];
//   }

//   async function cb() {
//     const buffer = await FileSystem.readFile(filePath);
//     const content = (await MyBuffer.getData(buffer)).utf8;

//     if (content.length < 2) return;

//     const actions = {
//       CREATE_FILE: "create a file",
//       DELETE_FILE: "delete a file",
//       RENAME_FILE: "rename a file",
//       ADD_TO_FILE: "add to file",
//     };

//     if (content.includes(actions.CREATE_FILE)) {
//       const filename = content.substr(actions.CREATE_FILE.length);
//       await FileSystem.createFile(filename.trim());
//     }

//     if (content.includes(actions.DELETE_FILE)) {
//       const filename = content.substr(actions.DELETE_FILE.length);
//       await FileSystem.deleteFile(filename.trim());
//     }

//     if (content.includes(actions.RENAME_FILE)) {
//       const filename = content.substr(actions.RENAME_FILE.length);
//       const [oldname, newname] = filename.trim().split(" ");
//       await FileSystem.renameFile(oldname.trim(), newname.trim());
//     }

//     if (content.includes(actions.ADD_TO_FILE)) {
//       const rest = content.substr(actions.ADD_TO_FILE.length);
//       const [filename, new_content] = splitOnFirstSpace(rest.trim());

//       await FileSystem.addToFile(filename, new_content);
//     }
//   }
// })().catch(console.error);
