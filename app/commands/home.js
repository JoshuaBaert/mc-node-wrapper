module.exports = Base => class extends Base {
    constructor() {
        super();
        this.shareRequests = {};
        this.helpShortDescription.home = [
            'set a home you can teleport back to ex: ',
            { text: '!home set', color: 'green' },
        ];

        this.helpFullDescription.home = [
            { text: '', color: 'white' },
            { text: '!home set ', color: 'green' },
            'sets your default home to your current location.\n',
            { text: '!home ', color: 'green' },
            'send you back home. (has 15 minute cooldown)\n\n',

            'Can set up to 2 named personal homes\n',
            'ex: ',
            { text: '!home set ', color: 'green' },
            { text: 'homeName\n', color: 'light_purple' },

            'Can set 1 shared home with each other player. \n',
            'ex: ',
            { text: '!home share ', color: 'green' },
            { text: 'playerName ', color: 'aqua' },
            'then teleport to it with:\n',
            { text: '!home ', color: 'green' },
            { text: 'playerName\n', color: 'light_purple' },

            'Or set a custom name for a shared home.\n',
            'ex: ',
            { text: '!home share ', color: 'green' },
            { text: 'playerName ', color: 'aqua' },
            { text: 'homeName\n', color: 'light_purple' },

            'To teleport to a personal or shared home, type:\n',
            { text: '!home ', color: 'green' },
            { text: 'homeName\n\n', color: 'light_purple' },
            
            { text: '!home list ', color: 'green' },
            'lists all your homes\n',
            { text: '!home delete ', color: 'green' },
            { text: 'homeName ', color: 'light_purple' },
            'deletes a home from your list',
        ];
    }

    async handleHome(playerName, args) {
        // Check to see if the player is in the end if so don't allow anything home related
        if ((await this.getPlayerDimension(playerName)) === 'minecraft:the_end') {
            return this.tellPlayer(playerName, 'Sorry can not use the home command in the end', 'red');
        }

        switch (args[0]) {
        case 'delete':
            return this.deleteHome(playerName, args[1]);
        case 'list':
            return this.listHomes(playerName);
        case 'set':
            return this.setHome(playerName, args[1]);
        case 'share':
            return this.handleShareHome(playerName, args[1], args[2])
        default:
            return this.teleportHome(playerName, args[0]);
        }
    }

    async teleportHome(playerName, homeName) {
        //cooldown check goes here
        if (this.cooldownCheck('home', playerName) === true) return;

        // grab and see if players home exists. (also checks shared homes)
        let playerHome = await this.readPlayerHome(playerName, homeName);

        if (playerHome) {
            this.writeToMine(`execute in ${playerHome.world} run tp ${playerName} ${playerHome.pos.join(' ')} ${playerHome.rot.join(' ')}`);
        } else {
            return this.tellPlayerRaw(playerName, [
                { text: 'Your home ', color: 'red' },
                { text: homeName ? homeName + ' ' : '', color: 'green' },
                `is not set yet.`,
            ]);
        }
        
        //cooldown start goes here
        this.cooldownStart('home', playerName);
    }

    async deleteHome(playerName, homeName) {
        if (!homeName) return this.tellPlayer(playerName, 'You must provide a home to delete', 'red');

        //note: deletes from either Player.homes or Player.shareHomes
        await this.deletePlayerHome(playerName, homeName);
        this.tellPlayer(playerName, 'Home deleted', 'green');
    }

    async listHomes(playerName) {
        let homes = await this.readPlayerHomeList(playerName);

        if (!homes) {
            this.tellPlayer(playerName, 'You have no homes.');
        } else {
            this.tellPlayerRaw(playerName, [
                'Your homes:\n',
                ...(homes.map((home) => {
                    return { text: home + '\n', color: 'green' };
                })),
            ]);
        }
    }

    async setHome(playerName, homeName) {
        if (homeName && !(/[a-z0-9]/i).test(homeName)) {
            return this.tellPlayer(playerName, `Invalid home name ${homeName}. Can only contain letters and numbers`, 'red');
        }
        // Get Position & Rotation
        let position = await this.getPlayerPosition(playerName);
        let rotation = await this.getPlayerRotation(playerName);
        let world = await this.getPlayerDimension(playerName);

        // Saving players position and rotation for use later
        try {
            await this.createPlayerHome(playerName, position, rotation, world, homeName);
        } catch (err) {
            if(err.message = 'name used by shared home') {
                return this.tellPlayer(playerName, 'You already have a shared home with this name. Delete that home first.', 'red')
            };
            if(err.message = 'more than 2 personal homes') {
                return this.tellPlayer(playerName, 'Cannot have more than 2 extra homes', 'red')
            };
        }
        this.tellPlayerRaw(playerName, [
            `Setting your `,
            { text: homeName ? homeName + ' ' : '', color: 'light_purple' },
            `home to [${position.join(', ')}]`,
        ]);
    }

    async handleShareHome(playerName, acceptOrCompanion, altName) {
        switch (acceptOrCompanion) {
        case 'accept':
            return this.shareHomeAccept(playerName, altName);
        default:
            let loggedInPlayers = await this.getListOfOnlinePlayers();
            if (loggedInPlayers.indexOf(acceptOrCompanion) !== -1) {
                // If is a players name then make a request to share a home.
                let shareWith = acceptOrCompanion
                return this.shareHomeRequest(playerName, shareWith, altName);
            } else return this.tellPlayerRaw(playerName, [
                { text: `If you meant to type the name of a player, make sure it's spelled right, and that they're logged in.\n`, color: 'white' },
                { text: `Type `, color: 'white' },
                { text: `!help home`, color: 'green' },
                { text: ` for a list of commands.\n`, color: 'white' },   
            ]);
        }
    }

    async shareHomeRequest(playerName, shareWith, altName) {
        let list = await this.readPlayerHomeList(playerName);
        let index = list.indexOf(altName);
        if (index > -1) {
            return this.tellPlayer(playerName, 'You already have a home with this name. Delete that home first.', 'red')
        };

        let position = await this.getPlayerPosition(playerName);
        let requestingPosition = await this.getPlayerPosition(shareWith);

        //if players are more than 100 blocks apart in any direction, return
        if (Math.abs(position[0] - requestingPosition[0] > 100 || Math.abs(position[1] - requestingPosition[1]) > 100 || Math.abs(position[2] - requestingPosition[2]) > 100)) {
            return this.tellPlayer(playerName, `Must be with 100 blocks of each other.`, 'red')
        }

        this.tellPlayerRaw(playerName, ['Sent request to share a home with ', { text: shareWith, color: 'green' }]);

        this.tellPlayerRaw(shareWith, [
            { text: `would you like to share a home with ${playerName}?\n`, color: 'white' },
            { text: `Type `, color: 'white' },
            { text: `!home share accept `, color: 'green' },
            { text: `at the desired location.\n`, color: 'white' },
            { text: `To set a custom name, type `, color: 'white' },
            { text: `!home share accept `, color: 'green' },
            { text: `homeName`, color: 'light_purple' },
        ]);

        if (altName) {
            this.shareRequests[shareWith] = [playerName, altName]
        } else this.shareRequests[shareWith] = [playerName, shareWith]
        
    }

    async shareHomeAccept(playerName, altName) {
        if (this.shareRequests[playerName] === undefined) {
            this.tellPlayer(playerName, `No pending shared home requests.`, 'red');
            return;
        }

        let list = await this.readPlayerHomeList(playerName);
        let index = list.indexOf(altName);
        if (index > -1) {
            return this.tellPlayer(playerName, 'You already have a home with this name. Delete that home first.', 'red')
        };

        let requestingPlayer = this.shareRequests[playerName][0];
        let requestingAltName = this.shareRequests[playerName][1];

        if (requestingPlayer) {
            // Get world, Position & Rotation of accepting player, this is where the shared home will be located.
            // get requesting player position to test distance.
            let position = await this.getPlayerPosition(playerName);
            let rotation = await this.getPlayerRotation(playerName);
            let world = await this.getPlayerDimension(playerName);
            let requestingPosition = await this.getPlayerPosition(requestingPlayer)

            //if players are more than 100 blocks apart in any direction, return
            if (Math.abs(position[0] - requestingPosition[0] > 100 || Math.abs(position[1] - requestingPosition[1]) > 100 || Math.abs(position[2] - requestingPosition[2]) > 100)) {
                return this.tellPlayer(playerName, `Must be with 100 blocks of each other.`, 'red')
            }

            //setting for accepting player
            try {
                await this.createSharedHome(playerName, requestingPlayer, position, rotation, world, altName);
            } catch (err) {
                if (err.message = 'name used by home') {
                    return this.tellPlayer(playerName, `You already have a home with this name. Delete that home first.`, 'red')
                }
            }          
            this.tellPlayerRaw(playerName, [
                `Setting your `,
                { text: altName ? altName + ' ' : '', color: 'light_purple' },
                `shared home with `,
                {text: requestingPlayer, color: 'aqua'},
                ` to [${position.join(', ')}]\n`,
                `Type `,
                { text: altName ? '!home ' + altName : '!home ' + requestingPlayer, color: 'green' },
                ` to teleport there.`
            ]);

            //setting for requesting player
            try {
                await this.createSharedHome(requestingPlayer, playerName, position, rotation, world, requestingAltName);
            } catch (err) {
                if (err.message = 'name used by home') {
                    return this.tellPlayer(requestingPlayer, `You already have a home with this name. Delete that home first.`, 'red')
                }
            }            
            this.tellPlayerRaw(requestingPlayer, [
                `Setting your `,
                { text: requestingAltName !== playerName ? requestingAltName + ' ' : '', color: 'light_purple' },
                `shared home with `,
                {text: playerName, color: 'aqua'},
                ` to [${position.join(', ')}]\n`,
                `Type `,
                { text: requestingAltName !== playerName ? '!home ' + requestingAltName : '!home ' + playerName, color: 'green' },
                ` to teleport there.`
            ]);

            this.shareRequests[playerName] = null;
        } else this.tellPlayer(playerName, `No pending shared home requests.`, 'red');
    }

};
