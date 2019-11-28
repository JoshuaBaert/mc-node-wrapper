const mongoose = require('mongoose');

const homeSchema = new mongoose.Schema({
    pos: [{ type: Number }],
    rot: [{ type: Number }],
    world: String,
}, { _id: false });

const playerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    id: String,
    home: homeSchema,
});

module.exports = mongoose.model('Player', playerSchema);
