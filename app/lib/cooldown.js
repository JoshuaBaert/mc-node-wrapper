module.exports = Base => class extends Base {
    //add a constructor and add cooldowns to constructor
    constructor() {
        super();
        this.onCooldownMap = {}
        
        //object containing the cooldown times for the commands. new commands would need a new property added here.
        this.coodownTimes = {
            'home': 1000 * 60 * 15,
            'warp': 1000 * 60 * 15
        }
    }

    //Check cooldown. place before code you want to execute.
    cooldownCheck(command, playerName) {
        //instantiate playerName variable if it hasn't been instantiated yet.
        if (!this.onCooldownMap[playerName]) this.onCooldownMap[playerName] = {}

        //if command is on cooldown then return true.
        if (this.onCooldownMap[playerName][command] == true) {
            this.whisperPlayerRaw(playerName, [
                { text: `!${command} `, color: 'white' },
                { text: `has a cooldown of `, color: 'red' },
                { text: `${this.coodownTimes[command] / 60000} minutes`, color: 'white' },
                { text: ` total.\nTry again later.`, color: 'red' },
            ]);
            return true;
        } else return false;
    }

    //Starts Cooldown. place after code you want to execute.
    cooldownStart(command, playerName) {
        if (!this.onCooldownMap[playerName]) this.onCooldownMap[playerName] = {}

        this.onCooldownMap[playerName][command] = true;
        this.cooldownTimer(command, playerName, this.coodownTimes[command]);      
    }

    //sets onCooldownMap to true after elapsed time
    cooldownTimer(command, playerName, time) {
        return setTimeout( () => {this.onCooldownMap[playerName][command] = false}, time);
    }   
}
