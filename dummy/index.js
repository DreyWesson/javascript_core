// index.js

const http = require('http');

const port = 3000;

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hello, World! This server is running with nodemon-like functionality.');
});

server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});

// Add a console log that will change each time you edit the file
console.log('Server started at:', new Date().toLocaleString());

// This function is here just to demonstrate changes
function getRandomMessage() {
    const messages = [
        "The server is feeling great!",
        "Another change, another restart!",
        "Nodemon is awesome!",
        "Keep coding, keep improving!",
        "Changes detected, server restarted!"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
}

console.log(getRandomMessage());