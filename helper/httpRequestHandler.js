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
        body: ["POST", "PUT", "PATCH"].includes(methodUpper)
            ? JSON.stringify(requestBody)
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

module.exports = { handleHttpRequest };