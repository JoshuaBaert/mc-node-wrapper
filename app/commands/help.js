module.exports = Base => class extends Base {
    constructor() {
        super();

        /**
         * Expected to have the key be the command name.
         * Then consist of an array that will work for the tellPlayerRaw method.
         */
        this.helpShortDescription = {};

        // Full description is controlled fully by other files
        this.helpFullDescription = {};
    }

    async welcomeMessage(playerName) {
        let onOrOff = await this.xpAutoStoreOnOff(playerName);
        this.tellPlayerRaw(playerName, [
            'Hey ',
            { text: playerName, color: 'aqua' },
            '.\nWelcome to the Baert\'s Minecraft server.',
            '\nWe have some custom commands to encourage playing together.\nTry typing',
            { text: ' !help', color: 'green' },
            ' for more information.',
        ]);
        this.tellPlayerRaw(playerName, [
            { text: '!xp autostore', color: 'green' },
            { text: ' is ', color: 'white' },
            { text: onOrOff, color: 'light_purple' },
        ]);
    }

    handleHelp(playerName, args) {
        if (!args[0]) return this.basicHelp(playerName);

        if (args[0] && this.helpFullDescription[args[0]]) {
            this.tellPlayerRaw(playerName, this.helpFullDescription[args[0]]);
        } else if (args[0]) {
            this.tellPlayerRaw(playerName, [
                'No command library ',
                { text: args[0], color: 'green' },
                '.',
            ]);
        }

    }

    basicHelp(playerName) {
        let messages = Object.entries(this.helpShortDescription)
            // Sorts commands alphabetically
            .sort(([keyA], [keyB]) => {
                if (keyA < keyB) return -1;
                if (keyA > keyB) return 1;
                return 0;
            })
            // Transforms command and adds command name to text
            .map((x) => {
                let description = x[1].slice();
                description.unshift({ text: ': ', color: 'white' });
                description.unshift({ text: `!${x[0]}`, color: 'green' });
                return description;
            })
            // reduces all commands into one tellraw array
            .reduce((a, b) => {
                return [...a, '\n', ...b];
            });


        // Adds before and after text then sends to player
        this.tellPlayerRaw(playerName, [
            { text: '', color: 'white' },
            ...messages,
            '\n\nFor more about a single command try something like: ',
            { text: '!help home', color: 'green' },
        ]);
    }
};
