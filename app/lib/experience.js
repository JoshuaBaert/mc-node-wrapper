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
                let regEx = new RegExp(`.*\\s${playerName}\\shas\\s\\d+\\sexperience\\spoints`);

                if (!regEx.test(text)) return;
                this.serverProcess.stdout.removeListener('data', listenForData);

                let points = parseInt(text.split(' ')[4],10);
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
                let regEx = new RegExp(`.*\\s${playerName}\\shas\\s\\d+\\sexperience\\slevels`);

                if (!regEx.test(text)) return;
                this.serverProcess.stdout.removeListener('data', listenForData);

                let levels = parseInt(text.split(' ')[4],10);
                console.log(levels);
                resolve(levels);
            };

            this.serverProcess.stdout.on('data', listenForData);
            this.writeToMine(`experience query ${playerName} levels`);
        });
    }

    async addPlayerExperience(playerName, newExp) {
        //need to convert existing level/points into points, then add to that pointPool and convert the new total back.
        let currentExp = this.convertLevelsToPoints(await this.readPlayerExperienceLevels(playerName),await this.readPlayerExperiencePoints(playerName));
        let totalExp = newExp + currentExp;
        let newLevelArr = this.convertPointsToLevels(totalExp);

        //input new experience to Minecraft.
        this.writeToMine(`experience set ${playerName} ${newLevelArr[0]} levels`);
        this.writeToMine(`experience set ${playerName} ${newLevelArr[1]} points`);
    }

    async subtractPlayerExperience(playerName, removedExp) {
        let currentExp = this.convertLevelsToPoints(await this.readPlayerExperienceLevels(playerName),await this.readPlayerExperiencePoints(playerName));
        let totalExp = currentExp - removedExp;
        let newLevelArr = this.convertPointsToLevels(totalExp);

        //input new experience to Minecraft.
        this.writeToMine(`experience set ${playerName} ${newLevelArr[0]} levels`);
        this.writeToMine(`experience set ${playerName} ${newLevelArr[1]} points`);

        //return the number of points subtracted.
        return removedExp;
    }

    convertLevelsToPoints(levels, points) {
        //There are three separate equations to determine how many experience points are required to reach a level, this if-else chain picks the right one.
        //the points a player had on top of their level count gets added and returned.
        if (levels > 31) {
            return points + (4.5*Math.pow(levels, 2) - 162.5*levels + 2220);
        } else if (levels > 16 && levels <= 31) {
            return points + (2.5*Math.pow(levels, 2) - 40.5*levels + 360);
        } else if (levels >= 0 && levels <= 16) {
            return points + (Math.pow(levels, 2) + 6*levels);
        };
    };

    convertPointsToLevels(totalPoints) {
        let pointPool = totalPoints;

        //levels will be the level given to player, points will be the point count within that level given.
        let points = 0;
        let levels = 0;
 
        //determines how many points are needed for the next level and if there are that many points in the pointPool, then they are subtracted and another level is gained.
        //like the convertPointsToLevels() func, different levels have different equations to make that determination. This is all pulled from the minecraft wiki.
        while (pointPool > 0) {
            if (levels < 16) {
                if (pointPool - (2 * levels + 7) >= 0) {
                    pointPool = pointPool - (2 * levels + 7);
                    ++levels;
                } else {
                    points = pointPool;
                    pointPool = 0;
                }
            } else if (levels >= 16 && levels < 31) {
                if (pointPool - (5 * levels - 38) >= 0) {
                    pointPool = pointPool - (5 * levels - 38);
                    ++levels;
                } else {
                    points = pointPool;
                    pointPool = 0;
                }
            } else if (levels >= 31) {
                if (pointPool - (9 * levels - 158) >= 0) {
                    pointPool = pointPool - (9 * levels - 158);
                    ++levels;
                } else {
                    points = pointPool;
                    pointPool = 0;
                }
            }
        }

        return [levels, points]
    }
}