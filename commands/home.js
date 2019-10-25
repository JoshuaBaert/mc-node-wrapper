module.exports = async function (player, args) {
    if (args[0] === 'set') {
        // Get Position & Rotation
        let position = await this.getPlayerPosition(player);
        let rotation = await this.getPlayerRotation(player);

        // Saving players position and rotation for use later
        this.playerHomes[player] = { pos: position, rot: rotation };
        this.writeToMine(`w ${player} Setting your home to ${position.join(' ')}`);
    } else if (args.length === 0) {
        // grab and see if players home exists
        let playerHome = this.playerHomes[player];
        if (playerHome) {
            this.writeToMine(`tp ${player} ${playerHome.pos.join(' ')} ${playerHome.rot.join(' ')}`);
        } else {
            this.writeToMine(`w ${player} Your home is not set yet.`);
        }
    }
};
