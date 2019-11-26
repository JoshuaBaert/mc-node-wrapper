module.exports = Base => class extends Base {
    //add a constructor and add cooldowns to constructor
    constructor() {
        super();
        this.onCooldownMap = {}
    }

    //method to check if a command is on cooldown.
    cooldownCheck(command, playerName, time) {
        //instantiate playerName variable if it hasn't been instantiated yet.
        if (!this.onCooldownMap[playerName]) this.onCooldownMap[playerName] = {}
        console.log(this.onCooldownMap[playerName][command])

        //check to make sure the command doesn't have any arguments
            //if command is on cooldown then return true.
        if (this.onCooldownMap[playerName][command] == true) {
            console.log('command on cooldown')
            this.whisperPlayerRaw(playerName, [
                { text: `!${command} `, color: 'white' },
                { text: `has a cooldown of `, color: 'red' },
                { text: `${time / 60000} minutes`, color: 'white' },
                { text: ` total.\nTry again later.`, color: 'red' },
            ]);
            return true;
        }
    }

    //method to start cooldown. should be seperate from check so that there is more versatility in code. there should be an option to check before you execute command.
    //in theory you put the check before the command and the start after.
    cooldownStart(command, playerName, time) {
        if (!this.onCooldownMap[playerName]) this.onCooldownMap[playerName] = {}

        this.onCooldownMap[playerName][command] = true;
        this.cooldownTimer(command, playerName, time);       

        return;
    }

    //sets onCooldownMap to true after elapsed time
    cooldownTimer(command, playerName, time) {
        return setTimeout( () => {this.onCooldownMap[playerName][command] = false}, time);
    }

    
}

//this all works perfectly with the home command. i'll need to change some things so it can be compatable with warp.