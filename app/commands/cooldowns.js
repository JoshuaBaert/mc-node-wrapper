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
        
    }
}