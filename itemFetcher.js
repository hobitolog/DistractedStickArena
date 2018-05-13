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

    getCurrentVariants: function (...itemIds) {
        return new Promise(function (resolve, reject) {
            const variantIds = []
            const baseIds = []

            itemIds.forEach((itemId, index) => {
                variantIds[index] = itemId % 100
                baseIds[index] = itemId - variantIds[index]
            })
            Weapon.find({ 'baseId': { $in: baseIds } }, (err, weapons) => {
                if (err) {
                    reject(err)
                    return
                }
                const toReturn = []
                weapons.forEach((weapon, index) => {
                    const variant = weapon.variants.find(element => {
                        return element.variantId == variantIds[index]
                    })

                    const toAdd = {
                        "itemId": itemIds[index],
                        "level": weapon.level,
                        "type": weapon.type,
                    }

                    toAdd.name = variant.name ? variant.name : weapon.name
                    toAdd.image = variant.image ? variant.image : weapon.image
                    if (toAdd.type == 'weapon') {
                        toAdd.damageMin = variant.damageMin
                        toAdd.damageMax = variant.damageMax
                    } else {
                        toAdd.armor = variant.armor
                    }
                    if (variant.upgradePrice) {
                        toAdd.upgradePrice = variant.upgradePrice
                    }
                    toAdd.value = variant.value
                    toReturn[index] = toAdd
                })
                resolve(toReturn)
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