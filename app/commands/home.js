module.exports = Base => class extends Base {
    async handleHome(playerName, args) {
        if (args.length === 0) {
            // grab and see if players home exists
            let playerHome = await this.getPlayerHome(playerName);

            if (playerHome) {
                this.writeToMine(`execute in ${playerHome.world} run tp ${playerName} ${playerHome.pos.join(' ')} ${playerHome.rot.join(' ')}`);
            } else {
                this.writeToMine(`w ${playerName} Your home is not set yet.`);
            }
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
        this.setPlayerHome(playerName, position, rotation, world);
        this.writeToMine(`w ${playerName} Setting your home to ${position.join(' ')}`);
    }
};
