const isHttpRequest = (request) => {
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

function parseHttpRequest(request) {
  const lines = request.split(/\r?\n/);
  const parsedRequests = [];
  let method, url, protocol = "HTTP/1.1"; // Default protocol
  const headers = {};
  let bodyLines = [];
  let state = "REQUEST_LINE";

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (state === "REQUEST_LINE") {
      if (!trimmedLine) continue; // Skip empty lines before request line
      [method, url, protocol] = trimmedLine.split(" ");
      state = "HEADERS";
    } else if (state === "HEADERS") {
      if (trimmedLine === "") {
        // An empty line indicates the end of headers, move to BODY state
        state = "BODY";
      } else {
        const [key, value] = trimmedLine.split(/:\s+/);
        headers[key] = value;
      }
    } else if (state === "BODY") {
      // If we encounter another request line, finalize the current request
      if (/^(GET|POST|PUT|DELETE|PATCH|OPTIONS|HEAD)/.test(trimmedLine)) {
        parsedRequests.push({
          method,
          url,
          protocol,
          headers: { ...headers },
          body: parseBody(bodyLines.join("\n"), headers)
        });

        // Reset for the next request
        method = url = protocol = "";
        bodyLines = [];
        Object.keys(headers).forEach((key) => delete headers[key]);

        [method, url, protocol] = trimmedLine.split(" ");
        protocol = protocol || "HTTP/1.1";
        state = "HEADERS";
      } else {
        // Accumulate body lines
        bodyLines.push(trimmedLine);
      }
    }
  }

  // Add the last request if it exists
  if (method && url) {
    parsedRequests.push({
      method,
      url,
      protocol,
      headers,
      body: parseBody(bodyLines.join("\n"), headers)
    });
  }

  return parsedRequests;
}

function parseBody(body, headers) {
  const contentType = headers["Content-Type"] || headers["content-type"];
  if (contentType && contentType.includes("application/json")) {
    try {
      return JSON.parse(body);
    } catch (e) {
      console.error("Failed to parse JSON body:", e.message);
    }
  }
  return body.trim();
}

module.exports = { parseHttpRequest, isHttpRequest };
