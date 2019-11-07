const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    world: {
        type: String,
        required: true,
    },
    pos: {
        type: [{ type: Number }],
        required: true,
    },
    rot:  {
        type: [{ type: Number }],
        required: true,
    },
});

module.exports = mongoose.model('Location', locationSchema);
