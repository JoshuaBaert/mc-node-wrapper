module.exports = Base => class extends Base {
    constructor() {
        super();
        this.giveOffers = {};
    }

    handleXp(playerName, args) {
    //choose a function based on the args.   
        if (!args[0]) {
            return this.handleWrongInput(playerName);
        } else {
            (() => {
                switch (args[0].toLowerCase()) {
                case 'store':
                    return this.handleXpStore(playerName, args.slice(1));
                case 'get':
                    return this.handleXpGet(playerName, args.slice(1));
                case 'give':
                    return this.handleXpGive(playerName, args.slice(1));
                case 'check':
                    return this.handleXpCheck(playerName);
                default:
                    return this.handleWrongInput(playerName);             
                }
            })();
        }
    }

    handleWrongInput(playerName) {
        //they got here by typing the wrong thing, will list the things they can type.
        return this.whisperPlayerRaw(playerName, [
            { text: `To store all experience, type `, color: 'white' },
            { text: `!xp store`, color: 'green' },
            { text: `.\nTo retrieve all stored experience, type `, color: 'white' },
            { text: `!xp get`, color: 'green' },
            { text: `.\nTo gift your stored experience to another player, type `, color: 'white' },
            { text: `!xp give `, color: 'green' },
            { text: `PlayerName`, color: 'aqua' },
            { text: `.\nYou can also gift, store and retieve partial amounts of experience by appending a `, color: 'white' },
            { text: `number`, color: 'red' },
            { text: ` to the command.\nEG: `, color: 'white' },
            { text: `!xp get 3`, color: 'green' },
            { text: ` will retrieve 3 levels worth experience points.\nFinally, you may type `, color: 'white' },
            { text: `!xp check`, color: 'green' },
            { text: ` to to see your stored experience.`, color: 'white' },
        ]);;
    }

    async handleXpStore(playerName, args) {
        debugger
        //what is the total number of experience points a player has?
        let playerLevels = await this.readPlayerExperienceLevels(playerName);
        let playerPoints = await this.readPlayerExperiencePoints(playerName);        
        let totalPoints = this.convertLevelsToPoints(playerLevels, playerPoints);

        //checking current xpStore balance
        let currentBalance = await this.readPlayerXpStore(playerName);
        console.log(currentBalance)
        if (currentBalance == undefined) currentBalance = 0;
        
        //did player append a number to the command?
        if (!args[0]) {
            //removing points from player
            let pointsRemovedAll = await this.subtractPlayerExperience(playerName, totalPoints);


            //if player stored 0 experience
            if (!pointsRemovedAll) pointsRemovedAll = 0;

            //adding those points to their xp store
            await this.updatePlayerXpStore(playerName, currentBalance + pointsRemovedAll);

            //informing player current point balance
            this.whisperPlayerRaw(playerName, [
                { text: `You have stored `, color: 'white' },
                { text: `${pointsRemovedAll}`, color: 'red' },
                { text: ` experience points.`, color: 'white' },
            ]);
            await this.handleXpCheck(playerName);

        } else if (args[0] >= 0){
            //converting args[0] to points
            let convertedLevels = this.convertLevelsToPoints(parseInt(args[0]),0)

            //need to handle when player inputs more levels than they have
            if (convertedLevels <= totalPoints) {
                //input less than or equal the amount of levels they have.

                //removing the number of levels equal to number input as args[0]
                let pointsRemovedPartial = await this.subtractPlayerExperience(playerName, convertedLevels);

                //adding those points to their xp store
                await this.updatePlayerXpStore(playerName, currentBalance + pointsRemovedPartial);

                //informing player current point balance
                this.whisperPlayerRaw(playerName, [
                    { text: `You have stored `, color: 'white' },
                    { text: `${pointsRemovedPartial}`, color: 'red' },
                    { text: ` experience points.`, color: 'white' },
                ]);
                await this.handleXpCheck(playerName);

            } else {
                //input too many levels.

                //just storing all thier xp.
                let pointsRemovedInsufficient = await this.subtractPlayerExperience(playerName, totalPoints);

                //adding those points to their xp store
                await this.updatePlayerXpStore(playerName, currentBalance + pointsRemovedInsufficient);

                //informing player current point balance
                this.whisperPlayerRaw(playerName, [
                    { text: `You don't have enough levels to store that amount.\nStoring `, color: 'white' },
                    { text: `${pointsRemovedInsufficient}`, color: 'red' },
                    { text: ` experience points instead.`, color: 'white' },
                ]);
                await this.handleXpCheck(playerName);
            }
            
        } else {
            //They got here because they messed up
            this.whisperPlayerRaw(playerName, [
                { text: `Must input a positive number.\n`, color: 'red' },
                { text: `!xp store 5`, color: 'green' },
                { text: ` would store 5 levels of experience.`, color: 'red' },
            ]);
        }

    };

    async handleXpGet(playerName, args) {
        //checking current xpStore balance
        let currentBalance = await this.readPlayerXpStore(playerName);
        if (currentBalance == NaN) currentBalance = 0;

        //did player append a number to the command?
        if (!args[0]) {
            //restoring all points to player
            let pointsRetrievedAll = await this.addPlayerExperience(playerName, currentBalance);

            //removing those points from their xp store
            await this.updatePlayerXpStore(playerName, currentBalance - pointsRetrievedAll);

            //informing player current point balance
            this.whisperPlayerRaw(playerName, [
                { text: `You have retrieved `, color: 'white' },
                { text: `${pointsRetrievedAll}`, color: 'red' },
                { text: ` experience points.\nYou have `, color: 'white' },
                { text: `0`, color: 'red' },
                { text: ` points remaining.`, color: 'white' },
            ]);

        } else if (args[0] >= 0) {
            //converting args[0] to points
            let convertedLevels = this.convertLevelsToPoints(parseInt(args[0]),0)

            //need to handle when player inputs more levels than they have xp stored
            if (convertedLevels <= currentBalance) {
                //input less than or equal the xp stored.

                //adding the number of levels equal to number input as args[0]
                let pointsRetrievedPartial = await this.addPlayerExperience(playerName, convertedLevels);

                //removing those points from their xp store
                await this.updatePlayerXpStore(playerName, currentBalance - pointsRetrievedPartial);

                //informing player current point balance
                this.whisperPlayerRaw(playerName, [
                    { text: `You have retrieved `, color: 'white' },
                    { text: `${pointsRetrievedPartial}`, color: 'red' },
                    { text: ` experience points.`, color: 'white' },
                ]);
                await this.handleXpCheck(playerName);

                
            } else {
                //input too many levels.

                //just retrieving all thier xp.
                let pointsRetrievedInsufficient = await this.addPlayerExperience(playerName, currentBalance);

                //removing those points from their xp store
                await this.updatePlayerXpStore(playerName, currentBalance - pointsRetrievedInsufficient);

                //informing player current point balance
                this.whisperPlayerRaw(playerName, [
                    { text: `You don't have enough stored experience points.\nRetrieving `, color: 'white' },
                    { text: `${pointsRetrievedInsufficient}`, color: 'red' },
                    { text: ` experience points instead.`, color: 'white' },
                ]);
                await this.handleXpCheck(playerName);
            }

        }else {
              //They got here because they messed up
              this.whisperPlayerRaw(playerName, [
                { text: `Must input a positive number.\n`, color: 'red' },
                { text: `!xp get 5`, color: 'green' },
                { text: ` would retrieve 5 levels of experience.`, color: 'red' },
            ]);
        }

    }

    async handleXpGive(playerName, args) {
        let loggedInPlayers = await this.getListOfOnlinePlayers();

        if (args[0] && args[0].toLowerCase() === 'accept') {
            this.handleXpGiveAccept(playerName);
        } else if (loggedInPlayers.indexOf(args[0]) !== -1) {
            // If the first word is a players name then offer stored experience

            let currentBalanceOffering = await this.readPlayerXpStore(playerName);
            if (currentBalanceOffering == NaN) currentBalanceOffering = 0;
            // let currentBalanceRecieving = await this.readPlayerXpStore(args[0]);

            if (!args[1]) {
                //no specified amount offered, this will offer the entire amount stored.
                this.whisperPlayerRaw(playerName, [
                    { text: `Offered `, color: 'white' },
                    { text: `${currentBalanceOffering}`, color: 'red' },
                    { text: ` stored experience points to `, color: 'white' },
                    { text: `${args[0]}.`, color: 'green' },
                ]);
    
                this.whisperPlayerRaw(args[0], [
                    { text: `${playerName} is offering you `, color: 'white' },
                    { text: `${currentBalanceOffering}`, color: 'red' },
                    { text: ` stored experience points.\nType `, color: 'white' },
                    { text: `!xp give accept`, color: 'green' },
                    { text: ` to accept`, color: 'white' },
                ]);

                this.giveOffers[args[0]] = [playerName,currentBalanceOffering];
            } else if (args[1] >= 0){
                //offered amount must be a positive number.

                if (args[1] <= currentBalanceOffering){
                    this.whisperPlayerRaw(playerName, [
                        { text: `Offered `, color: 'white' },
                        { text: `${args[1]}`, color: 'red' },
                        { text: ` stored experience points to `, color: 'white' },
                        { text: `${args[0]}.`, color: 'green' },
                    ]);
        
                    this.whisperPlayerRaw(args[0], [
                        { text: `${playerName} is offering you `, color: 'white' },
                        { text: `${args[1]}`, color: 'red' },
                        { text: ` stored experience points.\nType `, color: 'white' },
                        { text: `!xp give accept`, color: 'green' },
                        { text: ` to accept`, color: 'white' },
                    ]);
    
                    this.giveOffers[args[0]] = [playerName,args[1]];
                } else {
                    //They don't have enough stored xp for offered amount. will offer entire amount stored.
                    this.whisperPlayerRaw(playerName, [
                        { text: `You don't have enough Experience points stored. Offered `, color: 'white' },
                        { text: `${currentBalanceOffering}`, color: 'red' },
                        { text: ` points to `, color: 'white' },
                        { text: `${args[0]}.`, color: 'green' },
                        { text: `instead.`, color: 'white' },
                    ]);
        
                    this.whisperPlayerRaw(args[0], [
                        { text: `${playerName} is offering you `, color: 'white' },
                        { text: `${currentBalanceOffering}`, color: 'red' },
                        { text: ` stored experience points.\nType `, color: 'white' },
                        { text: `!xp give accept`, color: 'green' },
                        { text: ` to accept`, color: 'white' },
                    ]);
    
                    this.giveOffers[args[0]] = [playerName,currentBalanceOffering];


                }
                
            } else {
                 //They got here because they messed up
              this.whisperPlayerRaw(playerName, [
                { text: `Must input a positive number.\n`, color: 'red' },
                { text: `!xp give playerName 500`, color: 'green' },
                { text: ` would gift 500 experience points to that player.`, color: 'red' },
            ]);
            }
            
        } else {
            // they got here because they messed up
            if (!args[0]) {
                this.whisperPlayer(playerName, 'You need to target a player.', 'red');
                
            } else {
                this.whisperPlayerRaw(playerName, [
                    { text: `Player `, color: 'white' },
                    { text: `${args[0]}`, color: 'aqua' },
                    { text: ` is not logged in. \nDid you mean to type `, color: 'white' },
                    { text: `!xp give accept`, color: 'green' },
                    { text: `?`, color: 'white' },
                ]);
            }
        }
    }

    async handleXpGiveAccept(playerName) {
        // if it is accept see if there is a player that offered xp
        // then if there is send corrent amount of xp to the accepting player
        console.log(this.giveOffers[playerName])
        if (this.giveOffers[playerName] == undefined) {
            this.whisperPlayer(playerName, `No pending experience point offers.`, 'red');
        } else {
            let offeringPlayer = this.giveOffers[playerName][0];
        
            let currentBalanceOffering = await this.readPlayerXpStore(offeringPlayer);
            if (currentBalanceOffering == NaN) currentBalanceOffering = 0;

            if (offeringPlayer) {
                //add points to recieving player
                await this.addPlayerExperience(playerName, this.giveOffers[playerName][1]);
                //removing those points from offering player xp store
                await this.updatePlayerXpStore(offeringPlayer, currentBalanceOffering - this.giveOffers[playerName][1]);

                this.handleXpCheck(offeringPlayer);
                this.whisperPlayer(offeringPlayer, 'Offer accepted');

                this.whisperPlayer(playerName, 'Offer accepted');
                this.giveOffers[playerName] = null;

            } else {
                this.whisperPlayer(playerName, `No pending experience point offers.`, 'red');
            }
        }
        
    }

    async handleXpCheck(playerName) {
        let readXp = await this.readPlayerXpStore(playerName);
        if (readXp == NaN) readXp = 0;
        let levelsStored = this.convertPointsToLevels(readXp)[0];
        let pointsStored = this.convertPointsToLevels(readXp)[1];
        this.whisperPlayerRaw(playerName, [
            { text: `You have `, color: 'white' },
            { text: `${readXp}`, color: 'red' },
            { text: ` total stored experience points.\n`, color: 'white' },
            { text: `${levelsStored}`, color: 'red' },
            { text: ` levels with `, color: 'white' },
            { text: `${pointsStored}`, color: 'red' },
            { text: ` remaining experience points.`, color: 'white' },
        ]);
    }
}
