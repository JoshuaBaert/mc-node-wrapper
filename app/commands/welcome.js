module.exports = Base => class extends Base {
    constructor() {
        super();
        //this allows us to sort the welcome array in the player schema alphabetically and keep default as the first index.
        this.welcomeOptions = {
            'default': 'a',
            'online': 'b',
            'help': 'c',
            'cooldowns': 'd',
            'xp': 'e',
            'autostore': 'f',          
            'hints': 'z',
            'reset': 'reset'
        };

        this.helpShortDescription.welcome = [
            'Customize the message that greets you when you login. ex: ',
            { text: '!welcome cooldowns', color: 'green' },
        ];

        this.helpFullDescription.welcome = [
            { text: '', color: 'white' },
            { text: '!welcome', color: 'green' },
            ' displays your current welcome message.\n', 
            { text: '!welcome reset', color: 'green' },
            ' resets to the basic message.\n\n',
            { text: 'Customize the welcome message with the info you\'re most interested in.\nExperiment with the following options:\n', color: 'white' },
            { text: '!welcome default', color: 'green' },
            ', ',
            { text: '!welcome online', color: 'green' },
            ', ',            
            { text: '!welcome help', color: 'green' },
            ', ',
            { text: '!welcome cooldowns', color: 'green' },
            ', ',
            { text: '!welcome xp', color: 'green' },
            ', ',
            { text: '!welcome autostore', color: 'green' },
            ', ',
            { text: '!welcome hints', color: 'green' },
            '.',
        ];
    }

    async handleWelcome(playerName, args) {
        if (!args[0]) return await this.displayWelcome(playerName);

        if (args[0] && this.welcomeOptions[args[0]]) {
            await this.toggleInput(playerName, this.welcomeOptions[args[0]]);
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
                    addMessage = await this.welcomeXp(playerName)
                    break;
                case 'f':
                    addMessage = await this.welcomeAutostore(playerName)
                    break;
                case 'z':
                    addMessage = this.welcomeHints()
            };

            combinedMessage = [...combinedMessage, ['\n'], ...addMessage];
        }
        
        this.tellPlayerRaw(playerName, combinedMessage) 
    }

    async toggleInput(playerName, input) {
        //if input is 'reset' it resets to basic message
        if (input === 'reset') {
            await this.updatePlayerWelcome(playerName, ['a','z']);
            this.tellPlayerRaw(playerName, [
                { text: `Welcome updated.`, color: 'red' },
            ]);
            await this.displayWelcome(playerName);
            return;
        }

        let welcomeArray = await this.readPlayerWelcome(playerName);

        //if input is currently in the array, we remove it
        if (welcomeArray.indexOf(input) !== -1) {
            let welcome = welcomeArray;
            welcome.splice(welcome.indexOf(input),1)

            await this.updatePlayerWelcome(playerName, welcome); 
            this.tellPlayerRaw(playerName, [
                { text: `Welcome updated.`, color: 'red' },
            ]);
            await this.displayWelcome(playerName);
            return;   
        
        //if it is not, we add it and sort alphabetically.
        } else {
            let welcome = [...welcomeArray, input];
            welcome.sort();
            
            await this.updatePlayerWelcome(playerName, welcome); 
            this.tellPlayerRaw(playerName, [
                { text: `Welcome updated.`, color: 'red' },
            ]);
            await this.displayWelcome(playerName);
            return;
        };     
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
            '',
            { text: 'Nobody', color: 'red' },
            ' else is logged in.',
        ]
    }

    welcomeHelp() {
        return this.basicHelp();
    }

    welcomeCooldowns(playerName) {
        return this.buildCooldownsMessage(playerName);
    }

    async welcomeXp(playerName) {
        return await this.simpleXpCheck(playerName);
    }

    async welcomeAutostore(playerName) {
        return await this.xpAutoStoreInform(playerName)
    }

    welcomeHints() {
        let combinedMessage = [
            '',
            { text: "Today's hint:\n", color: 'gold' }
        ];

        const randomHint = this.serverHints[Math.floor(Math.random() * this.serverHints.length)];

        return [...combinedMessage, ...randomHint]
    }
};
