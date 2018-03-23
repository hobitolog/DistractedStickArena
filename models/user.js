var mongoose = require('mongoose');

module.exports = mongoose.model('User', {
    login: String,
    password: String,
    email: String,

    character: {
        level: Number,
        exp: Number,
        gold: Number,
        rankingPoints: Number,
        stats: {
            str: Number,
            agi: Number,
            vit: Number,
            sta: Number
        },

        equipment: {
            helmet: {},
            armor: {},
            weapon: {}
        },
        backpack: []
    }

});