module.exports = Base => class extends Base {
    //add a constructor and add cooldowns to constructor
    constructor() {
        super();
        this.available = true;
    }

    //sets available to false and runs cooldown(time)

    cooldown(command, time, args, playerName) {
        //command is on cooldown. currently doesn't record how long player needs to wait to use command. will add later.
        console.log(this.available)
        if (this.available[command] == false) {
            console.log('command not available')
            this.whisperPlayerRaw(args[0], [
                { text: `!${command} `, color: 'white' },
                { text: `has a cooldown of `, color: 'red' },
                { text: `${time / 60000} minutes.`, color: 'white' },
                { text: `Try again later.`, color: 'red' },
            ]);
            return;
        } else {
        //execute command and set available to false for duration of time. Then return false so we can use that
            console.log("made it into else")
            this.available[command] = false;
            this.cooldownTimer(command, time);
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
        return setTimeout( () => {this.available[command] = true}, time);
    }

//cooldown is currently global to all players. need to fix.
//

}
