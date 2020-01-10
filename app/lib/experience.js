//functions intereacting with player experience points in Minecraft will go here.
module.exports = Base => class extends Base {
    readPlayerExperience(playerName) {
        this.writeToMine(`experience query ${playerName} points`);
        // return the number
    }

    addPlayerExperience(playerName, points) {
        this.writeToMine(`experience add ${playerName} ${points} points`);

    }

    subtractPlayerExperience(playerName, points) {
        this.writeToMine(`experience set ${playerName} ${this.readPlayerExperience(playerName) - points} points`);
    }

}