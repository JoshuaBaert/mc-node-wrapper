module.exports = Base => class extends Base {
    constructor() {
        super();
        //this allows us to sort the welcome array in the player schema alphabetically and keep default as the first index.
        this.welcomeOptions = {
            'default': 'a',
            'online': 'b',
            'help': 'c',
            'cooldowns': 'd',
            'autostore': 'e'
        };

        this.helpShortDescription.welcome = [
            'Customize the message that greets you when you login. ex: ',
            { text: '!welcome cooldowns', color: 'green' },
        ];

        this.helpFullDescription.welcome = [
            { text: '', color: 'white' },
            { text: '!welcome', color: 'green' },
            ' displays your current welcome message.\n\n',
            { text: 'You may toggle on/off any of the following options. Any option toggled on will display when you log in.\n', color: 'white' },
            { text: '!welcome default', color: 'green' },
            ' displays a general welcome message\n',
            { text: '!welcome online', color: 'green' },
            ' lists online players.\n',            
            { text: '!welcome help', color: 'green' },
            ' lists available commands.\n',
            { text: '!welcome cooldowns', color: 'green' },
            ' displays status of command cooldowns.\n',
            { text: '!welcome autostore', color: 'green' },
            ' displays status of your xp autostore.\n',
        ];
    }

    async handleWelcome(playerName, args) {
        if (!args[0]) return await this.displayWelcome(playerName);

        if (args[0] && this.welcomeOptions[args[0]]) {
            await this.toggleInput(playerName, args);
        } else if (args[0]) {
            this.handleWrongWelcomeInput(playerName);
        }
    }
    
    async displayWelcome(playerName) {
        //reads welcome array and builds a welcome message out of the componenets.
        let welcomeArray = await readPlayerWelcome(playerName);
        
    }

    async toggleInput(playerName, input) {
        //if input is in welcome array in the player scema, take it out of the array, and vice versa.
        await updatePlayerWelcome(playerName, this.welcomeOptions[input]);
        await this.displayWelcome(playerName);
    }

    handleWrongWelcomeInput(playerName) {
        //they got here by typing the wrong thing, will list the things they can type.
        return this.tellPlayerRaw(playerName, [
            { text: `Not a command.\n`, color: 'red' },
            { text: `Type `, color: 'white' },
            { text: `!help welcome`, color: 'green' },
            { text: ` for a list of commands.`, color: 'white' },
        ]);
    }

    welcomeDefault(playerName) {
        this.tellPlayerRaw(playerName, [
            'Hey ',
            { text: playerName, color: 'aqua' },
            '.\nWelcome to the Baert\'s Minecraft server.',
            '\nWe have some custom commands to encourage playing together.\nTry typing',
            { text: ' !help', color: 'green' },
            ' for more information.',
        ]);
    }

    welcomeOnline(playerName) {

    }

    welcomeHelp(playerName) {

    }

    welcomeCooldowns(playerName) {

    }

    welcomeAutostore(playerName) {

    }

}