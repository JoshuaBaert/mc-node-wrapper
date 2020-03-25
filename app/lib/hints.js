module.exports = Base => class extends Base {
    constructor() {
        super();
        this.serverHints = [
            [
                'Waiting around? Check the status of your cooldowns with ',
                { text: '!cooldowns', color: 'green' },
            ],
            [
                'Every command has detailed instructions available when you type ',
                { text: '!help ', color: 'green' },
                { text: 'command', color: 'light_purple' },
            ],
            [
                'Want more homes? You get 2 named personal homes in addition to your default home. Try ',
                { text: '!home set ', color: 'green' },
                { text: 'homeName', color: 'light_purple' },
                '.\nYou want more?! Type ',
                { text: '!help home', color: 'green' },
                ' to learn about shared homes.'
            ],
            [
                'Sharing is caring, share a home with your best friend with ',
                { text: '!home share ', color: 'green' },
                { text: 'playerName', color: 'light_purple' },
            ],
            [
                'Did you know we have special community locations anybody can warp to? type ',
                { text: '!locations', color: 'green' },
                ' for a list.'
            ],
            [
                'Got a long distance relationship in Minecraft? use ',
                { text: '!warp ', color: 'green' },
                { text: 'playerName', color: 'light_purple' },
                ' to teleport to them instantly.'
            ],
            [
                'Its a party! If multiple players try warping to you, you can accept them all at once with ',
                { text: '!warp accept all', color: 'green' },
            ],
            [
                'Feeling like a curmudgion? decline warp requests with ',
                { text: '!warp decline', color: 'green' },
            ],
            [
                'You can customize your welcome message, turn these hints off with ',
                { text: '!welcome hints', color: 'green' },
            ],
            [
                "Want to see who's online first thing? type ",
                { text: '!welcome online', color: 'green' },
            ],
            [
                'Pssst. did you know you can see your welcome message again by typing ',
                { text: '!welcome', color: 'green' },
                '?\nSounds like a good way to read all these clever hints.'
            ],
            [
                'Obtaining a level 30 required enchantment at ',
                { text: 'level 30', color: 'red' },
                ' will cost you 306 points.\nThe same enchantment at ',
                { text: 'level 33', color: 'red' },
                ' will cost you 363 points.\nUse ',
                { text: '!xp check 30', color: 'green' },
                ' to find out how many points you should store before you enchant. Economical!',
            ],
            [
                'The server can automatically store your experience every 30 minutes. Type ',
                { text: '!xp autostore ', color: 'green' },
            ],
            [
                'Are diamonds not enough to express your love? Try gifting experience instead.\n',
                { text: '!xp give ', color: 'green' },
                { text: 'playerName ', color: 'light_purple' },
                { text: '300', color: 'red' },
            ],
            [
                'I heard Josh is hoarding toilet paper.'
            ],
        ]
    }
};
