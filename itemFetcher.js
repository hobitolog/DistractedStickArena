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

                itemIds.forEach((itemId, index) => {
                    const weapon = weapons.find((element => {
                        return element.baseId == baseIds[index]
                    }))
                    const variant = weapon.variants.find(element => {
                        return element.variantId == variantIds[index]
                    })

                    const toAdd = {
                        "itemId": itemId,
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
            if (itemId == "")
                reject("Niepoprawne itemId: " + itemId)
            const variantId = itemId % 100
            const baseId = parseInt(itemId) - variantId
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

                if (!variant) {
                    resolve()
                    return
                }

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

    getShopItems: function (characterLvl) {
        return new Promise(function (resolve, reject) {
            const lowerBound = Math.floor((characterLvl - 1) / 5) * 5
            const items = []

            const ids = [lowerBound, lowerBound + 1, lowerBound + 2, lowerBound + 3, lowerBound + 4]
            Weapon.find({ 'level': { $in: ids } }, (err, weapons) => {
                if (err) {
                    reject(err)
                    return
                }
                weapons.forEach((item, index) => {
                    const toAdd = {
                        "name": item.name,
                        "itemId": item.baseId
                    }
                    items.push(toAdd)
                })
                resolve(items)
            })
        })
    },

    getItems: function (ids) {
        return new Promise(function (resolve, reject) {
            const toReturn = []

            var baseIds = []
            var toFind = []
            ids.forEach((id, index) => {
                var variantId = id % 100
                var baseId = id - variantId
                var baseVar = {
                    "baseId": baseId,
                    "variantId": variantId
                }
                toFind.push(baseVar)
                baseIds.push(baseId)
            })

            Weapon.find({ 'baseId': { $in: baseIds } }, (err, items) => {
                if (err) {
                    reject(err)
                    return
                }

                toFind.forEach((item, index) => {
                    var full = items.find(element => {
                        return item.baseId == element.baseId
                    })

                    var variant = full.variants.find(element => {
                        return item.variantId == element.variantId
                    })

                    toReturn.push({
                        "itemId": item.baseId + item.variantId,
                        "name": variant.name ? variant.name : full.name,
                        "type": full.type
                    })
                })
                resolve(toReturn)
            })
        })
    },
}