module.exports = Base => class extends Base {
    constructor() {
        super();

        this.helpShortDescription.cooldowns = [
            'Check which commands are on cooldown.',
        ];

        this.helpFullDescription.cooldowns = [
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

        if (everyOutput === true) {
            return this.tellPlayer(playerName, 'All your commands are ready to use.', 'green')
        };

        let combinedMessage = [{ text: `Commands on cooldown:\n`, color: 'green' },];

        for (let command in this.onCooldownMap[playerName]) {
            let TimeStampMessage = [
                { text: `${this.timeLeftMinutes(playerName, command)}`, color: 'white' },
                { text: ` minutes and `, color: 'red' },
                { text: `${this.timeLeftSeconds(playerName, command)}`, color: 'white' },
                { text: ` seconds.\n`, color: 'red' },
            ];
    
            let messageToSend = [[
                { text: `!${command} `, color: 'white' },
                { text: `will be available in `, color: 'red' }], ...TimeStampMessage,
            ];

            if (typeof this.onCooldownMap[playerName][command] == 'number') {
                combinedMessage = [...combinedMessage, ...messageToSend]
            }  
        }

        this.tellPlayerRaw(playerName, combinedMessage);
    }
}
