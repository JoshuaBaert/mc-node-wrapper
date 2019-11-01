require('dotenv').config();
const killPort = process.env.KILL_PORT;

const io = require('socket.io')
    , server = io.listen(killPort);

const jarCheck = require('./jar-check');
const Server = require('./app/server');

let mcServer;

jarCheck().then((jarPath) => {
    mcServer = new Server(jarPath);
}).catch((error) => {
    console.error(error);
});


server.on('connection', (socket) => {
    socket.on('kill', async function (data) {
        await mcServer.shutdownServer();
        socket.emit('killed');
        setTimeout(function () {
            process.exit(0);
        }, 5000);
    });
});
