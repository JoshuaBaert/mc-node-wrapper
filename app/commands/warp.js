module.exports = Base => class extends Base {
    constructor() {
        super();
        this.warpRequests = {};
    }

    async handleWarp(playerName, args) {
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

    handleWarpAccept(playerName) {
        // if it is accept see if there is a player that requested a warp
        // then if there is warp them to the accepting player
        let requestingPlayer = this.warpRequests[playerName];
        if (requestingPlayer) {
            this.writeToMine(`tp ${requestingPlayer} ${playerName}`);
            this.whisperPlayer(requestingPlayer, 'Warp accepted');
            this.whisperPlayer(playerName, 'Warp accepted');
            this.warpRequests[playerName] = null;

            //cooldownStart goes here.
            this.cooldownStart('warp', requestingPlayer);

        } else {
            this.whisperPlayer(playerName, `No pending warp requests.`, 'red');
        }
    }
};
