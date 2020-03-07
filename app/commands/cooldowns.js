module.exports = Base => class extends Base {
    constructor() {
        super();

        this.helpShortDescription.home = [
            'Check which commands are on cooldown.',
        ];

        this.helpFullDescription.home = [
            { text: '', color: 'white' },
            { text: '!cooldowns ', color: 'green' },
            'Tells you how long you need to wait to use each command currently on cooldown.',          
        ];
    }

    handleCooldowns(playerName) {
        //instantiate playerName variable if it hasn't been instantiated yet.
        if (!this.onCooldownMap[playerName]) this.onCooldownMap[playerName] = {};

        let cooldownArr = Object.values(this.onCooldownMap[playerName]);
        let everyOutput = cooldownArr.every((i) => i === false);

        console.log(cooldownArr, ' ', everyOutput)

        if (everyOutput === true) {
            return this.tellPlayer(playerName, 'All your commands are ready to use.', 'green')
        };

        for (let command in this.onCooldownMap[playerName]) {
            if (typeof this.onCooldownMap[playerName][command] == 'number') {
                this.cooldownCheck(`${command}`, playerName);
            }  
        }
    }
}