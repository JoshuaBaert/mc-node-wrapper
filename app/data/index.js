const mongoose = require('mongoose');
mongoose.connect('mongodb://root:password@db/minecraft?authSource=admin', { useNewUrlParser: true, useUnifiedTopology: true });

const Player = require('./models/player');

module.exports = Base => class extends Base {
    constructor() {
        super();
        this.loggedInPlayers = [];
    }

    handlePlayerLogin(playerName, UUID) {
        Player.count({ name: playerName }, (err, count) => {
            this.loggedInPlayers.push(playerName);
            if (err) throw err;
            if (count === 0) {
                let player = new Player({ name: playerName, id: UUID });
                player.save((err) => {if (err) throw err; });
            }
        });
    }

    handlePlayerLogout(playerName) {
        this.loggedInPlayers.splice(this.loggedInPlayers.indexOf(playerName), 1);
    }

    setPlayerHome(playerName, pos, rot, world) {
        Player.updateOne(
            { name: playerName },
            { name: playerName, home: { pos: pos, rot: rot, world } },
            (err, player) => {
                if (err) console.error(err);
            },
        );
    }

    getPlayerHome(playerName) {
        return new Promise((resolve) => {
            Player.findOne({ name: playerName }, (err, player) => {
                resolve(player.home);
            });
        });
    }
};
