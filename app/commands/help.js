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

    handleHelp(playerName, args) {
        if (!args[0]) return this.basicHelpMessage(playerName);

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

    basicHelp() {
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
        return [
            { text: '', color: 'white' },
            ...messages,
            '\n\nFor more about a single command try something like: ',
            { text: '!help home', color: 'green' },
        ];
    }

    basicHelpMessage(playerName) {
        //separated out the tellPlayerRaw from the above function so we can use that code elsewhere without sending too many messages to the player.
        let message = this.basicHelp()
        this.tellPlayerRaw(playerName, message)
    }

};
