module.exports = async function (player, args) {
    if (args[0] === 'set') {
        let playerInfo = await this.getEntityForPlayer(player);
        this.playerHomes[player] = { Pos: playerInfo.Pos, Rot: playerInfo.Rotation };
        this.writeToMine(`w ${player} Setting your home to ${playerInfo.Pos.join(' ')}`);
    } else if (args.length === 0) {
        let playerHome = this.playerHomes[player];
        if (playerHome) {
            this.writeToMine(`tp ${player} ${playerHome.Pos.join(' ')} ${playerHome.Rot.join(' ')}`);
        } else {
            this.writeToMine(`w ${player} Your home is not set yet.`);
        }
    }
};
