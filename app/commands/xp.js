module.exports = Base => class extends Base {
    constructor() {
        super();
        
    }

    async handleXp(playerName, args) {
        // Check to see if the player is in the end if so don't allow anything home related
        // I could have checked upon request if the recipient is in the end but decided it wasn't worth the extra code
        if ((await this.getPlayerDimension(playerName)) === 'minecraft:the_end') {
            return this.whisperPlayer(playerName, 'Sorry can not use the warp command in the end', 'red');
        }

        let loggedInPlayers = await this.getListOfOnlinePlayers();

        if (args[0] && args[0].toLowerCase() === 'accept') {
            this.handleWarpAccept(playerName);
        } else if (loggedInPlayers.indexOf(args[0]) !== -1) {
            // If the first word is a players name then make a request for warp

            //cooldownCheck goes here
            if (this.cooldownCheck('warp', playerName) == true) return;

            this.whisperPlayerRaw(playerName, ['Sent warp request to ', { text: args[0], color: 'green' }]);


            this.whisperPlayerRaw(args[0], [
                { text: `Do you want to accept warp from ${playerName}? \nType `, color: 'white' },
                { text: `!warp accept`, color: 'green' },
                { text: ` to accept`, color: 'white' },
            ]);
            this.warpRequests[args[0]] = playerName;
        } else {
            // they got here because they messed up
            if (!args[0]) {
                this.whisperPlayer(playerName, 'You need to target a player.', 'red');
                // this.writeToMine(`w ${playerName} You need to target a player`);
            } else {
                this.whisperPlayerRaw(playerName, [
                    { text: `Player `, color: 'white' },
                    { text: `${args[0]}`, color: 'aqua' },
                    { text: ` is not logged in. \nDid you mean to type `, color: 'white' },
                    { text: `!warp accept`, color: 'green' },
                    { text: `?`, color: 'white' },
                ]);
            }
        }
    }

    getPlayerXp() {

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
write-to-mine message: You have level XP points stored.
*/