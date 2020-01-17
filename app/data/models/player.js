const mongoose = require('mongoose');


const homeSchema = new mongoose.Schema({
    pos: [{ type: Number }],
    rot: [{ type: Number }],
    world: String,
}, { _id: false });

const playerSchema = new mongoose.Schema({
    _version: {
        type: Number,
        default: 2,
    },
    name: {
        type: String,
        required: true,
        unique: true,
    },
    id: String,
<<<<<<< HEAD
    home: homeSchema,
    xpStore: Number,
=======
    home: homeSchema, // this is being depreciated
    homes: {
        type: Object,
    },
>>>>>>> d7ddebae2500f743a02efc455ad88dac10937662
});

module.exports = mongoose.model('Player', playerSchema)
