
var players = []
var duels = []

var scheduledMatchMaking = null

function updateActive() {

    io.emit('activeUpdate', {
        "players": players.length,
        "duels": duels.length
    })
}

//TODO przetestować po zrobieniu socketów
function matchMake() {

    var copied = players.splice()
    while (copied.length > 1) {

        var player = copied[0]
        var matched = null
        for (var i = 1; i < copied.length; i++) {
            //TODO jakiś algorytm
            matched = copied[i]
        }

        duels.push({
            player1: player,
            player2: matched,
        })
        copied.splice(0, 1)
        copied.splice(i, 1)
    }

    players = copied.splice()
    updateActive()
    scheduledMatchMaking = null
    matchMakingTrigger(5000)
}

function matchMakingTrigger(delay)
{
    if (scheduledMatchMaking != null || players.length < 2)
        return
    
    scheduledMatchMaking = setTimeout(matchMake, delay)
}

module.exports = {

    activeGameBlock: (req, res, next) => {

        var username = req.user.login
        var index = players.findIndex((element => { element.player.login == username }))
        if (index != -1)
            return res.json({ "error": "Niedozwolone podczas szukania gry" })

        index = duels.findIndex((element) => { element.player1.login == username || element.player2.login == username })
        if (index != -1)
            return res.json({ "error": "Niedozwolone podczas gry w toku" })

        return next()
    },

    init: function (app, io) {

        this.io = io

        app.get('/getActive', function (req, res) {
            res.json({
                "players": players.length,
                "duels": duels.length
            })
        })

        io.on('connection', (socket) => {
            var player = socket.request.user
            var index = players.findIndex((element => { element.player.login == player.login }))
            if (index != 1) {
                socket.emit("error", "Gracz jest już w kolejce")
                socket.disconnect(true)
                return
            }
            players.push({
                "player": player,
                "started": Date.now()
            })
            updateActive()
            matchMakingTrigger(0)


            socket.on('disconnect', function () {
                var index = players.findIndex((element => { element.player.login == player.login }))
                if (index == -1) return
                players.splice(index, 1)
                updateActive()
            })
        })
    }
}
