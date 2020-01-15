module.exports = Base => class extends Base {
    constructor() {
        super();
        
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
        //what is the total number of experience points a player has?
        let playerLevels = await this.readPlayerExperienceLevels(playerName);
        let playerPoints = await this.readPlayerExperiencePoints(playerName);        
        let totalPoints = this.convertLevelsToPoints(playerLevels, playerPoints);

        //checking current xpStore balance
        let currentBalance = await this.readPlayerXpStore(playerName);
        
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

    }

    async handleXpGet(playerName, args) {
        //checking current xpStore balance
        let currentBalance = await this.readPlayerXpStore(playerName);

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
        if (!args[0]) {

        } else {
           
            //[20:17:45 INFO]: [Gobsmack90: Gave 5 experience levels to Gobsmack90]
        }
    }

    async handleXpCheck(playerName) {
        let readXp = await this.readPlayerXpStore(playerName);
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

/*
!xp store
set var points to current player points
store var points to database
write-to-mine that player's new xp points is current player points - var points (should be 0)

!xp store #
set var points to #
store var points to database
write-to-mine that player's new xp points is current player points - var points

!xp get
set var points to database
set database to 0
write-to-mine that player's new xp points is current player points + var points

!xp get #
check # <= database
set var points to #
set database to database - #
write-to-mine that player's new xp points is current player points + var points

!xp check
set var points to database
whisperPlayerRaw message: You have points XP points stored.
*/