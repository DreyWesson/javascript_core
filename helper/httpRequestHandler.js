const { isHttpRequest, parseHttpRequest } = require("../utils");

async function handleHttpRequest({ method, url, headers, body }) {
    let requestBody = body;

    // Check if body is a file reference like "< ./demo.xml"
    if (typeof body === "string" && body.startsWith("<")) {
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
async function handleAllRequests(content) {
  const requests = parseHttpRequest(content);

  for (const request of requests) {
    if (isHttpRequest(request)) {
      await handleHttpRequest(request);
    } else {
      console.log("Not a valid HTTP request:", request);
    }
  }
}

module.exports = { handleHttpRequest, handleAllRequests};