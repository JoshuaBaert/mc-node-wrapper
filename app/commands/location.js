module.exports = Base => class extends Base {
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

    async removeLocation(playerName, [locationName]) {
        if (!this.checkIsAuthorized(playerName)) return this.whisperPlayer(playerName, 'You can not perform this command', 'red');
        if (!locationName) return this.whisperPlayer(playerName, 'You need to provide a name for this location', 'red');

        try {
            await this.deleteLocation(locationName);
        } catch (err) {
            console.error(err);
            return this.whisperPlayer(playerName, 'Error deleting location', 'red');
        }

        this.whisperPlayerRaw(playerName, ['Removed location ', {text: locationName, color: 'aqua'}, '. (if it existed ¯\\_(ツ)_/¯)'])
    }

    async setNewLocation(playerName, [locationName]) {
        if (!this.checkIsAuthorized(playerName)) return this.whisperPlayer(playerName, 'You can not perform this command', 'red');
        if (!locationName) return this.whisperPlayer(playerName, 'You need to provide a name for this location', 'red');

        let { world, pos, rot } = await this.getPlayerLocation(playerName);
        let newLocation;

        try {
            newLocation = await this.createLocation(locationName.toLowerCase(), world, pos, rot);
        } catch (err) {
            (() => {
                switch (err.code) {
                case 11000 :
                    return this.whisperPlayerRaw(playerName, [
                        'Location ', { text: locationName, color: 'aqua' }, ' is already ', { text: 'taken.', color: 'red' },
                    ]);
                default:
                    return this.whisperPlayer(playerName, 'Error setting location', 'red');
                }
            })();
        }

        this.whisperPlayerRaw(playerName, [
            'Set location ', { text: newLocation.name, color: 'aqua' }, ` to the position of [${newLocation.pos.join(', ')}]`,
        ]);
    }

    async checkLocationAndTeleport(playerName, locationName) {
        let location = await this.readLocation(locationName);
        if (!location) return false;

        //cooldown check goes here
        if (this.cooldownCheck('!location', playerName, [
            { text: `!${locationName}`, color: 'white' },
            { text: ` and other `, color: 'red' },
            { text: `location`, color: 'white' },
            { text: ` commands will be available in `, color: 'red' }]) == true) return true;

        this.writeToMine(`execute in ${location.world} run tp ${playerName} ${location.pos.join(' ')} ${location.rot.join(' ')}`);

        //cooldown start goes here
        this.cooldownStart('!location', playerName);

        return true;
    }

    checkIsAuthorized(playerName) {
        // TODO Add more complicated Auth
        if (playerName === 'Joshyray') {
            return true;
        } else {
            return false;
        }
    }
};
