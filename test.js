// function parseHttpRequest(request) {
//     const lines = request.split('\n');
    
//     // Extract the request line (first line)
//     const requestLine = lines[0].trim();
//     const [method, url] = requestLine.split(' ');

//     // Initialize headers and body
//     const headers = {};
//     let body = '';
//     let isBody = false;

//     // Iterate through the lines to extract headers and body
//     for (let i = 1; i < lines.length; i++) {
//         const line = lines[i].trim();

//         if (line === '') {
//             // Empty line indicates the start of the body
//             isBody = true;
//             continue;
//         }

//         if (isBody) {
//             // If we are in the body section, accumulate the body content
//             body += line + '\n';
//         } else {
//             // Split header lines into key-value pairs
//             const [key, value] = line.split(/:\s+/);
//             if (key && value) {
//                 headers[key] = value;
//             }
//         }
//     }

//     // Return parsed components
//     return { method, url, headers, body: body.trim() };
// }

// // Example usage:
// const httpRequest = `POST https://jsonplaceholder.typicode.com/posts
// Content-Type: application/json

// {
//   "title": "foo",
//   "body": "bar",
//   "userId": 1
// }`;

// const parsedRequest = parseHttpRequest(httpRequest);
// console.log(parsedRequest);


// function parseHttpRequest(request) {
//     const lines = request.split('\n');

//     // Extract the request line (first line)
//     const requestLine = lines[0].trim();
//     let [method, url, protocol] = requestLine.split(' ');

//     // Default protocol if not provided
//     const defaultProtocol = 'HTTP/1.1';
//     if (!protocol) {
//         protocol = defaultProtocol;
//     }

//     // Initialize headers and body
//     const headers = {};
//     let body = '';
//     let isBody = false;

//     // Iterate through the lines to extract headers and body
//     for (let i = 1; i < lines.length; i++) {
//         const line = lines[i].trim();

//         if (line === '') {
//             // Empty line indicates the start of the body
//             isBody = true;
//             continue;
//         }

//         if (isBody) {
//             // If we are in the body section, accumulate the body content
//             body += line + '\n';
//         } else {
//             // Split header lines into key-value pairs
//             const [key, value] = line.split(/:\s+/);
//             if (key && value) {
//                 headers[key] = value;
//             }
//         }
//     }

//     return { method, url, protocol, headers, body: body.trim() };
// }

// // Example usage:
// const httpRequest1 = `POST https://jsonplaceholder.typicode.com/posts HTTP/1.1
// Content-Type: application/json

// {
//   "title": "foo",
//   "body": "bar",
//   "userId": 1
// }`;

// const httpRequest2 = `GET example.com/resource
// Authorization: Bearer token123

// {"key": "value"}`;

// const parsedRequest1 = parseHttpRequest(httpRequest1);
// console.log(parsedRequest1);

// const parsedRequest2 = parseHttpRequest(httpRequest2);
// console.log(parsedRequest2);


// function parseHttpRequest(request) {
//     const requests = request.split('###'); // Split requests by the delimiter
//     const parsedRequests = [];

//     for (const req of requests) {
//         const lines = req.trim().split('\n');

//         if (lines.length === 0) continue; // Skip empty requests

//         // Extract the request line (first line)
//         const requestLine = lines[0].trim();
//         let [method, url, protocol] = requestLine.split(' ');

//         // Default protocol if not provided
//         const defaultProtocol = 'HTTP/1.1';
//         if (!protocol) {
//             protocol = defaultProtocol;
//         }

//         // Initialize headers and body
//         const headers = {};
//         let body = '';
//         let isBody = false;

//         // Iterate through the lines to extract headers and body
//         for (let i = 1; i < lines.length; i++) {
//             const line = lines[i].trim();

//             if (line === '') {
//                 // Empty line indicates the start of the body
//                 isBody = true;
//                 continue;
//             }

