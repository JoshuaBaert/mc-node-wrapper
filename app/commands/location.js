module.exports = Base => class extends Base {
    constructor() {
        super();

        this.helpShortDescription.locations = [
            'gives you a list of server locations.',
        ];

        this.helpFullDescription.locations = [
            { text: '', color: 'white' },
            { text: '!locations', color: 'green' },
            ' gives you a list of server locations.',
        ];
    }

    handleLocation(playerName, args) {
        (() => {
            switch (args[0]) {
            case 'set':
                return this.setNewLocation(playerName, args.slice(1));
            case 'remove':
                return this.removeLocation(playerName, args.slice(1));
            default:
                return;
            }
        })();
    }

    async handleLocations(playerName) {
        let locationNames = (await this.readLocations())
            .map(x => x.name)
            .sort()
            .map(name => {
                return { text: `!${name}\n`, color: 'green' };
            });

        if (locationNames.length === 0) return this.tellPlayer(playerName, 'No locations yet.', 'red');

        this.tellPlayerRaw(playerName, [
            `This server has `,
            { text: locationNames.length, color: 'aqua' },
            ` locations:\n`,
            ...locationNames,
            'Try traveling to one with ',
            { text: locationNames[0].text, color: 'green' },
        ]);
    }

    async removeLocation(playerName, [locationName]) {
        if (!this.checkIsAuthorized(playerName)) return this.tellPlayer(playerName, 'You can not perform this command', 'red');
        if (!locationName) return this.tellPlayer(playerName, 'You need to provide a name for this location', 'red');

        try {
            await this.deleteLocation(locationName);
        } catch (err) {
            console.error(err);
            return this.tellPlayer(playerName, 'Error deleting location', 'red');
        }

        this.tellPlayerRaw(playerName, ['Removed location ', { text: locationName, color: 'aqua' }, '. (if it existed ¯\\_(ツ)_/¯)']);
    }

    async setNewLocation(playerName, [locationName]) {
        if (!this.checkIsAuthorized(playerName)) return this.tellPlayer(playerName, 'You can not perform this command', 'red');
        if (!locationName) return this.tellPlayer(playerName, 'You need to provide a name for this location', 'red');

        let { world, pos, rot } = await this.getPlayerLocation(playerName);
        let newLocation;

        try {
            newLocation = await this.createLocation(locationName.toLowerCase(), world, pos, rot);
        } catch (err) {
            (() => {
                switch (err.code) {
                case 11000 :
                    return this.tellPlayerRaw(playerName, [
                        'Location ', { text: locationName, color: 'aqua' }, ' is already ', { text: 'taken.', color: 'red' },
                    ]);
                default:
                    return this.tellPlayer(playerName, 'Error setting location', 'red');
                }
            })();
        }

        this.tellPlayerRaw(playerName, [
            'Set location ', { text: newLocation.name, color: 'aqua' }, ` to the position of [${newLocation.pos.join(', ')}]`,
        ]);
    }

    async checkLocationAndTeleport(playerName, locationName) {
        let location = await this.readLocation(locationName);
        if (!location) return false;

        //cooldown check goes here
        if (this.cooldownCheck('location', playerName, [
            { text: `!${locationName}`, color: 'white' },
            { text: ` and other `, color: 'red' },
            { text: `location`, color: 'white' },
            { text: ` commands will be available in `, color: 'red' }]) === true) return true;

        this.writeToMine(`execute in ${location.world} run tp ${playerName} ${location.pos.join(' ')} ${location.rot.join(' ')}`);

        //cooldown start goes here
        this.cooldownStart('location', playerName);

        return true;
    }

    checkIsAuthorized(playerName) {
        // TODO Add more complicated Auth
        return playerName === 'Joshyray';
    }
};
