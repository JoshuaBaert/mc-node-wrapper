module.exports = Base => class extends Base {
    constructor() {
        super();
        
    }

    handleXp(playerName, args) {
    //choose a function based on the args.    
        (() => {
            switch (args[0].toLowerCase()) {
            case 'store':
                return this.handleXpStore(playerName, args.slice(1));
            case 'get':
                return this.handleXpGet(playerName, args.slice(1));
            case 'check':
                return this.handleXpCheck(playerName);
            default:
                //they got here by typing the wrong thing, will list the things they can type.
                return this.whisperPlayerRaw(playerName, [
                    { text: `To store all XP, type `, color: 'white' },
                    { text: `!xp store`, color: 'green' },
                    { text: `.\nTo retrieve all stored XP, type `, color: 'white' },
                    { text: `!xp get`, color: 'green' },
                    { text: `.\nYou can also store and retieve partial amounts of XP by appending a `, color: 'white' },
                    { text: `number`, color: 'red' },
                    { text: ` to the command.\nEG: `, color: 'white' },
                    { text: `!xp get 3`, color: 'green' },
                    { text: ` will retrieve 3 XP levels.\nType `, color: 'white' },
                    { text: `!xp check`, color: 'green' },
                    { text: ` to check how many XP levels you have stored.`, color: 'white' },
                ]);;
            }
        })();
    }

    handleXpStore(playerName, ...args) {
        //did player append a number to the command?
        if (!args[0]) {

        } else {

        }

    }

    handleXpGet(playerName, ...args) {
        //did player append a number to the command?
        if (!args[0]) {

        } else {
            
        }

    }

    handleXpCheck(playerName) {

    }

    getPlayerXp(level) {

    }

    XpFromDatabase(level) {

    }
}

/*
!xp store
set var level to current player level
store var level to database
write-to-mine that player's new xp level is current player level - var level (should be 0)

!xp store #
set var level to #
store var level to database
write-to-mine that player's new xp level is current player level - var level

!xp get
set var level to database
set database to 0
write-to-mine that player's new xp level is current player level + var level

!xp get #
check # <= database
set var level to #
set database to database - #
write-to-mine that player's new xp level is current player level + var level

!xp check
set var level to database
whisperPlayerRaw message: You have level XP points stored.
*/