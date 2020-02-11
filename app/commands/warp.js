module.exports = Base => class extends Base {
    constructor() {
        super();
        this.warpRequests = {};

        this.helpShortDescription.warp = [
            'Teleport to another player ex: ',
            { text: '!warp ', color: 'green' },
            { text: 'PlayerName ', color: 'aqua' },
        ];

        this.helpFullDescription.warp = [
            { text: '', color: 'white' },
            { text: '!warp ', color: 'green' },
            { text: 'PlayerName ', color: 'aqua' },
            'sends a warp request to another player.\n',
            'They will have to accept the request first.\n(has 15 minute cooldown if accepted)\n\n',
            { text: '!warp accept', color: 'green' },
            ' accepts a warp request from the next player in the queue.',
            { text: '!warp decline', color: 'green' },
            ' declines a warp request from the next player in the queue.',
            { text: '!warp queue', color: 'green' },
            ' lists players who have sent you a warp request.',
            { text: '!warp accept/decline all', color: 'green' },
            ' accepts or declines warp requests from all players in the queue.',
        ];
    }

    async handleWarp(playerName, args) {
        // Check to see if the player is in the end if so don't allow anything home related
        // I could have checked upon request if the recipient is in the end but decided it wasn't worth the extra code
        if ((await this.getPlayerDimension(playerName)) === 'minecraft:the_end') {
            return this.tellPlayer(playerName, 'Sorry can not use the warp command in the end', 'red');
        }

        let warpTo;
        let loggedInPlayers = await this.getListOfOnlinePlayers();
        if (loggedInPlayers.indexOf(args[0]) !== -1) {
            // If the first word is a players name then make a request for warp
            warpTo = loggedInPlayers.indexOf(args[0]);
        }
        
        //choose a function based on the args.   
        if (!args[0]) {
            return this.handleWrongWarpInput(playerName);
        } else {
            (() => {
                switch (args[0].toLowerCase()) {
                case `${warpTo}`:
                    return this.handleWarpRequest(playerName, warpTo);
                case 'accept':
                    return this.handleWarpAccept(playerName, args[1]);
                case 'decline':
                    return this.handleWarpDecline(playerName, args[1]);
                case 'queue':
                    return this.handleWarpQueue(playerName);
                default:
                    return this.handleWrongWarpInput(playerName);             
                }
            })();
        }
    }

    handleWrongWarpInput(playerName) {
        //they got here by typing the wrong thing, will list the things they can type.
        return this.tellPlayerRaw(playerName, [
            { text: `Not a command.\n`, color: 'red' },
            { text: `Type `, color: 'white' },
            { text: `!help warp`, color: 'green' },
            { text: ` for a list of commands.\n`, color: 'white' },
            { text: `If you intended to type the name of a player, check to make sure they're logged in, and that it's spelled right.`, color: 'white' },
        ]);
    }

    async handleWarpRequest(playerName, warpTo) {
        
        //cooldownCheck goes here
        if (this.cooldownCheck('warp', playerName) == true) return;

        this.tellPlayerRaw(playerName, ['Sent warp request to ', { text: warpTo, color: 'green' }]);


        this.tellPlayerRaw(warpTo, [
            { text: `Do you want to accept warp from ${playerName}? \nType `, color: 'white' },
            { text: `!warp accept`, color: 'green' },
            { text: ` to accept`, color: 'white' },
        ]);
        this.warpRequests[warpTo] = playerName;
    }

    handleWarpAccept(playerName, args) {
        // if it is accept see if there is a player that requested a warp
        // then if there is warp them to the accepting player
        let requestingPlayer = this.warpRequests[playerName];
        if (requestingPlayer) {
            this.writeToMine(`tp ${requestingPlayer} ${playerName}`);
            this.tellPlayer(requestingPlayer, 'Warp accepted');
            this.tellPlayer(playerName, 'Warp accepted');
            this.warpRequests[playerName] = null;

            //cooldownStart goes here.
            this.cooldownStart('warp', requestingPlayer);

        } else {
            this.tellPlayer(playerName, `No pending warp requests.`, 'red');
        }
    }

    handleWarpDecline(playerName, args) {
        // if it is accept see if there is a player that requested a warp
        // then if there is warp them to the accepting player
        let requestingPlayer = this.warpRequests[playerName];
        if (requestingPlayer) {
            this.writeToMine(`tp ${requestingPlayer} ${playerName}`);
            this.tellPlayer(requestingPlayer, 'Warp accepted');
            this.tellPlayer(playerName, 'Warp accepted');
            this.warpRequests[playerName] = null;

            //cooldownStart goes here.
            this.cooldownStart('warp', requestingPlayer);

        } else {
            this.tellPlayer(playerName, `No pending warp requests.`, 'red');
        }
    }

    handleWarpQueue(playerName) {

    }
};
