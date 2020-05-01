const mongoose = require('mongoose');
const isDev = process.env.NODE_ENV === 'development';
const connectionStr = `mongodb://root:password@${isDev ? 'localhost' : 'db'}/minecraft?authSource=admin`;

mongoose.connect(connectionStr, { useNewUrlParser: true, useUnifiedTopology: true });

const Player = require('./models/player');
const Location = require('./models/location');

module.exports = Base => class extends Base {
    checkPlayerRecord(playerName, uuid) {
        return new Promise((resolve, reject) => {
            Player.findOne({ name: playerName }, (err, player) => {
                // If they are new to the server just create new db record for them
                if (!player) return this.newPlayer(playerName, uuid);

                // If the player has a home on their db object its not the new format so we reformat it
                if (player.home) {
                    player._version = 2;
                    player.homes = {};
                    player.homes._default = player.home;
                    player.home = undefined;
                    return player.save(() => {
                        resolve(player);
                    });
                } else {
                    resolve(player);
                }
            });
        });
    };

    newPlayer(playerName, uuid) {
        let player = new Player({
            id: uuid,
            name: playerName,
        });

        player.save();
    }

    createPlayerHome(playerName, pos, rot, world, homeName = '_default') {
        return new Promise((resolve, reject) => {
            Player.findOne({ name: playerName }, (err, player) => {
                if (err) return reject(err);
                
                if (player.shareHomes && player.shareHomes.hasOwnProperty(homeName)) {
                    return reject(new Error('name used by shared home'));
                }

                if (!player.homes) {
                    player.homes = {
                        [homeName]: { pos: pos, rot: rot, world },
                    };
                    return player.save((err) => {
                        if (err) return reject(err);
                        resolve(player);
                    });
                }

                let homeEntries = Object.entries(player.toObject().homes);

                if (player.homes[homeName] || homeEntries.length < 3) {
                    player.homes = {
                        ...player.homes,
                        [homeName]: { pos: pos, rot: rot, world },
                    };
                    return player.save((err) => {
                        if (err) return reject(err);
                        resolve(player);
                    });
                }

                return reject(new Error('more than 2 personal homes'));
            });
        });

    }

    createSharedHome(playerOne, playerTwo, pos, rot, world, homeName = playerTwo) {
        return new Promise((resolve, reject) => {
            Player.findOne({ name: playerOne }, (err, player) => {
                if (err) return reject(err);

                if (!player.shareHomes) {
                    player.shareHomes = {
                        [homeName]: { sharePlayer: playerTwo, pos: pos, rot: rot, world },
                    };
                    return player.save((err) => {
                        if (err) return reject(err);
                        resolve(player);
                    });
                }

                for (let home in player.shareHomes) {   
                    //if a sharedHome has already been created with playerTwo rewrite previous home                
                    if (player.shareHomes[home].sharePlayer === playerTwo) {                       
                        let shareHomes = { ...player.shareHomes };
                        delete shareHomes[home];
                        player.shareHomes = shareHomes;

                        player.shareHomes = {
                            ...player.shareHomes,
                            [homeName]: { sharePlayer: playerTwo, pos: pos, rot: rot, world },
                        }; 

                        return player.save((err) => {
                            if (err) return reject(err);
                            resolve(player);
                        });                                             
                    }
                }               

                if (!player.shareHomes.hasOwnProperty(homeName)) {
                    player.shareHomes = {
                        ...player.shareHomes,
                        [homeName]: { sharePlayer: playerTwo, pos: pos, rot: rot, world },
                    };
                    return player.save((err) => {
                        if (err) return reject(err);
                        resolve(player);
                    });
                }

                return reject(new Error('name used by home'));
            });
        });
    }

    readPlayerHome(playerName, homeName = '_default') {
        //this applies to homes and shared homes
        return new Promise((resolve) => {
            Player.findOne({ name: playerName }, (err, player) => {
                if (err) return reject(err);
                if (player.homes && player.homes[homeName]) {
                    resolve(player.homes[homeName]);
                } else if (player.shareHomes) {
                    resolve(player.shareHomes[homeName])
                } else {
                    resolve(null);
                }
            });
        });
    }

    readPlayerHomeList(playerName) {
        return new Promise((resolve, reject) => {
            Player.findOne({ name: playerName }, (err, player) => {
                if (err) return reject(err);
                if (player.homes || player.shareHomes) {
                    //we can now resolve a list of all homes and shared homes of the player
                    if (player.homes && player.shareHomes) {
                        let homesEntries = Object.entries(player.homes);
                        let shareHomesEntries = Object.entries(player.shareHomes);
                        let combinedEntries = [...homesEntries, ...shareHomesEntries];

                        resolve(combinedEntries
                            .map(([key]) => key)
                            .filter(x => x != '_default'),
                        );
                    }

                    if (player.homes) {
                        resolve(Object.entries(player.homes)
                            .map(([key]) => key)
                            .filter(x => x != '_default'),
                        );
                    }

                    if (player.shareHomes) {
                        resolve(Object.entries(player.shareHomes)
                            .map(([key]) => key),
                        );
                    }
                    
                } else {
                    resolve(null);
                }
            });
        });
    }

    deletePlayerHome(playerName, homeName) {
        return new Promise((resolve, reject) => {
            Player.findOne({ name: playerName }, (err, player) => {
                if (err) return reject(err);
                //can now delete from either homes or shareHomes
                if (player.homes[homeName]) {
                    let homes = { ...player.homes };
                    delete homes[homeName];
                    player.homes = homes;
                } else if (player.shareHomes[homeName]) {
                    let shareHomes = { ...player.shareHomes };
                    delete shareHomes[homeName];
                    player.shareHomes = shareHomes;
                } else return resolve(false)

                player.save(() => {
                    resolve(true);
                });
            });
        });
    }

    readPlayerWelcome(playerName) {
        //this applies to homes and shared homes
        return new Promise((resolve) => {
            Player.findOne({ name: playerName }, (err, player) => {
                if (err) return reject(err);
                resolve(player.welcome);            
            });
        });
    }

    updatePlayerWelcome(playerName, newArr) {
        return new Promise((resolve, reject) =>{
            Player.updateOne(
                { name: playerName }, 
                { welcome: newArr},
                (err) => {
                    if (err) return reject(err);
                    resolve();
                },
            )
        })
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

    readPlayersXpAutoStoreTrue(){
        return new Promise((resolve) => {
            Player.find({ xpAutoStore: true }, (err, players) => {
                if (err) return reject(err);
                resolve(players);
            })
        })
    }

    updatePlayerXpAutoStore(playerName, truefalse) {
        return new Promise((resolve, reject) =>{
            Player.updateOne(
                { name: playerName }, 
                { xpAutoStore: truefalse},
                (err) => {
                    if (err) return reject(err);
                    resolve();
                },
            )
        })
    };

    readPlayerXpAutoStore(playerName) {
        return new Promise((resolve) => {
            Player.findOne({ name: playerName }, (err, player) => {
                if (err) return reject(err);
                resolve(player.xpAutoStore);   
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

    readLocations() {
        return new Promise((resolve, reject) => {
            Location.find({}, (err, locations) => {
                if (err) return reject(err);
                resolve(locations);
            });
        });
    }

    deleteLocation(name) {
        return new Promise((resolve, reject) => {
            Location.deleteOne({ name: name }, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }
};
