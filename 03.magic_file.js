const { exec } = require("child_process");
const MyBuffer = require("./01.buffer.js");
const FileSystem = require("./02.filesystem.js");
const { getCommandFileName } = require("./utils/index.js");

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
    const requests = parseHttpRequest(content);
    console.log(requests);
    for (const request of requests) {
      await handleHttpRequest(request);
    }

    function parseHttpRequest(request) {
      const requests = request.split("###");
      const parsedRequests = [];

      for (const req of requests) {
        const lines = req.trim().split("\n");

        if (lines.length === 0) continue; // Skip empty requests

        // Extract the request line (first line)
        const requestLine = lines[0].trim();
        let [method, url, protocol] = requestLine.split(" ");

        // Default protocol if not provided
        const defaultProtocol = "HTTP/1.1";
        if (!protocol) {
          protocol = defaultProtocol;
        }

        // Initialize headers and body
        const headers = {};
        let body = "";
        let isBody = false;

        // Iterate through the lines to extract headers and body
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();

          if (line === "") {
            // Empty line indicates the start of the body
            isBody = true;
            continue;
          }

          if (isBody) {
            // If we are in the body section, accumulate the body content
            body += line + " "; // Use space instead of newline
          } else {
            // Split header lines into key-value pairs
            const [key, value] = line.split(/:\s+/);
            if (key && value) {
              headers[key] = value;
            }
          }
        }

        // Remove any trailing spaces from the body and parse JSON
        body = body.trim();

        try {
          // Parse JSON to remove escape characters and format correctly
          body = JSON.parse(body);
        } catch (e) {
          console.error("Failed to parse JSON body:", e);
        }

        // Push parsed components into the array
        parsedRequests.push({ method, url, protocol, headers, body });
      }

      return parsedRequests;
    }

    async function handleHttpRequest({ method, url, headers, body }) {
      let requestBody = body;
  
      // Check if body is a file reference like "< ./demo.xml"
      if (typeof body === 'string' && body.startsWith("<")) {
          const filePath = body.slice(1).trim();
          try {
              requestBody = await FileSystem.readFile(filePath, "utf8");
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
          body: ["POST", "PUT", "PATCH"].includes(methodUpper)
              ? JSON.stringify(requestBody) // Ensure it's a string
              : undefined,
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
