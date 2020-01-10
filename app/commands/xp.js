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
            { text: `Playername`, color: 'aqua' },
            { text: `.\nYou can also gift, store and retieve partial amounts of experience by appending a `, color: 'white' },
            { text: `number`, color: 'red' },
            { text: ` to the command.\nEG: `, color: 'white' },
            { text: `!xp get 3000`, color: 'green' },
            { text: ` will retrieve 3000 experience points.\nFinally, you may type `, color: 'white' },
            { text: `!xp check`, color: 'green' },
            { text: ` to to see your stored experience.`, color: 'white' },
        ]);;
    }

    handleXpStore(playerName, args) {
        //did player append a number to the command?
        if (!args[0]) {

        } else {

        }

    }

    handleXpGet(playerName, args) {
        //did player append a number to the command?
        if (!args[0]) {

        } else {
            
        }

    }

    handleXpGive(playerName, args) {
        if (!args[0]) {

        } else {
            
        }
    }

    handleXpCheck(playerName) {
        this.whisperPlayerRaw(playerName, [
            { text: `You have `, color: 'white' },
            { text: `${this.readPlayerXpStore(playerName)}`, color: 'red' },
            { text: ` stored experience points.`, color: 'white' },
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