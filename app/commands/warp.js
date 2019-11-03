module.exports = Base => class extends Base {
    constructor() {
        super();
        this.warpRequests = {};
    }

    handleWarp(playerName, args) {
        if (args[0] && args[0].toLowerCase() === 'accept') {
            this.handleWarpAccept(playerName);
        } else if (this.loggedInPlayers.indexOf(args[0]) !== -1) {
            // If the first word is a players name then make a request for warp
            this.writeToMine(`w ${args[0]} Do you want to accept warp from ${playerName}? Type '!warp accept' to accept`);
            this.warpRequests[args[0]] = playerName;
        } else {
            // they got here because they messed up
            if (!args[0]) {
                this.writeToMine(`w ${playerName} You need to target a player`);
            } else {
                this.writeToMine(`w ${playerName} Player ${args[0]} isn't logged in. Did you mean to type '!warp accept'`);
            }
        }
    }

    handleWarpAccept(playerName) {
        // if it is accept see if there is a player that requested a warp
        // then if there is warp them to the accepting player
        let requestingPlayer = this.warpRequests[playerName];
        if (requestingPlayer) {
            this.writeToMine(`tp ${requestingPlayer} ${playerName}`);
            this.warpRequests[playerName] = null;
        } else {
            this.writeToMine(`w ${playerName} No pending warp requests.`);
        }
    }
};
