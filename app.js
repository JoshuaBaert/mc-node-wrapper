const spawn = require('child_process').spawn;

const jarCheck = require('./jar-check');

async function startServer() {
    jarCheck().then((jarPath) => {
        console.log('from main ' + jarPath);
    }).catch((error) => {
        console.error(error);
    });
}

startServer();

