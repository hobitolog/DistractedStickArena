var mongoose = require('mongoose')
//TODO
var weapon = mongoose.Schema({
    "baseId": Number,
    "name": String,
    "type": String,     // "helmet|armor|weapon"
    "variants": []
})
/*
variant:
{
    "variantId": Number,
    "damageMin": Number,
    "damageMax": Number,
    "level": Number,
    "value": Number
}
*/

module.exports = mongoose.model('Weapon', weapon)