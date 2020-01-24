module.exports = Base => class extends Base {
    constructor() {
        super();
        this.autoStoreOnList = [];
    }

    async handleXpAutoStore(playerName) {
        //player will turn on and off the autostore using just !xp autostore
        //If autostore is already set to true
        if (await this.readPlayerXpAutoStore(playerName)) {
            await this.xpAutoStoreDisable(playerName);
        }
        else {
            await this.xpAutoStoreEnable(playerName);
        }
    };

    async xpAutoStoreEnable(playerName) {
        //set autostore to true
        await this.updatePlayerXpAutoStore(playerName, true);
        await this.updateAutoStoreOnList(playerName);
        this.tellPlayerRaw(playerName, [
            { text: `Autostore is `, color: 'white' },
            { text: `${await this.xpInformPlayerAutoStoreOnOff(playerName)}`, color: 'light_purple' },
            { text: ` .\nThis will store your experience every 3 minutes.\n Type `, color: 'white' },
            { text: `!xp autostore`, color: 'green' },
            { text: ` again or `, color: 'white' },
            { text: `!xp get`, color: 'green' },
            { text: ` to turn off.`, color: 'white' },
        ]);
        
    }

    async xpAutoStoreDisable(playerName) {
        //set autostore to false
        await this.updatePlayerXpAutoStore(playerName, false);
        await this.updateAutoStoreOnList(playerName);
        this.tellPlayerRaw(playerName, [
            { text: `Autostore is `, color: 'white' },
            { text: `${await this.xpInformPlayerAutoStoreOnOff(playerName)}`, color: 'light_purple' },
            { text: ` .\nType `, color: 'white' },
            { text: `!xp autostore`, color: 'green' },
            { text: ` to turn on.`, color: 'white' },
        ]);
        
    }

    async xpInformPlayerAutoStoreOnOff(playerName) {
        if (await this.readPlayerXpAutoStore(playerName)) {
            return 'ON';
        } else {
            return 'OFF'
        }
    }

    //dont worry about how to start it.
    //have 1 function maybe interval. dont give it any arguments.
    //should find all players that have autoxp on that are logged in and store xp for them.
    //get all players who have autostore true and use that in function


    async xpAutoStoreInterval(players) {
        return setInterval(() => {
            for (let i = 0; i < players.length; i++) {
                //getting playerName
                let playerName = players[i];

                 //what is the total number of experience points a player has?
                let totalPoints = await this.totalPoints(playerName);

                //checking current xpStore balance
                let currentBalance = await this.currentBalance(playerName);

                //storing playerName's experience
                await this.storeAll(playerName, totalPoints, currentBalance);
            }
        }, 1000 * 10 * 1);
    }

    async autoStoreIntervalOnOff(players) {
        if (this.autoStoreOnList.length >= 1) {
            await this.xpAutoStoreInterval(players);
        } else {
            clearInterval(await this.xpAutoStoreInterval(players));
        }
    }

    async updateAutoStoreOnList(playerName) {
        let loggedInPlayers = await this.getListOfOnlinePlayers();

        //If player is online and their autostore is turned on, putting them in array.
        if (await this.readPlayerXpAutoStore(playerName) && loggedInPlayers.indexOf(playerName) !== -1) {
            if (this.autoStoreOnList.indexOf(playerName) === -1) this.autoStoreOnList.push(playerName)

        //if that isn't true we need to remove them from the array.
        } else {
            if (this.autoStoreOnList.indexOf(playerName) !== -1) this.autoStoreOnList.splice(this.autoStoreOnList.indexOf(playerName),1)
        }
    }
}
