var mongoose = require('mongoose')
var bcrypt = require('bcrypt')

var user = mongoose.Schema({
    login: String,
    password: String,
    email: String,

    character: {
        level: { type: Number, default: 1 },
        exp: { type: Number, default: 0 },
        gold: { type: Number, default: 100 },
        rankingPoints: { type: Number, default: 0 },
        stats: {
            free: { type: Number, default: 5 },
            str: { type: Number, default: 1 },
            att: { type: Number, default: 1 },
            agi: { type: Number, default: 1 },
            vit: { type: Number, default: 1 },
            sta: { type: Number, default: 1 }
        },

        equipment: {
            helmet: {
                itemId: { type: Number, default: null }
            },
            armor: {
                itemId: { type: Number, default: null }
            },
            weapon: {
                itemId: { type: Number, default: null }
            }
        },
        backpack: []
    }

})

user.methods.isValidPassword = function (password) {
    return bcrypt.compareSync(password, this.password)
}

user.methods.setPassword = function (password) {
    this.password = bcrypt.hashSync(password, bcrypt.genSaltSync(8))
}

module.exports = mongoose.model('User', user)