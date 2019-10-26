const jarCheck = require('./jar-check');
const Server = require('./app/server');

jarCheck().then((jarPath) => {
    let server = new Server(jarPath);
}).catch((error) => {
    console.error(error);
});

