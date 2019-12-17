require('dotenv').config();
const killPort = process.env.KILL_PORT;

const io = require('socket.io')
    , server = io.listen(killPort);
const CronJob = require('cron').CronJob;
const fs = require('fs');

const jarCheck = require('./jar-check');
const Server = require('./app/server');
const backup = require('./scripts/backup');

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


if (!fs.existsSync(`./backups`)) fs.mkdirSync(`./backups/`);

// Mon - Sat at 4am
let shortCronTime = '0 0 4 * * 1-6';
// Sun at 4am each week
let longCronTime = '0 0 4 * * 0';

new CronJob(
    shortCronTime,
    async () => {
        await mcServer.saveServer();
        await backup('server', './backups/short', 12);
    },
    null,
    true,
    'America/Boise',
);

new CronJob(
    longCronTime,
    async () => {
        await mcServer.saveServer();
        await backup('server', './backups/long', 12);
    },
    null,
    true,
    'America/Boise',
);
