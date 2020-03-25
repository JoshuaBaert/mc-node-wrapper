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
    home: homeSchema, // this is being depreciated
    homes: {
        type: Object,
    },
    shareHomes: {
        type: Object,
    },
    welcome: {
        type: Array,
        default: ['a','z']
    },
    xpStore: Number,
    xpAutoStore: {
        type: Boolean,
        default: false,
    }
});

module.exports = mongoose.model('Player', playerSchema)
