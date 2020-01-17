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
                    return this.handleXpCheck(playerName, args.slice(1));
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
            { text: `!xp get 300`, color: 'green' },
            { text: ` will retrieve 300 experience points.\nFinally, you may type `, color: 'white' },
            { text: `!xp check`, color: 'green' },
            { text: ` to to see your stored experience. Append a number to see how many experience points you need to reach a level.\nEG:`, color: 'white' },
            { text: `!xp check 30`, color: 'green' },

        ]);;
    }

    async handleXpStore(playerName, args) {
        //what is the total number of experience points a player has?
        let playerLevels = await this.readPlayerExperienceLevels(playerName);
        let playerPoints = await this.readPlayerExperiencePoints(playerName);        
        let totalPoints = this.convertLevelsToPoints(playerLevels, playerPoints);

        //checking current xpStore balance
        let currentBalance = await this.readPlayerXpStore(playerName);
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
            await this.simpleCheck(playerName);

        } else {
            //make args[0] an integer
            let argsInt = parseInt(args[0], 10);

            if (argsInt >= 0){

                //need to handle when player inputs more experience points than they have
                if (argsInt <= totalPoints) {
                    //input less than or equal their total xp.

                    //removing the experience points
                    let pointsRemovedPartial = await this.subtractPlayerExperience(playerName, argsInt);

                    //adding those points to their xp store
                    await this.updatePlayerXpStore(playerName, currentBalance + pointsRemovedPartial);

                    //informing player current point balance
                    this.whisperPlayerRaw(playerName, [
                        { text: `You have stored `, color: 'white' },
                        { text: `${pointsRemovedPartial}`, color: 'red' },
                        { text: ` experience points.`, color: 'white' },
                    ]);
                    await this.simpleCheck(playerName);

                } else {
                    //input too many levels.

                    //just storing all thier xp.
                    let pointsRemovedInsufficient = await this.subtractPlayerExperience(playerName, totalPoints);

                    //adding those points to their xp store
                    await this.updatePlayerXpStore(playerName, currentBalance + pointsRemovedInsufficient);

                    //informing player current point balance
                    this.whisperPlayerRaw(playerName, [
                        { text: `Not enough experience points.\nStoring `, color: 'white' },
                        { text: `${pointsRemovedInsufficient}`, color: 'red' },
                        { text: ` experience points instead.`, color: 'white' },
                    ]);
                    await this.simpleCheck(playerName);
                }
                
            } else {
                //They got here because they messed up
                this.whisperPlayerRaw(playerName, [
                    { text: `Must input a positive number.\n`, color: 'red' },
                    { text: `!xp store 50`, color: 'green' },
                    { text: ` to store 50 experience points.`, color: 'red' },
                ]);
            }
        }

    };

    async handleXpGet(playerName, args) {
        //checking current xpStore balance
        let currentBalance = await this.readPlayerXpStore(playerName);
        if (currentBalance == undefined) currentBalance = 0;

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

        } else {
            //make args[0] an integer
            let argsInt = parseInt(args[0], 10);
            
            if (argsInt >= 0) {
                //need to handle when player inputs more xp than they have xp stored
                if (argsInt <= currentBalance) {
                    //input less than or equal the xp stored.

                    //adding the xp equal to number input as argsInt
                    let pointsRetrievedPartial = await this.addPlayerExperience(playerName, argsInt);

                    //removing those points from their xp store
                    await this.updatePlayerXpStore(playerName, currentBalance - pointsRetrievedPartial);

                    //informing player current point balance
                    this.whisperPlayerRaw(playerName, [
                        { text: `You have retrieved `, color: 'white' },
                        { text: `${pointsRetrievedPartial}`, color: 'red' },
                        { text: ` experience points.`, color: 'white' },
                    ]);
                    await this.simpleCheck(playerName);

                    
                } else {
                    //input too much xp.

                    //just retrieving all thier xp.
                    let pointsRetrievedInsufficient = await this.addPlayerExperience(playerName, currentBalance);

                    //removing those points from their xp store
                    await this.updatePlayerXpStore(playerName, currentBalance - pointsRetrievedInsufficient);

                    //informing player current point balance
                    this.whisperPlayerRaw(playerName, [
                        { text: `Not enough stored experience points.\nRetrieving `, color: 'white' },
                        { text: `${pointsRetrievedInsufficient}`, color: 'red' },
                        { text: ` experience points instead.`, color: 'white' },
                    ]);
                    await this.simpleCheck(playerName);
                }

            } else {
                //They got here because they messed up
                this.whisperPlayerRaw(playerName, [
                    { text: `Must input a positive number.\n`, color: 'red' },
                    { text: `!xp get 50`, color: 'green' },
                    { text: ` would retrieve 50 experience points.`, color: 'red' },
                ]);
            }
        }
    }

    async handleXpGive(playerName, args) {
        let loggedInPlayers = await this.getListOfOnlinePlayers();

        if (args[0] && args[0].toLowerCase() === 'accept') {
            this.handleXpGiveAccept(playerName);
        } else if (loggedInPlayers.indexOf(args[0]) !== -1) {
            // If the first word is a players name then offer stored experience

            let currentBalance = await this.readPlayerXpStore(playerName);
            if (currentBalance == undefined) currentBalance = 0;

            if (!args[1]) {
                //no specified amount offered, this will offer the entire amount stored.
                this.whisperPlayerRaw(playerName, [
                    { text: `Offered `, color: 'white' },
                    { text: `${currentBalance}`, color: 'red' },
                    { text: ` stored experience points to `, color: 'white' },
                    { text: `${args[0]}.`, color: 'green' },
                ]);
    
                this.whisperPlayerRaw(args[0], [
                    { text: `${playerName} is offering you `, color: 'white' },
                    { text: `${currentBalance}`, color: 'red' },
                    { text: ` stored experience points.\nType `, color: 'white' },
                    { text: `!xp give accept`, color: 'green' },
                    { text: ` to accept`, color: 'white' },
                ]);

                this.giveOffers[args[0]] = [playerName,currentBalance];
            } else {
                //make args[1] an integer
                let argsInt = parseInt(args[1], 10);

                if (argsInt >= 0){
                    //offered amount must be a positive number.

                    if (argsInt <= currentBalance){
                        this.whisperPlayerRaw(playerName, [
                            { text: `Offered `, color: 'white' },
                            { text: `${argsInt}`, color: 'red' },
                            { text: ` stored experience points to `, color: 'white' },
                            { text: `${args[0]}.`, color: 'green' },
                        ]);
            
                        this.whisperPlayerRaw(args[0], [
                            { text: `${playerName} is offering you `, color: 'white' },
                            { text: `${argsInt}`, color: 'red' },
                            { text: ` stored experience points.\nType `, color: 'white' },
                            { text: `!xp give accept`, color: 'green' },
                            { text: ` to accept`, color: 'white' },
                        ]);
        
                        this.giveOffers[args[0]] = [playerName,argsInt];
                    } else {
                        //They don't have enough stored xp for offered amount. will offer entire amount stored.
                        this.whisperPlayerRaw(playerName, [
                            { text: `You don't have enough Experience points stored. Offered `, color: 'white' },
                            { text: `${currentBalance}`, color: 'red' },
                            { text: ` points to `, color: 'white' },
                            { text: `${args[0]}.`, color: 'green' },
                            { text: `instead.`, color: 'white' },
                        ]);
            
                        this.whisperPlayerRaw(args[0], [
                            { text: `${playerName} is offering you `, color: 'white' },
                            { text: `${currentBalance}`, color: 'red' },
                            { text: ` stored experience points.\nType `, color: 'white' },
                            { text: `!xp give accept`, color: 'green' },
                            { text: ` to accept`, color: 'white' },
                        ]);
        
                        this.giveOffers[args[0]] = [playerName,currentBalance];
                    }
                    
                } else {
                    //They got here because they messed up
                    this.whisperPlayerRaw(playerName, [
                        { text: `Must input a positive number.\n`, color: 'red' },
                        { text: `!xp give playerName 50`, color: 'green' },
                        { text: ` would gift 50 experience points to that player.`, color: 'red' },
                    ]);
                }
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
        
            let currentBalance = await this.readPlayerXpStore(offeringPlayer);
            if (currentBalance == undefined) currentBalance = 0;

            if (offeringPlayer) {
                //add points to recieving player
                await this.addPlayerExperience(playerName, this.giveOffers[playerName][1]);
                //removing those points from offering player xp store
                await this.updatePlayerXpStore(offeringPlayer, currentBalance - this.giveOffers[playerName][1]);

                this.simpleCheck(offeringPlayer);
                this.whisperPlayer(offeringPlayer, 'Offer accepted');

                this.whisperPlayer(playerName, 'Offer accepted');
                this.giveOffers[playerName] = null;

            } else {
                this.whisperPlayer(playerName, `No pending experience point offers.`, 'red');
            }
        }
        
    }

    async handleXpCheck(playerName, args) {
        let playerLevels = await this.readPlayerExperienceLevels(playerName);
        let playerPoints = await this.readPlayerExperiencePoints(playerName);        
        let totalPoints = this.convertLevelsToPoints(playerLevels, playerPoints);

        let currentBalance = await this.readPlayerXpStore(playerName);
        if (currentBalance == undefined) currentBalance = 0;

        let levelsStored = this.convertPointsToLevels(currentBalance)[0];
        let pointsStored = this.convertPointsToLevels(currentBalance)[1];

        if (!args[0]) {
            this.whisperPlayerRaw(playerName, [
                { text: `You have `, color: 'white' },
                { text: `${currentBalance}`, color: 'red' },
                { text: ` total stored experience points.\n`, color: 'white' },
                { text: `${levelsStored}`, color: 'red' },
                { text: ` levels with `, color: 'white' },
                { text: `${pointsStored}`, color: 'red' },
                { text: ` remaining experience points.`, color: 'white' },
            ]);

        } else {
             //make args[1] an integer
             let argsInt = parseInt(args[0], 10);

            if (argsInt < playerLevels && argsInt >= 0) {
                //this argument will tell the player how many points they would need to store to get down to that level
                let pointsNeededToStore = totalPoints - this.convertLevelsToPoints(argsInt, 0);

                this.whisperPlayerRaw(playerName, [
                    { text: `If you expend `, color: 'white' },
                    { text: `${pointsNeededToStore}`, color: 'red' },
                    { text: ` experience points, You'll have `, color: 'white' },
                    { text: `${argsInt}`, color: 'red' },
                    { text: ` levels.`, color: 'white' },
                ]);

            } else if (argsInt > playerLevels) {
                //this argument will tell the player how many points they need to get to that level
                let pointsNeededToGet = this.convertLevelsToPoints(argsInt, 0) - totalPoints;

                this.whisperPlayerRaw(playerName, [
                    { text: `If you gain `, color: 'white' },
                    { text: `${pointsNeededToGet}`, color: 'red' },
                    { text: ` experience points, You'll have `, color: 'white' },
                    { text: `${argsInt}`, color: 'red' },
                    { text: ` levels.`, color: 'white' },
                ]);

            } else if (argsInt == playerLevels) {
                //this argument tells how many total points it takes to reach their current level
                let pointsNeededForCurrentLevel = this.convertLevelsToPoints(argsInt,0);

                this.whisperPlayerRaw(playerName, [
                    { text: `It took `, color: 'white' },
                    { text: `${pointsNeededForCurrentLevel}`, color: 'red' },
                    { text: ` total experience points to reach this level.`, color: 'white' },
                ]);

            } else {
                //they got here because they messed up.
                this.whisperPlayerRaw(playerName, [
                    { text: `Must input a positive number.\n`, color: 'red' },
                    { text: `!xp check 20`, color: 'green' },
                    { text: ` tells you how many experience points are needed to reach that level.`, color: 'red' },
                ]);
            }
        }
        
    }

    async simpleCheck(playerName) {
        let currentBalance = await this.readPlayerXpStore(playerName);
        if (currentBalance == undefined) currentBalance = 0;

        let levelsStored = this.convertPointsToLevels(currentBalance)[0];
        let pointsStored = this.convertPointsToLevels(currentBalance)[1];

        this.whisperPlayerRaw(playerName, [
            { text: `You have `, color: 'white' },
            { text: `${currentBalance}`, color: 'red' },
            { text: ` total stored experience points.\n`, color: 'white' },
            { text: `${levelsStored}`, color: 'red' },
            { text: ` levels with `, color: 'white' },
            { text: `${pointsStored}`, color: 'red' },
            { text: ` remaining experience points.`, color: 'white' },
        ]);
        
    }
}
