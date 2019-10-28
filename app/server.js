const spawn = require('child_process').spawn;

module.exports = class Server {
    constructor(jarPath) {
        console.log('Starting Minecraft!\n');
        this.startServer(jarPath);

        // Root commands
        this.homeHandler = require('./commands/home');

        // Data Handlers
        Object.entries(require('./data')).forEach(([key, func]) => {
            this[key] = func.bind(this);
        });
    }

    startServer(jarPath) {
        let workingDir = './server';
        this.serverProcess = spawn('java', [
            '-Xmx4096M',
            '-Xms1024M',
            '-jar',
            jarPath.replace(workingDir, '.'),
            'nogui',
        ], { cwd: workingDir });

        this.serverProcess.stdout.on('data', this.log.bind(this));
        this.serverProcess.stderr.on('data', this.log.bind(this));

        process.stdin.setEncoding('utf8');
        // This handles manual input to the console and passes it forward to minecraft
        process.stdin.on('readable', () => {
            let chunk;
            // Use a loop to make sure we read all available data.
            while ((chunk = process.stdin.read()) !== null) {
                this.write(chunk);
            }
        });

        // Make sure the Minecraft server dies with this process
        process.on('exit', () => {
            console.warn('Killing minecraft.');
            this.serverProcess.kill();
        });
    }

    /*
     * Handling Input
     */
    write(command) {
        this.serverProcess.stdin.write(command);
    };

    writeToMine(command) {
        this.write(command + '\n');
    };

    /*
     * Handling Output
     */
    log(data) {
        let text = data.toString();
        process.stdout.write(text);

        // listens for ! commands
        if (/<\w+>\s!/.test(text)) return this.handleCommand(text);

        // lets us know when someone logs into the server
        let authReg = /.*UUID\sof\splayer\s(\w+)\sis\s((\w|\d){8}-(\w|\d){4}-(\w|\d){4}-(\w|\d){4}-(\w|\d){12}).*/;
        if (authReg.test(text)) {
            let [playerName, UUID] = text.replace(authReg, '$1+_+$2').split('+_+');
            console.log(`${playerName} logged in and has UUID of ${UUID}`);
            this.handlePlayerLogin(playerName, UUID)
        }
    };

    handleCommand(text) {
        let playerName = text.replace(/.*<(\w+)>.*/, '$1').trim(),
            commands = text.replace(/\[(\d\d:){2}\d\d\]\s\[\w+\s\w+\/\w+\]:\s<\w+>\s\!/, '')
                .split(' ')
                .map(t => t.trim()),
            baseCommand = commands[0],
            args = commands.slice(1);

        (() => {
            switch (baseCommand) {
                case 'home':
                    return this.homeHandler(playerName, args);
                case 'warp':
                    return this.homeHandler(playerName, args);
                default:
                    return;
            }
        })();

    }

    /*
     * Entity getting & handling
     */
    parseEntityData(rawString) {
        // Converting data structure to Javascript.
        let entityStr = rawString.split(' ').map((t) => {
            // ints and bools
            if (/\d+b/.test(t)) return t.replace(/(\d+)b/, '$1');

            // seconds to number
            let secondsReg = /(\d+)s/;
            if (secondsReg.test(t)) return t.replace(secondsReg, '$1');

            //floats / doubles
            if (/\d+\.\d*(d|f)/.test(t)) {
                return t.split('.')
                    .map((str, i) => {
                        if (i === 1) {
                            return str.replace(/(.*)(\d+)(.*)/, '$1 $2 $3')
                                .split(' ')
                                .map(d => /\d+/.test(d) ? d.substr(0, 3) : d)
                                .join('');
                        }
                        return str;
                    }).join('.')
                    .replace(/d|f/, '');
            }

            // Weird L?
            if (/(-{0,1}\d+)L/.test(t)) return t.replace(/(-{0,1}\d+)L/, '"$1"');

            // Default
            return t;
        }).join(' ');

        return eval(`(${entityStr})`);
    }

    getPlayerPosition(playerName) {
        return new Promise((resolve) => {
            const listenForPosition = (data) => {
                let text = data.toString();

                if (!(/has\sthe\sfollowing\sentity\sdata:/).test(text)) return;
                this.serverProcess.stdout.removeListener('data', listenForPosition);
                let rawEntityText = text.split('entity data: ')[1];
                let position = this.parseEntityData(rawEntityText);

                resolve(position);
            };

            this.serverProcess.stdout.on('data', listenForPosition);

            this.writeToMine(`data get entity ${playerName} Pos`);
        });
    }

    getPlayerRotation(player) {
        return new Promise((resolve) => {
            const listenForRotation = (data) => {
                let text = data.toString();

                if (!(/has\sthe\sfollowing\sentity\sdata:/).test(text)) return;
                this.serverProcess.stdout.removeListener('data', listenForRotation);
                let rawEntityText = text.split('entity data: ')[1];
                let rotation = this.parseEntityData(rawEntityText);

                resolve(rotation);
            };

            this.serverProcess.stdout.on('data', listenForRotation);

            this.writeToMine(`data get entity ${player} Rotation`);
        });
    }
};
