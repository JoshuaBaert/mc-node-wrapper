module.exports = Base => class extends Base {
    //add a constructor and add cooldowns to constructor
    constructor() {
        super();
        this.available = true;
    }

    //sets available to false and runs cooldown(time)

    startCooldown(command) {
        //command is on cooldown. currently doesn't record how long player needs to wait to use command. will add later.
        if (this.available = false) {
            this.whisperPlayerRaw(args[0], [
                { text: `!${command} `, color: 'white' },
                { text: `has a cooldown of `, color: 'red' },
                { text: `${time / 60000} minutes.`, color: 'white' },
                { text: `Try again later.`, color: 'red' },
            ]); 
        } else if (this.available = true) {
        //execute command and set available to false.

        this.available = false;
        };
        
    }

    //sets available to true after elapsed time
    timer(time) {
        return setTimeout(function() {this.available = true}, time);
    }



}
