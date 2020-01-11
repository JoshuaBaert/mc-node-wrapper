//functions intereacting with player experience points in Minecraft will go here.
module.exports = Base => class extends Base {
    constructor() {
        super();
    }

    //minecraft seperates levels and points you need to get both.
    readPlayerExperiencePoints(playerName) {
        return new Promise((resolve) => {
            const listenForData = (data) => {
                let text = data.toString();
                let regEx = new RegExp(`${playerName} has \d+ experience points`);

                if (!regEx.test(text)) return;
                this.serverProcess.stdout.removeListener('data', listenForData);

                let points = Number(text.split(' ')[4])
                console.log('points var', points)
                resolve(points);
            };

            this.serverProcess.stdout.on('data', listenForData);
            this.writeToMine(`experience query ${playerName} points`);
        });
    }

    //minecraft seperates levels and points you need to get both.
    readPlayerExperienceLevels(playerName) {
        return new Promise((resolve) => {
            const listenForData = (data) => {
                let text = data.toString();
                let regEx = new RegExp(`${playerName} has \d+ experience levels`);

                if (!regEx.test(text)) return;
                this.serverProcess.stdout.removeListener('data', listenForData);

                let levels = Number(text.split(' ')[4])
                console.log('levels var', levels)
                resolve(levels);
            };

            this.serverProcess.stdout.on('data', listenForData);
            this.writeToMine(`experience query ${playerName} levels`);
        });
    }

    addPlayerExperience(playerName, points) {
        this.writeToMine(`experience add ${playerName} ${points} points`);

    }

    subtractPlayerExperience(playerName, points) {
        this.writeToMine(`experience set ${playerName} ${this.readPlayerExperience(playerName) - points} points`);
    }

    //first find out what current level player is at
    //then we need to figure out what formula should be used for each level being stored
    //so if i'm level 30 points 40 and i'm storing 20 levels i need to find the total amount of experience i have, remove the point total equaling 20 levels and put back the rest.

    /*formula: 
    level^2 + 6 × level (at levels 0–16)
    2.5 × level^2 – 40.5 × level + 360 (at levels 17–31)
    4.5 × level^2 – 162.5 × level + 2220 (at levels 32+)
    */
    convertLevelsToPoints(levels, points) {
        //these functions calculate how much experience is needed to get to a certain level.
        function zeroToSixteenFunc(level) {
            return Math.pow(level, 2) + 6*level;
        };
        function seventeenToThirtyoneFunc(level) {
            return 2.5*Math.pow(level, 2) - 40.5*level + 360;
        };
        function thirtytwoAndHigherFunc(level) {
            return 4.5*Math.pow(level, 2) - 162.5*level + 2220;
        };

        //which function to calculate levels to experience?
        if (levels > 31) {
            return points + thirtytwoAndHigherFunc(levels);
        } else if (levels > 16 && levels <= 31) {
            return points + seventeenToThirtyoneFunc(levels);
        } else if (levels > 0 && levels <= 16) {
            return points + zeroToSixteenFunc(levels);
        };
    };



    convertPointsToLevels(playerName, points) {
        let leftoverPoints = points;
        let remainder = 0;
        let levels = 0;
 
        while (leftoverPoints > 0) {
            if (levels < 16) {
                if (leftoverPoints - (2 * levels + 7) >= 0) {
                    leftoverPoints = leftoverPoints - (2 * levels + 7);
                    ++levels;
                } else {
                    remainder = leftoverPoints;
                    leftoverPoints = 0;
                }
            } else if (levels >= 16 && levels < 31) {
                if (leftoverPoints - (5 * levels - 38) >= 0) {
                    leftoverPoints = leftoverPoints - (5 * levels - 38);
                    ++levels;
                } else {
                    remainder = leftoverPoints;
                    leftoverPoints = 0;
                }
            } else if (levels >= 31) {
                if (leftoverPoints - (9 * levels - 158) >= 0) {
                    leftoverPoints = leftoverPoints - (9 * levels - 158);
                    ++levels;
                } else {
                    remainder = leftoverPoints;
                    leftoverPoints = 0;
                }
            }
        }

        this.whisperPlayerRaw(playerName, [
            { text: `You have levels `, color: 'white' },
            { text: `${levels}`, color: 'red' },
            { text: `You have points`, color: 'white' },
            { text: `${remainder}`, color: 'red' },
        ]);

        return [levels, remainder]
    }
}