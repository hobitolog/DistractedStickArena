var login = require('./login')
var log = require('./log')
var fight = require('./fight')

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
        res.json(res.req.user.character.stats)
    })

    app.get('/getEquipment', login.isLoggedIn, login.isActivated, (req, res) => {
        res.json(res.req.user.character.equipment)
    })

    app.get('/getBackpack', login.isLoggedIn, login.isActivated, (req, res) => {
        res.json({ "backpack" : res.req.user.character.backpack })
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
                    if(err) 
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
