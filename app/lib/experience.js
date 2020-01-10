//functions intereacting with player experience points in Minecraft will go here.
module.exports = Base => class extends Base {
    readPlayerExperience(playerName) {
        return new Promise((resolve) => {
            const listenForData = (data) => {
                let text = data.toString();
                let regEx = new RegExp(`${playerName} has \d+ experience points`);

                if (!regEx.test(text)) return;
                this.serverProcess.stdout.removeListener('data', listenForData);

                let points = Number(text.split(' ')[4])
                console.log('points var', points)
//figure out how to get just the number after 'has' from an entire line in console eg: '[17:15:04 INFO]: Gobsmack90 has 0 experience points'
                resolve(points);
            };

            this.serverProcess.stdout.on('data', listenForData);
            this.writeToMine(`experience query ${playerName} points`);
        });
    }

    addPlayerExperience(playerName, points) {
        this.writeToMine(`experience add ${playerName} ${points} points`);

    }

    subtractPlayerExperience(playerName, points) {
        this.writeToMine(`experience set ${playerName} ${this.readPlayerExperience(playerName) - points} points`);
    }
}