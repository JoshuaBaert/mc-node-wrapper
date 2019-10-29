const spawn = require('child_process').spawn;


/*
* This is where We combine all of the classes into one
* */
class OtherClasses {}
OtherClasses = require('./commands/home')(OtherClasses);
OtherClasses = require('./commands/warp')(OtherClasses);
OtherClasses = require('./data')(OtherClasses);
OtherClasses = require('./lib/cooldown')(OtherClasses);
OtherClasses = require('./lib/entity')(OtherClasses);

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
            this.handlePlayerLogin(playerName, UUID);
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
};
