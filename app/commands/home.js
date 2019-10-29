module.exports = Base => class extends Base {
    async homeHandler(playerName, args) {
        if (args.length === 0) {
            // grab and see if players home exists
            let playerHome = await this.getPlayerHome(playerName);

            if (playerHome) {
                this.writeToMine(`tp ${playerName} ${playerHome.pos.join(' ')} ${playerHome.rot.join(' ')}`);
            } else {
                this.writeToMine(`w ${playerName} Your home is not set yet.`);
            }
        } else if (args[0] === 'set') {
            this.setHome(playerName);
        }
    }

    async setHome(playerName) {
        // Get Position & Rotation
        let position = await this.getPlayerPosition(playerName);
        let rotation = await this.getPlayerRotation(playerName);

        // Saving players position and rotation for use later
        this.setPlayerHome(playerName, { pos: position, rot: rotation });
        this.writeToMine(`w ${playerName} Setting your home to ${position.join(' ')}`);
    }
};
