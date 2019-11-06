const spawn = require('child_process').spawn;

/*
* This is where We combine all of the classes into one
* */
class OtherClasses {}

OtherClasses = require('./data')(OtherClasses);
OtherClasses = require('./lib/cooldown')(OtherClasses);
OtherClasses = require('./lib/entity')(OtherClasses);

// Command imports
OtherClasses = require('./commands/home')(OtherClasses);
OtherClasses = require('./commands/warp')(OtherClasses);

const isDev = process.env.NODE_ENV === 'development';

module.exports = class Server extends OtherClasses {
    constructor(jarPath) {
        super();
        console.log('Starting Minecraft!');
        console.log(`isDev: ${isDev}\n`);
        this.startServer(jarPath);
    }

    startServer(jarPath) {
        let workingDir = './server';
        this.serverProcess = spawn('java', [
            isDev ? '-Xmx1024M' : '-Xmx4096M',
            isDev ? '-Xms512M' : '-Xms1024M',
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

        this.serverExitSetup();
    }

    serverExitSetup() {
        let hasExitedMinecraft = false;

        // Make sure the Minecraft server dies with this process hopefully gracefully
        const handleTerm = async () => {
            if (hasExitedMinecraft) return;

            this.writeToMine('Server is shutting down');

            await this.shutdownServer();
        };
        process.on('SIGINT', handleTerm);
        process.on('SIGTERM', handleTerm);


        // Listens for Minecraft server having exited and shuts down node js
        // We do this so docker will restart the server
        const childShutdownListener = () => {
            hasExitedMinecraft = true;

            console.log('stopping node because minecraft stopped');
            process.exit();
        };
        this.serverProcess.on('exit', childShutdownListener);
    }

    shutdownServer() {
        return new Promise((resolve) => {
            const savedWolds = new Set();

            const shutdownListener = (data) => {
                const text = data.toString();

                if (/All\schunks\sare\ssaved/.test(text)) {
                    let world = text.replace(/.*\(([\w-]+)\).*/, '$1').trim();
                    world.length < 10 ? savedWolds.add(world) : null;
                }

                if (savedWolds.size >= 3) {
                    resolve();
                }
            };

            this.serverProcess.stdout.on('data', shutdownListener);
            this.writeToMine('stop');
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
            return this.handlePlayerLogin(playerName, UUID);
        }
        let logoutReg = /(\w+)\sleft\sthe\sgame/;
        if (logoutReg.test(text)) {
            let playerName = text.replace(logoutReg, '$1');
            return this.handlePlayerLogout(playerName);
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
            switch (baseCommand.toLowerCase()) {
                case 'home':
                    return this.handleHome(playerName, args);
                case 'warp':
                    return this.handleWarp(playerName, args);
                default:
                    return;
            }
        })();

    }
};
