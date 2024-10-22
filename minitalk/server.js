const net = require('net');

let currentChar = 0;
let bitCount = 0;

function binToChar(bin) {
    return String.fromCharCode(parseInt(bin, 2));
}

function handleBit(bit, socket) {
    currentChar = (currentChar << 1) | bit;
    bitCount++;

    if (bitCount === 8) {
        if (currentChar === 0) {
            console.log('\nMessage received completely.');
            socket.write('complete');
            currentChar = 0;
            bitCount = 0;
            return true;
        }
        process.stdout.write(binToChar(currentChar.toString(2).padStart(8, '0')));
        currentChar = 0;
        bitCount = 0;
    }
    socket.write('ack');
    return false;
}

const server = net.createServer((socket) => {
    console.log('Client connected');

    socket.on('data', (data) => {
        const bit = parseInt(data.toString());
        handleBit(bit, socket);
    });

    socket.on('end', () => {
        console.log('Client disconnected');
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Server PID:', process.pid);
});