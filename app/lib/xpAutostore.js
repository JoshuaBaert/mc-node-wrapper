module.exports = Base => class extends Base {
    constructor() {
        super();
    }

    async storePlayersXpAutoStoreTrue() {
        async function asyncForEach(array, callback) {
            for (let index = 0; index < array.length; index++) {
              await callback(array[index], index, array);
            }
        }

        //All players that are online.
        let loggedInPlayers = await this.getListOfOnlinePlayers();
        //All players who have AutoStore turned on including those who are offline.
        let autoStoreOnPlayers = await this.readPlayersXpAutoStoreTrue();
        let asoPlayerNames = autoStoreOnPlayers.map(player => player.name);
        //Only players who are online and have autostore turned on.
        let filteredAutostorePlayers = asoPlayerNames.filter(player => loggedInPlayers.includes(player));

        return await asyncForEach(filteredAutostorePlayers, async (playerName) => {
            await this.storeAll(playerName, await this.totalPoints(playerName), await this.currentBalance(playerName))
        })
    }  
}