//             if (isBody) {
//                 // If we are in the body section, accumulate the body content
//                 body += line + '\n';
//             } else {
//                 // Split header lines into key-value pairs
//                 const [key, value] = line.split(/:\s+/);
//                 if (key && value) {
//                     headers[key] = value;
//                 }
//             }
//         }

//         // Push parsed components into the array
//         parsedRequests.push({ method, url, protocol, headers, body: body.trim() });
//     }

//     return parsedRequests;
// }

// // Example usage:
// const httpRequests = `GET https://example.com/comments?page=2&size=10 HTTP/1.1
// Authorization: Bearer token123

// {"key": "value"}

// ###

// POST example.com/api/data
// Content-Type: application/json

// {
//   "data": "example"
// }`;

// const parsedRequests = parseHttpRequest(httpRequests);
// console.log(parsedRequests);


// function parseHttpRequest(request) {
//     const requests = request.split('###'); // Split requests by the delimiter
//     const parsedRequests = [];

//     for (const req of requests) {
//         const lines = req.trim().split('\n');

//         if (lines.length === 0) continue; // Skip empty requests

//         // Extract the request line (first line)
//         const requestLine = lines[0].trim();
//         let [method, url, protocol] = requestLine.split(' ');

//         // Default protocol if not provided
//         const defaultProtocol = 'HTTP/1.1';
//         if (!protocol) {
//             protocol = defaultProtocol;
//         }

//         // Initialize headers and body
//         const headers = {};
//         let body = '';
//         let isBody = false;

//         // Iterate through the lines to extract headers and body
//         for (let i = 1; i < lines.length; i++) {
//             const line = lines[i].trim();

//             if (line === '') {
//                 // Empty line indicates the start of the body
//                 isBody = true;
//                 continue;
//             }

//             if (isBody) {
//                 // If we are in the body section, accumulate the body content
//                 body += line + ' '; // Use space instead of newline
//             } else {
//                 // Split header lines into key-value pairs
//                 const [key, value] = line.split(/:\s+/);
//                 if (key && value) {
//                     headers[key] = value;
//                 }
//             }
//         }

//         // Remove any trailing spaces from the body
//         body = body.trim();

//         // Push parsed components into the array
//         parsedRequests.push({ method, url, protocol, headers, body });
//     }

//     return parsedRequests;
// }

// // Example usage:
// const httpRequests = `GET https://example.com/comments?page=2&size=10 HTTP/1.1
// Authorization: Bearer token123

// {"key": "value"}

// ###

// POST example.com/api/data
// Content-Type: application/json

// {
//   "data": "example"
// }`;

// const parsedRequests = parseHttpRequest(httpRequests);
// console.log(JSON.stringify(parsedRequests, null, 2));


function parseHttpRequest(request) {
    const requests = request.split('###');
    const parsedRequests = [];

    for (const req of requests) {
        const lines = req.trim().split('\n');

        if (lines.length === 0) continue; // Skip empty requests

        // Extract the request line (first line)
        const requestLine = lines[0].trim();
        let [method, url, protocol] = requestLine.split(' ');

        // Default protocol if not provided
        const defaultProtocol = 'HTTP/1.1';
        if (!protocol) {
            protocol = defaultProtocol;
        }

        // Initialize headers and body
        const headers = {};
        let body = '';
        let isBody = false;

        // Iterate through the lines to extract headers and body
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();

            if (line === '') {
                // Empty line indicates the start of the body
                isBody = true;
                continue;
            }

            if (isBody) {
                // If we are in the body section, accumulate the body content
                body += line + ' '; // Use space instead of newline
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

// Example usage:
const httpRequests = `GET https://example.com/comments?page=2&size=10 HTTP/1.1
Authorization: Bearer token123

{"key": "value"}

###

POST example.com/api/data
Content-Type: application/json

{
  "data": "example"
}`;

const parsedRequests = parseHttpRequest(httpRequests);
console.log(JSON.stringify(parsedRequests, null, 2));