module.exports = Base => class extends Base {
    constructor() {
        super();
        this.giveOffers = {};
        this.helpShortDescription.xp = [
            'Store, retrieve and trade experience points in the server. ex: ',
            { text: '!xp store ', color: 'green' },
        ];

        this.helpFullDescription.xp = [
            { text: '', color: 'white' },
            { text: '!xp store ', color: 'green' },
            'store all experience.\n',
            { text: '!xp autostore ', color: 'green' },
            'automatically store experience every 3 minutes.\n',
            { text: '!xp get ', color: 'green' },
            'retrieve all stored experience.\n',
            { text: '!xp give ', color: 'green' },
            { text: 'PlayerName ', color: 'aqua' },
            'offers all stored experience to another player.\n',
            { text: '!xp check ', color: 'green' },
            'see stored experience.\n\n',
            'store, get, and gift partial amounts of experience.\n',
            'ex: ',
            { text: '!xp get ', color: 'green' },
            { text: '300 ', color: 'light_purple' },
            'will retrieve 300 experience points.\n',
            'how many experience points needed to reach a level.\n',
            'ex: ',
            { text: '!xp check ', color: 'green' },
            { text: '30 ', color: 'light_purple' },          
        ];
    }

    handleXp(playerName, args) {
        //choose a function based on the args.   
        if (!args[0]) {
            return this.handleWrongInput(playerName);
        } else {
            (() => {
                switch (args[0].toLowerCase()) {
                case 'store':
                    return this.handleXpStore(playerName, args[1]);
                case 'autostore':
                    return this.handleXpAutoStore(playerName);
                case 'get':
                    return this.handleXpGet(playerName, args[1]);
                case 'give':
                    return this.handleXpGive(playerName, args[1], args[2]);
                case 'check':
                    return this.handleXpCheck(playerName, args[1]);
                default:
                    return this.handleWrongInput(playerName);             
                }
            })();
        }
    }

    handleWrongInput(playerName) {
        //they got here by typing the wrong thing, will list the things they can type.
        return this.tellPlayerRaw(playerName, [
            { text: `Not a command. type !help xp for a list of commands. `, color: 'white' },
        ]);;
    }

    async handleXpStore(playerName, storeAmount) {
        //what is the total number of experience points a player has?
        let totalPoints = await this.totalPoints(playerName);

        //checking current xpStore balance
        let currentBalance = await this.currentBalance(playerName);
        
        //did player append a number to the command?
        if (!storeAmount) {
            await this.storeAll(playerName, totalPoints, currentBalance);
        } else {
            //make storeAmount an integer
            let storeAmountInt = this.amountInt(storeAmount);

            if (!(storeAmountInt >= 0)){
                //They got here because they messed up
                this.tellPlayerRaw(playerName, [
                    { text: `Must input a positive number.\n`, color: 'red' },
                    { text: `!xp store 50`, color: 'green' },
                    { text: ` to store 50 experience points.`, color: 'red' },
                ]);
                return;
            }
            //need to handle when player inputs more experience points than they have
            if (storeAmountInt <= totalPoints) {
                //input less than or equal their total xp.

                //removing the experience points
                let pointsRemovedPartial = await this.subtractPlayerExperience(playerName, storeAmountInt);

                //adding those points to their xp store
                await this.updatePlayerXpStore(playerName, currentBalance + pointsRemovedPartial);

                //informing player current point balance
                this.tellPlayerRaw(playerName, [
                    { text: `You have stored `, color: 'white' },
                    { text: `${pointsRemovedPartial}`, color: 'red' },
                    { text: ` experience points.`, color: 'white' },
                ]);
                await this.simpleXpCheck(playerName);

            } else {
                //input too many levels.
                this.tellPlayerRaw(playerName, [
                    { text: `Not enough experience points.`, color: 'white' },
                ]);
                await this.storeAll(playerName, totalPoints, currentBalance);
            }
        }
    };

    //function to store all experience.
    async storeAll(playerName, totalPoints, currentBalance) {
        //removing points from player
        let pointsRemovedAll = await this.subtractPlayerExperience(playerName, totalPoints);

        //if player stored 0 experience
        if (!pointsRemovedAll) pointsRemovedAll = 0;

        //adding those points to their xp store
        await this.updatePlayerXpStore(playerName, currentBalance + pointsRemovedAll);

        //informing player current point balance
        this.tellPlayerRaw(playerName, [
            { text: `You have stored `, color: 'white' },
            { text: `${pointsRemovedAll}`, color: 'red' },
            { text: ` experience points.`, color: 'white' },
        ]);
        await this.simpleXpCheck(playerName);
    };

    async handleXpAutoStore(playerName) {
        //player will turn on and off the autostore using just !xp autostore
        //If autostore is already set to true
        if (await this.readPlayerXpAutoStore(playerName)) {
            await this.xpAutoStoreDisable(playerName);
        } else {
            await this.xpAutoStoreEnable(playerName);
        }
    };

    //functions related to turning autostore on and off.
    async xpAutoStoreEnable(playerName) {
        //set autostore to true
        await this.updatePlayerXpAutoStore(playerName, true);
        this.tellPlayerRaw(playerName, [
            { text: `Autostore is `, color: 'white' },
            { text: `ON`, color: 'light_purple' },
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
        this.tellPlayerRaw(playerName, [
            { text: `Autostore is `, color: 'white' },
            { text: `OFF`, color: 'light_purple' },
            { text: ` .\nType `, color: 'white' },
            { text: `!xp autostore`, color: 'green' },
            { text: ` to turn on.`, color: 'white' },
        ]); 
    }

    async handleXpGet(playerName, getAmount) {
        //set autostore to false. this will ensure player can properly use the xp they get from the store.
        if (await this.readPlayerXpAutoStore(playerName)) {
            await this.xpAutoStoreDisable(playerName);
        }

        //checking current xpStore balance
        let currentBalance = await this.currentBalance(playerName);

        //did player append a number to the command?
        if (!getAmount) {
            await this.getAll(playerName, currentBalance);
        } else {
            //make getAmount an integer
            let getAmountInt = this.amountInt(getAmount);
            
            if (!(getAmountInt >= 0)) {
                //They got here because they messed up
                this.tellPlayerRaw(playerName, [
                    { text: `Must input a positive number.\n`, color: 'red' },
                    { text: `!xp get 50`, color: 'green' },
                    { text: ` would retrieve 50 experience points.`, color: 'red' },
                ]);
                return;
            }                
            //need to handle when player inputs more xp than they have xp stored
            if (getAmountInt <= currentBalance) {
                //input less than or equal the xp stored.

                //adding the xp equal to number input as getAmountInt
                let pointsRetrievedPartial = await this.addPlayerExperience(playerName, getAmountInt);

                //removing those points from their xp store
                await this.updatePlayerXpStore(playerName, currentBalance - pointsRetrievedPartial);

                //informing player current point balance
                this.tellPlayerRaw(playerName, [
                    { text: `You have retrieved `, color: 'white' },
                    { text: `${pointsRetrievedPartial}`, color: 'red' },
                    { text: ` experience points.`, color: 'white' },
                ]);
                await this.simpleXpCheck(playerName);

                
            } else {
                //input too much xp.
                this.tellPlayerRaw(playerName, [
                    { text: `Not enough stored experience points.`, color: 'white' },
                ]);
                await this.getAll(playerName, currentBalance);
            }
        }
    }

    async getAll(playerName, currentBalance) {
        //restoring all points to player
        let pointsRetrievedAll = await this.addPlayerExperience(playerName, currentBalance);

        //removing those points from their xp store
        await this.updatePlayerXpStore(playerName, currentBalance - pointsRetrievedAll);

        //informing player current point balance
        this.tellPlayerRaw(playerName, [
            { text: `You have retrieved `, color: 'white' },
            { text: `${pointsRetrievedAll}`, color: 'red' },
            { text: ` experience points.\nYou have `, color: 'white' },
            { text: `0`, color: 'red' },
            { text: ` points remaining.`, color: 'white' },
        ]);
    }

    async handleXpGive(playerName, recieving, giftAmount) {
        let loggedInPlayers = await this.getListOfOnlinePlayers();

        if (recieving && recieving.toLowerCase() === 'accept') this.handleXpGiveAccept(playerName);

        if (loggedInPlayers.indexOf(recieving) !== -1) {
            // If the first word is a players name then offer stored experience

            let currentBalance = await this.currentBalance(playerName);

            if (!giftAmount) {
                //no specified amount offered, this will offer the entire amount stored.
                await this.giveAll(playerName, recieving, currentBalance);

            } else {
                //make giftAmount an integer
                let giftAmountInt = this.amountInt(giftAmount);

                if (!(giftAmountInt >= 0)){
                    //They got here because they messed up
                    this.tellPlayerRaw(playerName, [
                        { text: `Must input a positive number.\n`, color: 'red' },
                        { text: `!xp give playerName 50`, color: 'green' },
                        { text: ` would gift 50 experience points to that player.`, color: 'red' },
                    ]);
                    return;
                }               
                //offered amount must be a positive number.

                if (giftAmountInt <= currentBalance){
                    this.tellPlayerRaw(playerName, [
                        { text: `Offered `, color: 'white' },
                        { text: `${giftAmountInt}`, color: 'red' },
                        { text: ` stored experience points to `, color: 'white' },
                        { text: `${recieving}.`, color: 'green' },
                    ]);
        
                    this.tellPlayerRaw(recieving, [
                        { text: `${playerName} is offering you `, color: 'white' },
                        { text: `${giftAmountInt}`, color: 'red' },
                        { text: ` stored experience points.\nType `, color: 'white' },
                        { text: `!xp give accept`, color: 'green' },
                        { text: ` to accept`, color: 'white' },
                    ]);
    
                    this.giveOffers[recieving] = [playerName, giftAmountInt];
                } else {
                    //They don't have enough stored xp for offered amount. will offer entire amount stored.
                    this.tellPlayerRaw(playerName, [
                        { text: `You don't have enough Experience points stored.`, color: 'white' },
                    ]);
                    await this.giveAll(playerName, recieving, currentBalance);
                }
            }           
        } else {
            // they got here because they messed up
            if (!recieving) {
                this.tellPlayer(playerName, 'You need to target a player.', 'red');
                
            } else if (!(recieving === "accept")) {
                this.tellPlayerRaw(playerName, [
                    { text: `Player `, color: 'white' },
                    { text: `${recieving}`, color: 'aqua' },
                    { text: ` is not logged in. \nDid you mean to type `, color: 'white' },
                    { text: `!xp give accept`, color: 'green' },
                    { text: `?`, color: 'white' },
                ]);
            }
        }
    }

    async giveAll(playerName, recieving, currentBalance) {
        this.tellPlayerRaw(playerName, [
            { text: `Offered `, color: 'white' },
            { text: `${currentBalance}`, color: 'red' },
            { text: ` stored experience points to `, color: 'white' },
            { text: `${recieving}.`, color: 'green' },
        ]);

        this.tellPlayerRaw(recieving, [
            { text: `${playerName} is offering you `, color: 'white' },
            { text: `${currentBalance}`, color: 'red' },
            { text: ` stored experience points.\nType `, color: 'white' },
            { text: `!xp give accept`, color: 'green' },
            { text: ` to accept`, color: 'white' },
        ]);

        this.giveOffers[recieving] = [playerName,currentBalance];
    }

    async handleXpGiveAccept(playerName) {
        // if it is accept see if there is a player that offered xp
        // then if there is send corrent amount of xp to the accepting player
        if (this.giveOffers[playerName] === undefined) {
            this.tellPlayer(playerName, `No pending experience point offers.`, 'red');
            return;
        }
        let offeringPlayer = this.giveOffers[playerName][0];
    
        let currentBalance = await this.currentBalance(offeringPlayer);

        if (offeringPlayer) {
            //add points to recieving player
            await this.addPlayerExperience(playerName, this.giveOffers[playerName][1]);
            //removing those points from offering player xp store
            await this.updatePlayerXpStore(offeringPlayer, currentBalance - this.giveOffers[playerName][1]);

            await this.simpleXpCheck(offeringPlayer);
            this.tellPlayer(offeringPlayer, 'Offer accepted');

            this.tellPlayer(playerName, 'Offer accepted');
            this.giveOffers[playerName] = null;

        } else {
            this.tellPlayer(playerName, `No pending experience point offers.`, 'red');
        } 
    }

    async handleXpCheck(playerName, checkAmount) {       
        let totalPoints = await this.totalPoints(playerName);
        let playerLevels = await this.getPlayerExperience(playerName, 'levels');

        if (!checkAmount) {
            this.simpleXpCheck(playerName);
            return;
        }
        //make checkAmount an integer
        let checkAmountInt = this.amountInt(checkAmount);

        if (checkAmountInt < playerLevels && checkAmountInt >= 0) {
            //this argument will tell the player how many points they would need to store to get down to that level
            let pointsNeededToStore = totalPoints - this.convertLevelsToPoints(checkAmountInt, 0);

            this.tellPlayerRaw(playerName, [
                { text: `If you expend `, color: 'white' },
                { text: `${pointsNeededToStore}`, color: 'red' },
                { text: ` experience points, You'll have `, color: 'white' },
                { text: `${checkAmountInt}`, color: 'red' },
                { text: ` levels.`, color: 'white' },
            ]);

        } else if (checkAmountInt > playerLevels) {
            //this argument will tell the player how many points they need to get to that level
            let pointsNeededToGet = this.convertLevelsToPoints(checkAmountInt, 0) - totalPoints;

            this.tellPlayerRaw(playerName, [
                { text: `If you gain `, color: 'white' },
                { text: `${pointsNeededToGet}`, color: 'red' },
                { text: ` experience points, You'll have `, color: 'white' },
                { text: `${checkAmountInt}`, color: 'red' },
                { text: ` levels.`, color: 'white' },
            ]);

        } else if (checkAmountInt === playerLevels) {
            //this argument tells how many total points it takes to reach their current level
            let pointsNeededForCurrentLevel = this.convertLevelsToPoints(checkAmountInt,0);

            this.tellPlayerRaw(playerName, [
                { text: `It took `, color: 'white' },
                { text: `${pointsNeededForCurrentLevel}`, color: 'red' },
                { text: ` total experience points to reach this level.`, color: 'white' },
            ]);

        } else {
            //they got here because they messed up.
            this.tellPlayerRaw(playerName, [
                { text: `Must input a positive number.\n`, color: 'red' },
                { text: `!xp check 20`, color: 'green' },
                { text: ` tells you how many experience points are needed to reach that level.`, color: 'red' },
            ]);
        }  
    }
    
    async simpleXpCheck(playerName) {
        let currentBalance = await this.currentBalance(playerName);

        let levelsStored = this.convertPointsToLevels(currentBalance)[0];
        let pointsStored = this.convertPointsToLevels(currentBalance)[1];

        this.tellPlayerRaw(playerName, [
            { text: `You have `, color: 'white' },
            { text: `${currentBalance}`, color: 'red' },
            { text: ` total stored experience points.\n`, color: 'white' },
            { text: `${levelsStored}`, color: 'red' },
            { text: ` levels with `, color: 'white' },
            { text: `${pointsStored}`, color: 'red' },
            { text: ` remaining experience points.`, color: 'white' },
        ]);        
    }

    amountInt(amount) {
        if (typeof parseInt(amount, 10) === 'number') {
            return parseInt(amount, 10)
        } else {
            return -1;
        }
    };

    async totalPoints(playerName) {
        let playerLevels = await this.getPlayerExperience(playerName, 'levels');
        let playerPoints = await this.getPlayerExperience(playerName, 'points');        
        return this.convertLevelsToPoints(playerLevels, playerPoints);
    };

    async currentBalance(playerName) {
        //checking current xpStore balance
        if (await this.readPlayerXpStore(playerName) === undefined) return 0
        else return await this.readPlayerXpStore(playerName);
    };
}
