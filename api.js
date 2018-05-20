const login = require('./login')
const log = require('./log')
const fight = require('./fight')
const itemFetcher = require('./itemFetcher')

module.exports = function (app) {

    app.get('/getCharacter', login.isLoggedIn, login.isActivated, (req, res) => {
        var json = {
            "level": req.user.character.level,
            "exp": req.user.character.exp,
            "gold": req.user.character.gold,
            "ranking": req.user.character.rankingPoints
        }
        res.json(json)
    })

    app.get('/getStats', login.isLoggedIn, login.isActivated, (req, res) => {
        res.json(req.user.character.stats)
    })

    app.get('/getEquipment', login.isLoggedIn, login.isActivated, (req, res) => {
        const eq = req.user.character.equipment
        const response = {
            "weapon": null,
            "armor": null,
            "helmet": null
        }
        let counter = 0

        if (eq.weapon) {
            itemFetcher.getCurrentVariant(eq.weapon.itemId)
            .then(weapon => {
                response.weapon = weapon
                ready()
            }).catch(err => {
                log.error(err)
                ready()
            })
        }
        if (eq.helmet) {
            itemFetcher.getCurrentVariant(eq.helmet.itemId)
            .then(helmet => {
                response.helmet = helmet
                ready()
            }).catch(err => {
                log.error(err)
                ready()
            })
        }
        if (eq.armor) {
            itemFetcher.getCurrentVariant(eq.armor.itemId)
            .then(armor => {
                response.armor = armor
                ready()
            }).catch(err => {
                log.error(err)
                ready()
            })
        }

        function ready() {
            counter++
            if (counter == 3)
                res.json(req.user.character.equipment)
        }
    })

    app.get('/getVariant', login.isLoggedIn, login.isActivated, (req, res) => {
        itemFetcher.getCurrentVariant(req.query.itemId).then(item => {
            res.json(item)
        }).catch(err => {
            log.error(err)
        })
    })

    app.get('/getShopItems', login.isLoggedIn, login.isActivated, (req, res) => {
        itemFetcher.getShopItems(req.user.character.level).then(items => {
            res.json(items)
        }).catch( err => {
            log.error(err)
        })
    })

    app.get('/getBackpack', login.isLoggedIn, login.isActivated, (req, res) => {

        const response = []
        let count = req.user.character.backpack.length
        req.user.character.backpack.forEach(element => {

            itemFetcher.getCurrentVariant(element.itemId)
            .then(item => {
                response.push({
                    "name": item.name,
                    "itemId": item.itemId
                })
                ready()
            }).catch(err => {
                log.error(err)
                ready()
            })
        })

        function ready() {
            count--
            if (count == 0)
                res.json({ "backpack": response })
        }
    })

    app.post('/setWeapon', login.isLoggedIn, login.isActivated, fight.activeGameBlock, (req, res) => {
        //TODO
    })

    app.post('/setArmor', login.isLoggedIn, login.isActivated, fight.activeGameBlock, (req, res) => {
        //TODO
    })

    app.post('/setHelmet', login.isLoggedIn, login.isActivated, fight.activeGameBlock, (req, res) => {
        //TODO
    })

    app.post('/spendPoints', login.isLoggedIn, login.isActivated, fight.activeGameBlock, (req, res) => {

        var stat = req.body.stat
        var amount = req.body.amount

        if (stat && amount && typeof stat == "string" && typeof amount == "number") {

            var allStats = ["str", "att", "agi", "vit", "sta"]
            if (!allStats.includes(stat)) {
                var json = { "error": "Nieprawidłowa statystyka" }
                res.json(json)
                return
            }

            if (amount <= 0 || req.user.character.stats.free < amount) {
                var json = { "error": "Nieprawidłowa ilość punktów" }
                res.json(json)
            }
            else {
                req.user.character.stats[stat] += amount
                req.user.character.stats.free -= amount
                req.user.save(function (err) {
                    if (err)
                        log.error(err)
                    var json = { "error": err ? "Błąd bazy danych" : null }
                    res.send(json)
                })
            }
        }
        else {
            var json = { "error": "Błąd formatu parametrów" }
            res.json(json)
        }
    })

    app.post('/sellItem', login.isLoggedIn, login.isActivated, fight.activeGameBlock, (req, res) => {

    })

    app.post('/buyItem', login.isLoggedIn, login.isActivated, fight.activeGameBlock, (req, res) => {
        
    })
}
