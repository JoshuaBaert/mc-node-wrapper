module.exports = Base => class extends Base {
    //add a constructor and add cooldowns to constructor
    constructor() {
        super();
        this.cooldowns = {};
    }
    

    checkCooldown(playerName, command, startCooldown) {
        console.log('hello world');
    }

    startCooldown(playerName, command, time) {
    }
};

//goals: a cooldown object that can be added to any object with arguements that set length of cooldown,
//add the object to the home command and possibly the warp command.

//function to check cooldown when player tries to input command.
/*if cooldown is active: whisper player "{command} is on cooldown for {time}. try again later."
else execute command and put command on cooldown.*/

//function to start cooldown.
/*player inputs {command}
start a countdown timer at {time}. while {time} > 0, {command} does not work.
if command already on cooldown continue as normal. do not reset cooldown.*/