module.exports = Base => class extends Base {
    //add a constructor and add cooldowns to constructor
    constructor() {
        super();
        this.onCooldownMap = {}
        
        //object containing the cooldown times for the commands. new commands would need a new property added here.
        this.coodownTimes = {
            '!home': 1000 * 60 * 15,
            '!warp': 1000 * 60 * 15,
            'Location teleporting': 1000 * 60 * 30
        }

        //allows us to see exactly how much time is left during the cooldown.
        this.timeLeft = {
            minutes: (playerName, command) => Math.floor((this.onCooldownMap[playerName][command] - Date.now())/60000),
            seconds: (playerName, command) => Math.floor(((this.onCooldownMap[playerName][command] - Date.now())/1000) - this.timeLeft.minutes(playerName, command) * 60)
        }
    }

    //Check cooldown. place before code you want to execute.
    cooldownCheck(command, playerName) {
        //instantiate playerName variable if it hasn't been instantiated yet.
        if (!this.onCooldownMap[playerName]) this.onCooldownMap[playerName] = {}

        //if command is on cooldown then return true. typeof will always be a number or false.
        if (typeof this.onCooldownMap[playerName][command] == "number") {
            this.whisperPlayerRaw(playerName, [
                { text: `${command} `, color: 'white' },
                { text: `will be available in `, color: 'red' },
                { text: `${this.timeLeft.minutes(playerName, command)}`, color: 'white' },
                { text: ` minutes and `, color: 'red' },
                { text: `${this.timeLeft.seconds(playerName, command)}`, color: 'white' },
                { text: ` seconds.`, color: 'red' },
            ]);
            return true;
        } else return false;
    }

    //Starts Cooldown. place after code you want to execute.
    cooldownStart(command, playerName) {
        if (!this.onCooldownMap[playerName]) this.onCooldownMap[playerName] = {}

        this.onCooldownMap[playerName][command] = Date.now() + this.coodownTimes[command];

        this.cooldownTimer(command, playerName, this.coodownTimes[command]);      
    }

    //sets onCooldownMap to true after elapsed time
    cooldownTimer(command, playerName, time) {
        return setTimeout( () => {this.onCooldownMap[playerName][command] = false}, time);
    }
}
