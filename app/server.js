const isDev = process.env.NODE_ENV === 'development';

/**
 * This is where We combine all of the classes into one
 */
class OtherClasses {
}

OtherClasses = require('./data')(OtherClasses);
OtherClasses = require('./lib/cooldown')(OtherClasses);
OtherClasses = require('./lib/entity')(OtherClasses);
OtherClasses = require('./lib/message')(OtherClasses);
OtherClasses = require('./lib/server-management')(OtherClasses);

// Command imports
OtherClasses = require('./commands/home')(OtherClasses);
OtherClasses = require('./commands/location')(OtherClasses);
OtherClasses = require('./commands/warp')(OtherClasses);

module.exports = class Server extends OtherClasses {
    constructor(jarPath) {
        super();
        console.log('Starting Minecraft!');
        console.log(`isDev: ${isDev}\n`);
        this.startServer(jarPath);
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
        let authReg = /.*UUID\sof\splayer\s(\w+)\sis\s((\w|\d){8}-(\w|\d){4}-(\w|\d){4}-(\w|\d){4}-(\w|\d){12}).*/;
        if (authReg.test(text)) {
            let [playerName, UUID] = text.replace(authReg, '$1+_+$2').split('+_+');
            return this.handlePlayerLogin(playerName, UUID);
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
            case 'home':
                return this.handleHome(playerName, args);
            case 'warp':
                return this.handleWarp(playerName, args);
            case 'location':
                return this.handleLocation(playerName, args);
            default:
                // dev color helper
                if (isDev && baseCommand.toLowerCase() === 'colors') return this.tellColors(playerName);

                let isLocation = await this.checkLocationAndTeleport(playerName, baseCommand);
                if (isLocation) return;

                return this.whisperPlayerRaw(playerName, [
                    { text: 'Command ', color: 'red' },
                    { text: `!${baseCommand}`, color: 'green' },
                    { text: ' is not a valid command', color: 'red' },
                ]);
            }
        })();
    }

    tellColors(playerName) {
        this.whisperPlayerRaw(playerName, ['',
            { 'text': 'These are all of the tellraw colors: ' },
            { 'text': 'Black', 'color': 'black' }, { 'text': ', ' },
            { 'text': 'Dark Blue', 'color': 'dark_blue' }, { 'text': ', ' },
            { 'text': 'Dark Green', 'color': 'dark_green' }, { 'text': ', ' },
            { 'text': 'Dark Aqua', 'color': 'dark_aqua' }, { 'text': ', ' },
            { 'text': 'Dark Red', 'color': 'dark_red' }, { 'text': ', ' },
            { 'text': 'Dark', 'color': 'dark_purple' }, { 'text': ', ' },
            { 'text': 'Purple', 'color': 'dark_purple' }, { 'text': ', ' },
            { 'text': 'Gold', 'color': 'gold' }, { 'text': ', ' },
            { 'text': 'Gray', 'color': 'gray' }, { 'text': ', ' },
            { 'text': 'Dark Grey', 'color': 'dark_gray' }, { 'text': ', ' },
            { 'text': 'Blue', 'color': 'blue' }, { 'text': ', ' },
            { 'text': 'Green', 'color': 'green' }, { 'text': ', ' },
            { 'text': 'Aqua', 'color': 'aqua' }, { 'text': ', ' },
            { 'text': 'Red', 'color': 'dark_red' }, { 'text': ', ' },
            { 'text': 'Light Purple', 'color': 'light_purple' }, { 'text': ', ' },
            { 'text': 'Yellow', 'color': 'yellow' },
            { 'text': ', and White' }]);
    }
};
