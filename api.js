var login = require('./login')
var log = require('./log')

module.exports = function (app) {

    app.get('/getCharacter', login.isLoggedIn, login.isActivated, (req, res) => {
        res.json(res.req.user.character)
    })

    app.post('/spendPoints', login.isLoggedIn, login.isActivated, (req, res) => {

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
