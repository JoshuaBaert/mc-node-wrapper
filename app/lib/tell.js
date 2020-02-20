module.exports = Base => class extends Base {
    tellPlayerRaw(playerName, messageObj) {
        this.writeToMine(`tellraw ${playerName} ${JSON.stringify(messageObj)}`)
    }

    tellPlayer(playerName, message, color) {
        color = color || 'white';
        this.tellPlayerRaw(playerName, {text: message, color: color})
    }

    tellColors(playerName) {
        this.tellPlayerRaw(playerName, [
            'These are all of the tellraw colors: ',
            { 'text': 'Black', 'color': 'black' }, ', ',
            { 'text': 'Dark Blue', 'color': 'dark_blue' }, ', ',
            { 'text': 'Dark Green', 'color': 'dark_green' }, ', ',
            { 'text': 'Dark Aqua', 'color': 'dark_aqua' }, ', ',
            { 'text': 'Dark Red', 'color': 'dark_red' }, ', ',
            { 'text': 'Dark', 'color': 'dark_purple' }, ', ',
            { 'text': 'Purple', 'color': 'dark_purple' }, ', ',
            { 'text': 'Gold', 'color': 'gold' }, ', ',
            { 'text': 'Gray', 'color': 'gray' }, ', ',
            { 'text': 'Dark Grey', 'color': 'dark_gray' }, ', ',
            { 'text': 'Blue', 'color': 'blue' }, ', ',
            { 'text': 'Green', 'color': 'green' }, ', ',
            { 'text': 'Aqua', 'color': 'aqua' }, ', ',
            { 'text': 'Red', 'color': 'dark_red' }, ', ',
            { 'text': 'Light Purple', 'color': 'light_purple' }, ', ',
            { 'text': 'Yellow', 'color': 'yellow' },
            ', and White',
        ]);
    }
};
