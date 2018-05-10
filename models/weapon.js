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
    "image": String,    // relatywny url do obrazka np. "items/buzdygan.png"
    "variants": []
})
/*
variant:
{
    "variantId": Number,    <- max 2 cyfrowy
    "name": String,         <- tylko jeśli wariant ma zmienić nazwę przedmiotu
    "image": String,        <- tylko jeśli wariant ma zmienić wygląd przedmiotu
    "damageMin": Number,
    "damageMax": Number,
    LUB "armor": Number,    <- zamiast damageMin i damageMax
    "upgradePrice": Number, <- cena upgrade'u tego przedmiotu na variantId+1
    "value": Number         <- cena dla sklepu, starajcie się żeby były parzyste
                            sprzedaż = 0.5*value, kupno = value ale tylko dla variantu 0
}*/

const Weapon = mongoose.model('Weapon', weaponSchema)

module.exports = Weapon

const weaponResourcePath = './models/weapons'

if (config.skipWeaponChanges) {
    log.info("Skipping database item check")
    return
}

log.info("Starting database item check")
if (!fs.existsSync(weaponResourcePath))
    fs.mkdirSync(weaponResourcePath)

const files = fs.readdirSync(weaponResourcePath)
let parsed = 0
let updateCount = 0

files.forEach(file => {
    fs.readFile(path.join(weaponResourcePath, file), (err, json) => {
        const weapon = JSON.parse(json)
        Weapon.findOne({ 'baseId': weapon.baseId }, (err, res) => {
            if (res && res.version >= weapon.version) {
                progress(file, false)
                return
            }
            Weapon.findOneAndRemove({ 'baseId': weapon.baseId }, (err, res) => {
                mongoose.connection.collection('weapons').insert(weapon)
                progress(file, true)
            })
        })
    })
})

function progress(file, updated) {

    if (updated)
        log.info("File", file, "has been updated")
    else
        log.info("File", file, "is already up-to-date")

    parsed++
    updateCount += updated

    if (parsed != files.length)
        return

    const s = "Finished database item check -"
    if (updateCount != 0)
        log.warning(s, "Updated", updateCount, "items in database")
    else
        log.info(s, "All items already up-to-date")
}

