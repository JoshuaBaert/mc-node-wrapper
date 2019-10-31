module.exports = Base => class extends Base {
    constructor() {
        super();
        this.warpRequests = {};
    }

    handleWarp(playerName, args) {
        if (args[0].toLowerCase() === 'accept') {
            // if it is accept see if there is a player that requested a warp
            // then if there is warp them to the accepting player
            let requestingPlayer = this.warpRequests[playerName];
            if (requestingPlayer) {
                this.writeToMine(`tp ${requestingPlayer} ${playerName}`);
                this.warpRequests[playerName] = null;
            } else {
                this.writeToMine(`w ${playerName} No pending warp requests.`);
            }
        } else if (this.loggedInPlayers.indexOf(args[0]) !== -1) {
            // If the first word is a players name then make a request for warp
            this.writeToMine(`w ${args[0]} Do you want to accept warp from ${playerName}? Type '!warp accept' to accept`);
            this.warpRequests[args[0]] = playerName;
        } else {
            // they got here because they messed up
            this.writeToMine(`w ${playerName} Invalid warp this is how to use warp -> '!warp PlayerName' (PlayerName is case sensitive) or '!warp accept'`)
        }
    }
};
