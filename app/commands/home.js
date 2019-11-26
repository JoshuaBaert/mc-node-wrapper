module.exports = Base => class extends Base {
    async handleHome(playerName, args) {
        
        if (args.length === 0) {
            if (this.cooldownCheck('home', playerName, 30000) == true) return;
            // grab and see if players home exists
            let playerHome = await this.getPlayerHome(playerName);

            if (playerHome) {
                this.writeToMine(`execute in ${playerHome.world} run tp ${playerName} ${playerHome.pos.join(' ')} ${playerHome.rot.join(' ')}`);
            } else {
                this.whisperPlayer(playerName, `Your home is not set yet.`, 'red');
            }
            this.cooldownStart('home', playerName, 30000)
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
        this.whisperPlayer(playerName, `Setting your home to [${position.join(', ')}]`);
    }
};


