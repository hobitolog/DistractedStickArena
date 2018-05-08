const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')
const log = require('../log')
const config = require('../config')

const weaponSchema = mongoose.Schema({
    "version": Number,   // przy zmianie w jsonie czegokolwiek to pole trzeba zinkrementować
    "baseId": Number,    // zawsze powinno mieć na końcu conajmniej 2 zera
    "name": String,
    "type": String,     // "helmet|armor|weapon"
    "level": Number,    // poziom sugerowany do sklepu
    "variants": []
})
/*
variant:
{
    "variantId": Number,    <- max 2 cyfrowy
    "damageMin": Number,
    "damageMax": Number,
    LUB "armor": Number,    <- zamiast damageMin i damageMax
    "upgradePrice": Number, <- cena upgrade'u tego przedmiotu na variantId+1
    "value": Number         <- cena kupna w sklepie
}*/

const Weapon = mongoose.model('Weapon', weaponSchema)

module.exports = Weapon

const weaponResourcePath = './models/weapons'

if (config.skipWeaponChanges)
    return

if (!fs.existsSync(weaponResourcePath))
    fs.mkdirSync(weaponResourcePath)

const files = fs.readdirSync(weaponResourcePath)
let parsed = 0
let updateCount = 0
log.info("Starting database item check")

files.forEach(file => {
    log.info("Parsing item file: " + file)
    fs.readFile(path.join(weaponResourcePath, file), (err, json) => {
        const weapon = JSON.parse(json)
        Weapon.findOne({ 'baseId': weapon.baseId }, (err, res) => {
            parsed++
            if (res && res.version >= weapon.version) {
                check()
                return
            }
            updateCount++
            Weapon.findOneAndRemove({ 'baseId': weapon.baseId }, (err, res) => {
                mongoose.connection.collection('weapons').insert(weapon)
                check()
            })
        })
    })
})

function check() {
    if (parsed != files.length)
        return

    const s = "Finished database item check -"
    if (updateCount != 0)
        log.warning(s, "Updated", updateCount, "items in database")
    else
        log.info(s, "All items already up-to-date")
}

