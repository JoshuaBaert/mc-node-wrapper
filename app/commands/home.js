module.exports = Base => class extends Base {
    async handleHome(playerName, args) {
        
        if (args.length === 0) {
            //cooldown check goes here
            if (this.cooldownCheck('!home', playerName) == true) return;

            // grab and see if players home exists
            let playerHome = await this.readPlayerHome(playerName);

            if (playerHome) {
                this.writeToMine(`execute in ${playerHome.world} run tp ${playerName} ${playerHome.pos.join(' ')} ${playerHome.rot.join(' ')}`);
            } else {
                this.whisperPlayer(playerName, `Your home is not set yet.`, 'red');
            }
            //cooldown start goes here
            this.cooldownStart('!home', playerName);
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
        this.whisperPlayer(playerName, `Setting your home to [${position.join(', ')}]`);
    }
};
