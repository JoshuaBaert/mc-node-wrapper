module.exports = Base => class extends Base {
    tellPlayerRaw(playerName, messageObj) {
        this.writeToMine(`tellraw ${playerName} ${JSON.stringify(messageObj)}`)
    }

    tellPlayer(playerName, message, color) {
        color = color || 'white';
        this.tellPlayerRaw(playerName, {text: message, color: color})
    }
};
