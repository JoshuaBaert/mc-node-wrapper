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
            { text: '!warp accept', color: 'green' },
            ' accepts a warp request from the next player in the queue.\n',
            { text: '!warp decline', color: 'green' },
            ' declines a warp request from the next player in the queue.\n',
            { text: '!warp queue', color: 'green' },
            ' lists players who have sent you a warp request.\n',
            { text: '!warp accept/decline all', color: 'green' },
            ' accepts or declines warp requests from all players in the queue.',
        ];
    }

    async handleWarp(playerName, args) {       
        // Check to see if the player is in the end if so don't allow anything home related
        // I could have checked upon request if the recipient is in the end but decided it wasn't worth the extra code
        if ((await this.getPlayerDimension(playerName)) === 'minecraft:the_end') {
            return this.tellPlayer(playerName, 'Sorry cannot use the warp command in the end', 'red');
        }
        
        //choose a function based on the args.   
        if (!args[0]) {
            return this.handleWrongWarpInput(playerName);
        } else {
            let loggedInPlayers = await this.getListOfOnlinePlayers();
            if (loggedInPlayers.indexOf(args[0]) !== -1) {
                // If the first word is a players name then make a request for warp
                let index = loggedInPlayers.indexOf(args[0]);
                let warpTo = loggedInPlayers[index];
                return this.handleWarpRequest(playerName, warpTo);
            }

            (() => {
                switch (args[0].toLowerCase()) {
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
            { text: `If you meant to type the name of a player, make sure it's spelled right, and that they're logged in.\n`, color: 'white' },
            { text: `Type `, color: 'white' },
            { text: `!help warp`, color: 'green' },
            { text: ` for a list of commands.\n`, color: 'white' },   
        ]);
    }

    handleWarpRequest(playerName, warpTo) {  
        //cooldownCheck goes here
        if (this.cooldownCheck('warp', playerName) == true) return;

        //if playerName is already in the queue of a player
        for (let k in this.warpRequests) {
            if (this.warpRequests[k].includes(playerName)) {
                return this.tellPlayer(playerName, `Already sent a request to ${k}.`, 'red');
            }
        } 

        //if playerName is not already on warpTo's queue addToQueue puts them on it.
        if (this.addToQueue(warpTo, playerName) == false) {
            this.tellPlayerRaw(playerName, ['Sent warp request to ', { text: warpTo, color: 'green' }]);

            this.tellPlayerRaw(warpTo, [
                { text: `Do you want to accept warp from ${playerName}? \nType `, color: 'white' },
                { text: `!warp accept`, color: 'green' },
                { text: ` to accept, otherwise type `, color: 'white' },
                { text: `!warp decline`, color: 'green' },
            ]);

            //2 minute timer. if player request doesn't get a response they're removed from queue.
            const queueTime = 1000 * 60 * 2
            this.queueTimer(warpTo, playerName, queueTime)
            return;
        } 
    }

    handleWarpAccept(playerName, all) {
        //instantiate warp queue if it hasn't been instantiated yet.
        if (!this.warpRequests[playerName]) this.warpRequests[playerName] = [];
        
        // if no players on the queue
        if (this.warpRequests[playerName].length === 0) {
            this.tellPlayer(playerName, `No pending warp requests.`, 'red');
            return;
        }

        if (!all) {
            //warp requesting player to the accepting player
            let requestingPlayer = this.warpRequests[playerName][0];

            //execute warp and remove from array
            this.writeToMine(`tp ${requestingPlayer} ${playerName}`);
            this.tellPlayer(requestingPlayer, 'Warp accepted');
            this.tellPlayer(playerName, 'Warp accepted');
            this.warpRequests[playerName].shift();

            //cooldownStart goes here.
            this.cooldownStart('warp', requestingPlayer);

        } else if (all === 'all') {
            this.warpRequests[playerName].forEach(requestingPlayer => {
                //execute warp on each
                this.writeToMine(`tp ${requestingPlayer} ${playerName}`);
                this.tellPlayer(requestingPlayer, 'Warp accepted');
    
                //cooldownStart goes here.
                this.cooldownStart('warp', requestingPlayer);
            });
    
            //clear requests from queue
            this.warpRequests[playerName] = [];
            this.tellPlayer(playerName, 'All Warp requests accepted');

        } else {
            return this.tellPlayerRaw(playerName, [
                { text: `Not a command.\n`, color: 'red' },
                { text: `Did you mean `, color: 'white' },
                { text: `!warp accept all`, color: 'green' },
                { text: `?`, color: 'white' },
            ]);
        }
    }

    handleWarpDecline(playerName, all) {
        //instantiate warp queue if it hasn't been instantiated yet.
        if (!this.warpRequests[playerName]) this.warpRequests[playerName] = [];
        
        // if no players on the queue
        if (this.warpRequests[playerName].length === 0) {
            this.tellPlayer(playerName, `No pending warp requests.`, 'red');
            return;
        }

        if (!all) {
            //decline requesting player
            let requestingPlayer = this.warpRequests[playerName][0];

            //decline request and remove from array
            this.tellPlayer(requestingPlayer, 'Warp declined');
            this.tellPlayer(playerName, 'Warp declined');
            this.warpRequests[playerName].shift();

        } else if (all === 'all') {
            this.warpRequests[playerName].forEach(requestingPlayer => {
                //decline each
                this.tellPlayer(requestingPlayer, 'Warp declined');
            });
    
            //clear requests from queue
            this.warpRequests[playerName] = [];
            this.tellPlayer(playerName, 'All Warp requests declined');

        } else {
            return this.tellPlayerRaw(playerName, [
                { text: `Not a command.\n`, color: 'red' },
                { text: `Did you mean `, color: 'white' },
                { text: `!warp decline all`, color: 'green' },
                { text: `?`, color: 'white' },
            ]);
        }
    }

    handleWarpQueue(playerName) {
        //instantiate warp queue if it hasn't been instantiated yet.
        if (!this.warpRequests[playerName]) this.warpRequests[playerName] = [];

        // if no players on the queue
        if (this.warpRequests[playerName].length === 0) {
            this.tellPlayer(playerName, `No pending warp requests.`, 'red');
            return;
        }

        this.tellPlayer(playerName, 'The following players have pending warp requests:');
        //list all players on queue
        this.warpRequests[playerName].forEach(requestingPlayer => {
            this.tellPlayerRaw(playerName, [
                { text: `${requestingPlayer}`, color: 'aqua' },
            ]);
        });
    }

    addToQueue(acceptingPlayer, requestingPlayer) {
        //instantiate warp queue if it hasn't been instantiated yet.
        if (!this.warpRequests[acceptingPlayer]) this.warpRequests[acceptingPlayer] = [];

        //if player is NOT already on queue...
        if (this.warpRequests[acceptingPlayer].indexOf(requestingPlayer) === -1) {
            //...push requesting player to back of queue
            this.warpRequests[acceptingPlayer].push(requestingPlayer);
            return false;
        }

        //if player is on queue
        return true;
    }

    queueTimer(acceptingPlayer, requestingPlayer, time) {
        //it's necessary to remove players from queues after some time so they don't get trapped if their request is never accepted/rejected
        setTimeout(() => {
            const index = this.warpRequests[acceptingPlayer].indexOf(requestingPlayer);
            if (index > -1) {
                this.warpRequests[acceptingPlayer].splice(index, 1);
                this.tellPlayer(acceptingPlayer, `Failed to respond to ${requestingPlayer}.`);
                this.tellPlayer(requestingPlayer, `${acceptingPlayer} did not respond.`);
            }
        }, time);
    }
};
