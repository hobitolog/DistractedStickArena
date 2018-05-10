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
            itemFetcher.getCurrentVariant(eq.weapon.itemId).then(weapon => {
                response.weapon = weapon
                ready()
            }).catch(err => {
                log.error(err)
            })
        }
        if (eq.helmet) {
            itemFetcher.getCurrentVariant(eq.helmet.itemId).then(helmet => {
                response.helmet = helmet
                ready()
            }).catch(err => {
                log.error(err)
            })
        }
        if (eq.armor) {
            itemFetcher.getCurrentVariant(eq.armor.itemId).then(armor => {
                response.armor = armor
                ready()
            }).catch(err => {
                log.error(err)
            })
        }

        function ready() {
            counter++
            if (counter == 3)
                res.json(req.user.character.equipment)
        }
    })

    app.get('/getBackpack', login.isLoggedIn, login.isActivated, (req, res) => {
        res.json({ "backpack": req.user.character.backpack })
    })

    app.get('/getVariant', login.isLoggedIn, login.isActivated, (req, res) => {
        const response = {
            'variant': null
        }

        itemFetcher.getCurrentVariant(req.body.itemId).then(item => {
            response.item = item
        }).catch(err => {
            log.error(err)
        })
        res.json(response)
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

}
