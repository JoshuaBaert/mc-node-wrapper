const mongoose = require('mongoose');
const isDev = process.env.NODE_ENV === 'development';
const connectionStr = `mongodb://root:password@${isDev ? 'localhost' : 'db'}/minecraft?authSource=admin`;

mongoose.connect( connectionStr, { useNewUrlParser: true, useUnifiedTopology: true });

const Player = require('./models/player');
const Location = require('./models/location');

module.exports = Base => class extends Base {
    constructor() {
        super();
    }

    handlePlayerLogin(playerName, UUID) {
        Player.count({ name: playerName }, (err, count) => {
            if (err) throw err;
            if (count === 0) {
                let player = new Player({ name: playerName, id: UUID });
                player.save((err) => {if (err) throw err; });
            }
        });
    }

    createPlayerHome(playerName, pos, rot, world) {
        Player.updateOne(
            { name: playerName },
            { name: playerName, home: { pos: pos, rot: rot, world } },
            (err, player) => {
                if (err) console.error(err);
            },
        );
    }

    readPlayerHome(playerName) {
        return new Promise((resolve) => {
            Player.findOne({ name: playerName }, (err, player) => {
                resolve(player.home);
            });
        });
    }

    updatePlayerXpStore(playerName, newXp) {
        return new Promise((resolve, reject) =>{
            Player.updateOne(
                { name: playerName }, 
                { xpStore: newXp},
                (err) => {
                    if (err) return reject(err);
                    resolve();
                },
            )
        })
    };

    readPlayerXpStore(playerName) {
        return new Promise((resolve) => {
            Player.findOne({ name: playerName }, (err, player) => {
                if (err) return reject(err);
                resolve(player.xpStore);   
            })
        })
    };

    createLocation(name, world, pos, rot) {
        return new Promise((resolve, reject) => {
            let location = new Location({
                name: name,
                world: world,
                pos: pos,
                rot: rot,
            });

            location.save((err, location) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(location);
                }
            });
        });
    }

    readLocation(name) {
        return new Promise((resolve, reject) => {
            Location.findOne({ name: name }, (err, location) => {
                if (err) return reject(err);
                resolve(location);
            });
        });
    }

    deleteLocation(name) {
        return new Promise((resolve, reject) => {
            Location.deleteOne({ name: name }, (err) => {
                if (err) return reject(err);
                resolve()
            });
        });
    }
};
