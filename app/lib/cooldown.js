module.exports = Base => class extends Base {
    //add a constructor and add cooldowns to constructor
    constructor() {
        super();
        this.available = {}
    }

    //make an available variable for each command
    addAvailable(command) {
        return this.available[command] = true;
    }

    //sets available to false and runs cooldown(time)

    cooldown(command, time, args) {
        //make sure cooldown only applies to base commands and not !home set, etc.
        if (!args.length === 0) {
            switch (command) {
                case 'home':                
                    return this.handleHome(playerName, args);
                case 'warp':
                    return this.handleWarp(playerName, args);
            }
        }
        //command is on cooldown. currently doesn't record how long player needs to wait to use command. will add later.
        if (this.available[command] = false) {
            this.whisperPlayerRaw(args[0], [
                { text: `!${command} `, color: 'white' },
                { text: `has a cooldown of `, color: 'red' },
                { text: `${time / 60000} minutes.`, color: 'white' },
                { text: `Try again later.`, color: 'red' },
            ]);
            return;
        } else if (this.available[command] = true) {
        //execute command and set available to false for duration of time. Then return false so we can use that
            this.available[command] = false;
            this.cooldownTimer(time);
            switch (command) {
                case 'home':                
                    return this.handleHome(playerName, args);
                case 'warp':
                    return this.handleWarp(playerName, args);
            }
        };
        
    }

    //sets available to true after elapsed time
    cooldownTimer(command, time) {
        return setTimeout(function() {this.available[command] = true}, time);
    }



}