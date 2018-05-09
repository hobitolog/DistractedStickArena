const Weapon = require('./models/weapon')
const log = require('./log')

module.exports = {

    getFullJson: function (itemId) {
        return new Promise(function (resolve, reject) {
            const baseId = itemId - (itemId % 100)
            Weapon.findOne({ 'baseId': baseId }, (err, res) => {
                if (err)
                    reject(err)
                else if (!res)
                    reject("Nie ma takiego przedmiotu - itemId: " + itemId)
                else
                    resolve(res)
            })
        })
    },

    getCurrentVariant: function (itemId) {
        return new Promise(function (resolve, reject) {
            const variantId = itemId % 100
            const baseId = itemId - variantId
            Weapon.findOne({ 'baseId': baseId }, (err, full) => {
                if (err) {
                    reject(err)
                    return
                }
                if (!full) {
                    reject("Nie ma takiego przedmiotu - itemId: " + itemId)
                    return
                }

                const variant = full.variants.find(element => {
                    return element.variantId == variantId
                })

                const toReturn = {
                    "itemId": itemId,
                    "level": full.level,
                    "type": full.type,
                }

                toReturn.name = variant.name ? variant.name : full.name
                toReturn.image = variant.image ? variant.image : full.image
                if (toReturn.type == 'weapon') {
                    toReturn.damageMin = variant.damageMin
                    toReturn.damageMax = variant.damageMax
                } else {
                    toReturn.armor = variant.armor
                }
                if (variant.upgradePrice) {
                    toReturn.upgradePrice = variant.upgradePrice
                }
                toReturn.value = variant.value

                resolve(toReturn)
            })
        })
    },
}