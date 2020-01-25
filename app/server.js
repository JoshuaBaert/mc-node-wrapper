const isDev = process.env.NODE_ENV === 'development';

/**
 * This is where We combine all of the classes into one
 */
class OtherClasses {
}

OtherClasses = require('./data')(OtherClasses);
OtherClasses = require('./lib/cooldown')(OtherClasses);
OtherClasses = require('./lib/entity')(OtherClasses);
OtherClasses = require('./lib/experience')(OtherClasses);
OtherClasses = require('./lib/tell')(OtherClasses);
OtherClasses = require('./lib/server-management')(OtherClasses);
OtherClasses = require('./lib/xpAutostore')(OtherClasses);

// Help needs to be first command to setup structure
OtherClasses = require('./commands/help')(OtherClasses);

// Command imports
OtherClasses = require('./commands/home')(OtherClasses);
OtherClasses = require('./commands/location')(OtherClasses);
OtherClasses = require('./commands/warp')(OtherClasses);
OtherClasses = require('./commands/xp')(OtherClasses);

module.exports = class Server extends OtherClasses {
    constructor(jarPath) {
        super();
        console.info('Starting Minecraft!');
        console.info(`isDev: ${isDev}\n`);
        this.startServer(jarPath);
    }

    serverExitSetup() {
        let hasExitedMinecraft = false;

        // Make sure the Minecraft server dies with this process hopefully gracefully
        const handleTerm = async () => {
            if (hasExitedMinecraft) return;
            await this.shutdownServer();
        };
        process.on('SIGINT', handleTerm);
        process.on('SIGTERM', handleTerm);


        // Listens for Minecraft server having exited and shuts down node js
        // We do this so docker will restart the server
        const childShutdownListener = () => {
            hasExitedMinecraft = true;

            console.info('stopping node because minecraft stopped');
            process.exit(0);
        };
        this.serverProcess.on('exit', childShutdownListener);

        // in case its killed anyways shutdown Minecraft
        process.on('exit', () => {
            if (hasExitedMinecraft) return;
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
        let authReg = /.*UUID\sof\splayer\s(\w+)\sis\s([\w]{8}-[\w]{4}-[\w]{4}-[\w]{4}-[\w]{12}).*/;
        if (authReg.test(text)) {
            let [playerName, uuid] = text.replace(authReg, '$1-_-$2')
                .split('-_-')
                .map(x => x.trim());
            return this.handlePlayerLogin(playerName, uuid);
        }
    };

    handleCommand(text) {
        let playerName = text.replace(/.*<(\w+)>.*/, '$1').trim(),
            commands = text.replace(/^.*<\w+>\s!/, '')
                .split(' ').map(t => t.trim()),
            baseCommand = commands[0],
            args = commands.slice(1);

        (async () => {
            switch (baseCommand.toLowerCase()) {
            case 'help':
                return this.handleHelp(playerName, args);
            case 'home':
                return this.handleHome(playerName, args);
            case 'warp':
                return this.handleWarp(playerName, args);
            case 'location':
                return this.handleLocation(playerName, args);
            case 'locations':
                return this.handleLocations(playerName, args);
            case 'xp':
                return this.handleXp(playerName, args);
            case 'test': 
                return this.storePlayersXpAutoStoreTrue();

            default:
                // dev color helper
                if (isDev && baseCommand.toLowerCase() === 'colors') return this.tellColors(playerName);

                let isLocation = await this.checkLocationAndTeleport(playerName, baseCommand);
                if (isLocation) return;

                return this.tellPlayerRaw(playerName, [
                    { text: 'Command ', color: 'red' },
                    { text: `!${baseCommand}`, color: 'green' },
                    { text: ' is not a valid command', color: 'red' },
                ]);
            }
        })();
    }

    async handlePlayerLogin(playerName, uuid) {
        this.checkPlayerRecord(playerName, uuid);
        await this.welcomeMessage(playerName);       
    }
};
