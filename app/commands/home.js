module.exports = Base => class extends Base {
    constructor() {
        super();

        this.helpShortDescription.home = [
            'set a home you can teleport back to ex: ',
            { text: '!home set', color: 'green' },
        ];

        this.helpFullDescription.home = [
            { text: '', color: 'white' },
            { text: '!home set', color: 'green' },
            ' sets your home to your current location.\n\n',
            { text: '!home', color: 'green' },
            ' send you back home. (has 15 minute cooldown)'
        ];
    }

    async handleHome(playerName, args) {
        // Check to see if the player is in the end if so don't allow anything home related
        if ((await this.getPlayerDimension(playerName)) === 'minecraft:the_end') {
            return this.tellPlayer(playerName, 'Sorry can not use the home command in the end', 'red');
        }


        if (args.length === 0) {
            //cooldown check goes here
            if (this.cooldownCheck('home', playerName) === true) return;

            // grab and see if players home exists
            let playerHome = await this.readPlayerHome(playerName);

            if (playerHome) {
                this.writeToMine(`execute in ${playerHome.world} run tp ${playerName} ${playerHome.pos.join(' ')} ${playerHome.rot.join(' ')}`);
            } else {
                this.tellPlayer(playerName, `Your home is not set yet.`, 'red');
            }
            //cooldown start goes here
            this.cooldownStart('home', playerName);
        } else if (args[0].toLowerCase() === 'set') {
            this.setHome(playerName);
        }
    }

    async setHome(playerName) {
        // Get Position & Rotation
        let position = await this.getPlayerPosition(playerName);
        let rotation = await this.getPlayerRotation(playerName);
        let world = await this.getPlayerDimension(playerName);

        // Saving players position and rotation for use later
        this.createPlayerHome(playerName, position, rotation, world);
        this.tellPlayer(playerName, `Setting your home to [${position.join(', ')}]`);
    }
};
