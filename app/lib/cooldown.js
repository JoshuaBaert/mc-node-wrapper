module.exports = Base => class extends Base {
    //add a constructor and add cooldowns to constructor
    constructor() {
        super();
        this.cooldowns = {};
    }
    

    checkCooldown(playerName, command, time) {
        console.log('hello world');
        //make sure command is valid. currently hardcoded to only accept !home and !warp, likely we'll need change this sooner than later.
        validCommand => {
            if (command.toLowerCase() !== "!home" || "!warp") return;
        
        //array of commands currently on cooldown.
        let onCooldown = [];

        //checking if command is in the array and responding accordingly.
        if (onCooldown.some(i => i == command) {
            this.whisperPlayerRaw(args[0], [
                { text: `${command} is on cooldown for `, color: 'white' },
                { text: `${time}`, color: 'red' },
                { text: ` minutes.`, color: 'white' },
                ]);
        }
    }

    startCooldown(playerName, command, time) {
    }
};







// {
//     if (args[0] && args[0].toLowerCase() === 'accept') {
//         this.handleWarpAccept(playerName);
//     } else if (this.loggedInPlayers.indexOf(args[0]) !== -1) {
//         // If the first word is a players name then make a request for warp
//         this.whisperPlayerRaw(args[0], [
//             { text: `Do you want to accept warp from ${playerName}? \nType `, color: 'white' },
//             { text: `!warp accept`, color: 'green' },
//             { text: ` to accept`, color: 'white' },
//         ]);
//         this.warpRequests[args[0]] = playerName;
//     } else {
//         // they got here because they messed up
//         if (!args[0]) {
//             this.whisperPlayer(playerName, 'You need to target a player.', 'red');
//             // this.writeToMine(`w ${playerName} You need to target a player`);
//         } else {
//             this.whisperPlayerRaw(playerName, [
//                 { text: `Player `, color: 'white' },
//                 { text: `${args[0]}`, color: 'aqua' },
//                 { text: ` is not logged in. \nDid you mean to type `, color: 'white' },
//                 { text: `!warp accept`, color: 'green' },
//                 { text: `?`, color: 'white' },
//             ]);
//         }
//     }
// }

//goals: a cooldown object that can be added to any object with arguements that set length of cooldown,
//add the object to the home command and possibly the warp command.

//function to check cooldown when player tries to input command.
/*if cooldown is active: whisper player "{command} is on cooldown for {time}. try again later."
else execute command and put command on cooldown.*/

//function to start cooldown.
/*player inputs {command}
start a countdown timer at {time}. while {time} > 0, {command} does not work.
if command already on cooldown continue as normal. do not reset cooldown.*/