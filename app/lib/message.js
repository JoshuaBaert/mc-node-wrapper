module.exports = Base => class extends Base {
    whisperPlayerRaw(playerName, messageObj) {
        this.writeToMine(`tellraw ${playerName} ${JSON.stringify(messageObj)}`)
    }

    whisperPlayer(playerName, message, color) {
        color = color || 'white';
        this.whisperPlayerRaw(playerName, {text: message, color: color})
    }
};
