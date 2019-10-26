const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    pos: [{ type: Number }],
    rot: [{ type: Number }],
}, { _id: false });

const playerSchema = new mongoose.Schema({
    name: String,
    id: String,
    home: locationSchema,
});

module.exports = mongoose.model('Player', playerSchema);
