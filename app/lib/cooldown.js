module.exports = Base => class extends Base {
    //add a constructor and add cooldowns to constructor
    constructor() {
        super();
        this.onCooldownMap = {}
        
        //object containing the cooldown times for the commands. new commands would need a new property added here.
        this.coodownTimes = {
            'home': 1000 * 30 * 1,
            'warp': 1000 * 60 * 15,
            'location': 1000 * 60 * 30
        }
    }

    //Check cooldown. place before code you want to execute.
    cooldownCheck(command, playerName) {
        //instantiate playerName variable if it hasn't been instantiated yet.
        if (!this.onCooldownMap[playerName]) this.onCooldownMap[playerName] = {}

        //if command is on cooldown then return true.
        if (typeof this.onCooldownMap[playerName][command] == "number") {
            this.whisperPlayerRaw(playerName, [
                { text: `!${command} `, color: 'white' },
                { text: `will be available in `, color: 'red' },
                { text: `${Number((this.timeLeft(command, playerName)).toFixed(2))}`, color: 'white' },
                { text: ` minutes.`, color: 'red' },
            ]);
            return true;
        } else return false;
    }

    //Starts Cooldown. place after code you want to execute.
    cooldownStart(command, playerName) {
        if (!this.onCooldownMap[playerName]) this.onCooldownMap[playerName] = {}

        this.onCooldownMap[playerName][command] = Date.now() + this.coodownTimes[command];
        console.log(this.onCooldownMap[playerName][command]);
        this.cooldownTimer(command, playerName, this.coodownTimes[command]);      
    }

    //sets onCooldownMap to true after elapsed time
    cooldownTimer(command, playerName, time) {
        return setTimeout( () => {this.onCooldownMap[playerName][command] = false}, time);
    }
    
    timeLeft(command, playerName) {
        return (this.onCooldownMap[playerName][command] - Date.now())/60000;
    }


    // timeLeft(playerName, command) {
    //     let c = 0;
    //     let t;

    //     clearTimeout(t);

    //     function timedCount() {
    //         ++c
    //         t = setTimeout(timedCount, 1000);
    //     }

    //     while (this.onCooldownMap[playerName][command] == true) {
    //         timedCount();
    //     }

    //     return this.coodownTimes[command]/1000 - c;
    // }
}
