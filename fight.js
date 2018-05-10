var log = require("./log")
var passportSocketIo = require("passport.socketio")

var players = []
var duels = []

var scheduledMatchMaking = null

function getSearchers() {
    return players.filter(x => x.started != 0)
}

function updateActive() {
    io.emit('activeUpdate', {
        "players": getSearchers.length,
        "duels": duels.length
    })
}

function notifyDuel(player, opponent) {
    player.socket.emit('gameFound', opponent)
}

//TODO przetestować po zrobieniu socketów
function matchMake() {

    var newDuels = []
    var copied = getSearchers.splice()
    while (copied.length > 1) {

        var player = copied[0]
        var matched = null
        for (var i = 1; i < copied.length; i++) {
            //TODO jakiś algorytm
            matched = copied[i]
        }

        var duelId = player.player.login + "VS" + matched.player.login
        newDuels.push({
            id: duelId,
            player1: player,
            player2: matched,
        })
        copied.splice(0, 1)
        copied.splice(i, 1)
    }

    players = copied.splice()
    handleNewDuels(newDuels)
    updateActive()
    scheduledMatchMaking = null
    matchMakingTrigger(5000)
}

function matchMakingTrigger(delay) {
    if (scheduledMatchMaking != null || getSearchers.length < 2)
        return

    scheduledMatchMaking = setTimeout(matchMake, delay)
}

function handleNewDuels(newDuels) {

    newDuels.forEach(element => {

        element.player1.socket.join(element.id)
        element.player2.socket.join(element.id)

        element.player1.socket.emit('gameFound', element.player2.player)
        element.player2.socket.emit('gameFound', element.player1.player)
    })
}

module.exports = {

    activeGameBlock: (req, res, next) => {

        var username = req.user.login
        var index = getSearchers.findIndex((element => { element.player.login == username }))
        if (index != -1)
            return res.json({ "error": "Niedozwolone podczas szukania gry" })

        index = duels.findIndex((element) => { element.player1.login == username || element.player2.login == username })
        if (index != -1)
            return res.json({ "error": "Niedozwolone podczas gry w toku" })

        return next()
    },

    init: function (app, io) {

        this.io = io

        io.on('connection', (socket) => {

            var player = socket.request.user
            var index = players.findIndex((element => { element.login == player.login }))
            if (index != 1) {
                socket.emit("error", "Gracz jest już połączony")
                socket.disconnect(true)
                return
            }
            players.push({
                "player": player,
                "started": 0,
                "socket": socket
            })
            socket.emit('activeUpdate', {
                "players": getSearchers.length,
                "duels": duels.length
            })

            socket.on('findGame', function () {
                var index = players.findIndex((element => { element.player.login == player.login }))
                players[index].started = Date.now()
                updateActive()
                matchMakingTrigger(0)
            })

            socket.on('cancelFind', function () {
                var index = players.findIndex((element => { element.player.login == player.login }))
                players[index].started = 0
                updateActive()
            })

            socket.on('disconnect', function () {
                var index = players.findIndex((element => { element.player.login == player.login }))
                if (index == -1) return
                players.splice(index, 1)
                updateActive()
            })
        })
    }
}
