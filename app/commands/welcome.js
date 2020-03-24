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
        } else {
            this.handleWrongWelcomeInput(playerName);
        }
    }
    
    async displayWelcome(playerName) {
        //reads welcome array and builds a welcome message out of the componenets.
        let welcomeArray = await this.readPlayerWelcome(playerName);
        let combinedMessage = [
            'Hey ',
            { text: playerName, color: 'aqua' },
            '.',           
        ];

        for (let i = 0; i < welcomeArray.length; i++) {
            let addMessage = [];

            switch(welcomeArray[i]) {
                case 'a':
                    addMessage = this.welcomeDefault()
                    break;
                case 'b':
                    addMessage = await this.welcomeOnline(playerName)
                    break;
                case 'c':
                    addMessage = this.welcomeHelp()
                    break;
                case 'd':
                    addMessage = this.welcomeCooldowns(playerName)
                    break;
                case 'e':
                    addMessage = await this.welcomeAutostore(playerName)
            };

            combinedMessage = [...combinedMessage, ['\n'], ...addMessage];
        }
        
        this.tellPlayerRaw(playerName, combinedMessage) 
    }

    async toggleInput(playerName, input) {
        //if input is in welcome array in the player scema, take it out of the array, and vice versa.
        await this.updatePlayerWelcome(playerName, this.welcomeOptions[input]);
        this.tellPlayerRaw(playerName, [
            { text: `Welcome updated.`, color: 'red' },
        ]);
        await this.displayWelcome(playerName);
    }

    handleWrongWelcomeInput(playerName) {
        //they got here by typing the wrong thing, will list the things they can type.
        this.tellPlayerRaw(playerName, [
            { text: `Not a command.\n`, color: 'red' },
            { text: `Type `, color: 'white' },
            { text: `!help welcome`, color: 'green' },
            { text: ` for a list of commands.`, color: 'white' },
        ]);
    }

    welcomeDefault() {
        return [
            'Welcome to the Baert\'s Minecraft server.',
            '\nWe have some custom commands to encourage playing together.\nTry typing',
            { text: ' !help', color: 'green' },
            ' for more information.',
        ];
    }

    async welcomeOnline(playerName) {
        let loggedInPlayers = await this.getListOfOnlinePlayers();
        loggedInPlayers.splice(loggedInPlayers.indexOf(playerName),1);

        if (loggedInPlayers.length > 0) {
            return [
                'Online Players:\n',
                //list all other players online
                ...(loggedInPlayers.map((player) => {
                    return { text: player + '\n', color: 'aqua' };
                })), 
            ]
        }

        return [
            'Nobody else is logged in.',
        ]
    }

    welcomeHelp() {
        return this.basicHelp();
    }

    welcomeCooldowns(playerName) {
        return this.buildCooldownsMessage(playerName);
    }

    async welcomeAutostore(playerName) {
        return await this.xpAutoStoreInform(playerName)
    }
};
