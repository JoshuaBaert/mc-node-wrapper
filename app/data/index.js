const mongoose = require('mongoose');
mongoose.connect('mongodb://root:password@db/minecraft?authSource=admin', { useNewUrlParser: true });

const Player = require('./models/player');

module.exports = Base => class extends Base {
    handlePlayerLogin(playerName, UUID) {
        Player.count({ name: playerName }, (err, count) => {
            if (err) throw err;
            if (count === 0) {
                let player = new Player({ name: playerName, id: UUID });
                player.save((err) => {if (err) throw err; });
            }
        });
    }

    setPlayerHome(playerName, { pos, rot }) {
        Player.updateOne(
            { name: playerName },
            { name: playerName, home: { pos: pos, rot: rot } },
            (err, player) => {
                if(err) console.error(err)
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
