module.exports = Base => class extends Base {
    //add a constructor and add cooldowns to constructor
    constructor(command, playerName) {
        super();
        this.available = {
            [playerName]: {
                [command]: true
            }
        }
    }

    cooldownCheck(command, playerName, time, args) {
        //command is on cooldown. currently doesn't record how long player needs to wait to use command. will add later.
        console.log(this.available[playerName][command])
        if (this.available[playerName][command] == false) {
            console.log('command not available')
            this.whisperPlayerRaw(args[0], [
                { text: `!${command} `, color: 'white' },
                { text: `has a cooldown of `, color: 'red' },
                { text: `${time / 60000} minutes.`, color: 'white' },
                { text: `Try again later.`, color: 'red' },
            ]);
            return false;
        } else {
        //execute command and set available to false for duration of time. Then return false so we can use that
            console.log("made it into else")
            this.available[playerName][command] = false;
            this.cooldownTimer(command, playerName, time);
            return true;
        };
        
    }

    //sets available to true after elapsed time
    cooldownTimer(command, playerName, time) {
        return setTimeout( () => {this.available[playerName][command] = true}, time);
    }

//cooldown is currently global to all players. need to fix.
//

}
