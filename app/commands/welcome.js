module.exports = Base => class extends Base {
    constructor() {
        super();

        this.helpShortDescription.welcome = [
            'Customize the message that greets you when you login. ex: ',
            { text: '!welcome cooldowns', color: 'green' },
        ];

        this.helpFullDescription.welcome = [
            { text: '', color: 'white' },
            { text: '!welcome', color: 'green' },
            ' displays your current welcome message.\n\n',
            { text: 'You may toggle on/off any of the following options. Any option toggled on will display when you log in.\n', color: 'white' },
            { text: '!welcome default', color: 'green' },
            ' displays a general welcome message\n',
            { text: '!welcome online', color: 'green' },
            ' lists online players.\n',            
            { text: '!welcome help', color: 'green' },
            ' lists available commands.\n',
            { text: '!welcome cooldowns', color: 'green' },
            ' displays status of command cooldowns.\n',
            { text: '!welcome autostore', color: 'green' },
            ' displays status of your xp autostore.\n',
        ];
    }


}