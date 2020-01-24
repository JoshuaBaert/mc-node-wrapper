module.exports = Base => class extends Base {
    constructor() {
        super();
        // this.autoStoreOnList = [];
    }

    storePlayersXpAutoStoreTrue() {
        //only storing for players that are online.
        let loggedInPlayers = await this.getListOfOnlinePlayers();

        this.readPlayersXpAutoStoreTrue()
    }


//

    //dont worry about how to start it.
    //have 1 function maybe interval. dont give it any arguments.
    //should find all players that have autoxp on that are logged in and store xp for them.
    //get all players who have autostore true and use that in function


    // async xpAutoStoreInterval(players) {
    //     return setInterval(() => {
    //         for (let i = 0; i < players.length; i++) {
    //             //getting playerName
    //             let playerName = players[i];

    //              //what is the total number of experience points a player has?
    //             let totalPoints = await this.totalPoints(playerName);

    //             //checking current xpStore balance
    //             let currentBalance = await this.currentBalance(playerName);

    //             //storing playerName's experience
    //             await this.storeAll(playerName, totalPoints, currentBalance);
    //         }
    //     }, 1000 * 10 * 1);
    // }

    // async autoStoreIntervalOnOff(players) {
    //     if (this.autoStoreOnList.length >= 1) {
    //         await this.xpAutoStoreInterval(players);
    //     } else {
    //         clearInterval(await this.xpAutoStoreInterval(players));
    //     }
    // }

    // async updateAutoStoreOnList(playerName) {
    //     let loggedInPlayers = await this.getListOfOnlinePlayers();

    //     //If player is online and their autostore is turned on, putting them in array.
    //     if (await this.readPlayerXpAutoStore(playerName) && loggedInPlayers.indexOf(playerName) !== -1) {
    //         if (this.autoStoreOnList.indexOf(playerName) === -1) this.autoStoreOnList.push(playerName)

    //     //if that isn't true we need to remove them from the array.
    //     } else {
    //         if (this.autoStoreOnList.indexOf(playerName) !== -1) this.autoStoreOnList.splice(this.autoStoreOnList.indexOf(playerName),1)
    //     }
    // }


}
