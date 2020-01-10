require('dotenv').config();
const killPort = process.env.KILL_PORT;

const io = require('socket.io-client')
    , client = io.connect(`http://localhost:${killPort}`);

client.on('killed', function () {
    console.info('killed');
    process.exit(0)
});

client.emit('kill');
