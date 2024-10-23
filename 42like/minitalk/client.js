const net = require('net');

function charToBin(char) {
    return char.charCodeAt(0).toString(2).padStart(8, '0');
}

async function sendChar(socket, char) {
    return new Promise((resolve, reject) => {
        const bin = charToBin(char);
        let bitIndex = 0;

        function sendBit() {
            if (bitIndex < 8) {
                socket.write(bin[bitIndex]);
                socket.once('data', (data) => {
                    const ack = data.toString();
                    if (ack === 'ack' || ack === 'complete') {
                        bitIndex++;
                        sendBit();
                    } else {
                        reject(new Error('Unexpected server response'));
                    }
                });
            } else {
                resolve();
            }
        }

        sendBit();
    });
}

async function main() {
    if (process.argv.length !== 3) {
        console.log(`You need to pass 1 arg but you passed ${process.argv.length - 2}`);
        process.exit(1);
    }

    const message = process.argv[2];
    const socket = new net.Socket();

    socket.connect(3000, 'localhost', async () => {
        console.log('Connected to server');

        try {
            for (let char of message) {
                await sendChar(socket, char);
            }
            await sendChar(socket, '\0');

            socket.once('data', (data) => {
                if (data.toString() === 'complete') {
                    console.log('Message sent successfully');
                    socket.end();
                }
            });
        } catch (error) {
            console.error('Error:', error.message);
            socket.destroy();
        }
    });

    socket.on('close', () => {
        console.log('Connection closed');
    });

    socket.on('error', (error) => {
        console.error('Socket error:', error.message);
    });
}

main().catch(console.error);