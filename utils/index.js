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

exports.isHttpRequest = (request) => {
  const httpMethods = [
    "GET",
    "POST",
    "PUT",
    "DELETE",
    "PATCH",
    "OPTIONS",
    "HEAD",
  ];
  return httpMethods.includes(request.method.toUpperCase());
}

exports.parseHttpRequest = (request) => {
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

    // Remove any trailing spaces from the body
    body = body.trim();

    // Determine how to parse based on Content-Type
    const contentType = headers["Content-Type"] || headers["content-type"];

    try {
      if (contentType && contentType.includes("application/json")) {
        // Parse JSON only if Content-Type indicates JSON
        body = JSON.parse(body);
      } else if (!body) {
        console.warn("Empty body; skipping JSON parsing.");
      }
    } catch (e) {
      console.error("Failed to parse JSON body:", e.message);
      continue; // Skip this request if parsing fails
    }

    // Push parsed components into the array
    parsedRequests.push({ method, url, protocol, headers, body });
  }

  return parsedRequests;
}
