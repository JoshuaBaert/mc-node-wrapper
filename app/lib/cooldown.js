module.exports = Base => class extends Base {
    //add a constructor and add cooldowns to constructor
    constructor() {
        super();
        this.onCooldownMap = {}
        
        //object containing the cooldown times for the commands. new commands would need a new property added here.
        this.coodownTimes = {
            '!home': 1000 * 60 * 15,
            '!warp': 1000 * 60 * 15,
            '!location': 1000 * 60 * 15
        }
    }

    //Check cooldown. place before code you want to execute. optionalDisplayCommandName lets you display a different name for a command to the player, and optionalRawMessage allows you to set a custom message sent to players.
    cooldownCheck(command, playerName, optionalRawMessage) {
        //instantiate playerName variable if it hasn't been instantiated yet.
        if (!this.onCooldownMap[playerName]) this.onCooldownMap[playerName] = {}

        //if command is on cooldown then return true. typeof will always be a number or false.
        if (typeof this.onCooldownMap[playerName][command] == "number") {
            let defaultTimeStampMessage = [
                { text: `${this.timeLeftMinutes(playerName, command)}`, color: 'white' },
                { text: ` minutes and `, color: 'red' },
                { text: `${this.timeLeftSeconds(playerName, command)}`, color: 'white' },
                { text: ` seconds.`, color: 'red' },
            ];
            
            //checks if there is a defined optionalRawMessage.
            function optionalCooldownMessage(optionalRawMessage) {
                if (typeof optionalRawMessage == "object") {
                    return [...optionalRawMessage, ...defaultTimeStampMessage];
                }
                return undefined;
            }
            
            let messageToSend = optionalCooldownMessage(optionalRawMessage) || [[
                { text: `${command} `, color: 'white' },
                { text: `will be available in `, color: 'red' }], ...defaultTimeStampMessage
            ];

            this.whisperPlayerRaw(playerName, messageToSend);
            return true;
        } else return false;
    }

    //Starts Cooldown. place after code you want to execute.
    cooldownStart(command, playerName) {
        if (!this.onCooldownMap[playerName]) this.onCooldownMap[playerName] = {}

        this.onCooldownMap[playerName][command] = Date.now() + this.coodownTimes[command];

        this.cooldownTimer(command, playerName, this.coodownTimes[command]);      
    }    

    //these methods allow us to see exactly how much time is left during the cooldown.
    timeLeftMinutes(playerName, command) {
        return Math.floor((this.onCooldownMap[playerName][command] - Date.now())/60000)
    }
    timeLeftSeconds(playerName, command) {
        return Math.floor(((this.onCooldownMap[playerName][command] - Date.now())/1000) - this.timeLeftMinutes(playerName, command) * 60)
    }

    //sets onCooldownMap to false after elapsed time
    cooldownTimer(command, playerName, time) {
        return setTimeout( () => {this.onCooldownMap[playerName][command] = false}, time);
    }
}
    