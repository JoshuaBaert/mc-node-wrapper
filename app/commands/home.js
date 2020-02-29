module.exports = Base => class extends Base {
    constructor() {
        super();

        this.helpShortDescription.home = [
            'set a home you can teleport back to ex: ',
            { text: '!home set', color: 'green' },
        ];

        this.helpFullDescription.home = [
            { text: '', color: 'white' },
            { text: '!home set ', color: 'green' },
            'sets your home to your current location.\n',
            { text: '!home ', color: 'green' },
            'send you back home. (has 15 minute cooldown)\n\n',
            'Multiple homes you can up to 2 named homes\n',
            'ex: ',
            { text: '!home set ', color: 'green' },
            { text: 'homeName ', color: 'light_purple' },
            'then ',
            { text: '!home ', color: 'green' },
            { text: 'homeName\n', color: 'light_purple' },
            { text: '!home list ', color: 'green' },
            'lists your homes\n',
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

        // grab and see if players home exists
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
        await this.createPlayerHome(playerName, position, rotation, world, homeName);
        this.tellPlayerRaw(playerName, [
            `Setting your `,
            { text: homeName ? homeName + ' ' : '', color: 'light_purple' },
            `home to [${position.join(', ')}]`,
        ]);
    }

    handleShareHome(playerName, acceptOrCompanion, altName) {
        //this is a big function so we're breaking it down into several parts, this is the switch that handles shareHome
        switch (acceptOrCompanion) {
            case 'accept':
                return this.shareHomeAccept(playerName, altName);
            case 'decline':
                return this.shareHomeDecline(playerName, altName);
            default:
                return this.shareHomeSet(playerName, acceptOrCompanion, altName);
        }
    }

    shareHomeAccept(playerName, altName) {
        //"playerName wants to share a home with you at X,Y,Z coordinates, You may accept or decline"
    }

    shareHomeDecline(playerName, altName) {

    }

    async shareHomeSet(playerName, companion, playerAltName, companionAltName) {
        // Get Position & Rotation
        let position = await this.getPlayerPosition(playerName);
        let rotation = await this.getPlayerRotation(playerName);
        let world = await this.getPlayerDimension(playerName);

        await this.createSharedHome(playerName, companion, position, rotation, world, playerAltName);
        await this.createSharedHome(companion, playerName, position, rotation, world, companionAltName);
    }
};
