const itemFetcher = require('./itemFetcher')
var log = require("./log")
var io

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
async function matchMake() {
    var newDuels = []
    var copied = getSearchers().slice()
    while (copied.length > 1) {

        var player = copied[0]
        var matched = null
        for (var i = 1; i < copied.length; i++) {
            //TODO jakiś algorytm
            matched = copied[i]
        }

        var duelId = player.player.login + "VS" + matched.player.login
        var duel = {
            id: duelId,
            player1: player,
            player2: matched,
        }

        duel.character1 = await extractUserCharacter(player.player)
        duel.character2 = await extractUserCharacter(matched.player)

        newDuels.push(duel)
        duels.push(duel)
        copied.splice(0, 1)
        copied.splice(i, 1)
    }
    players = copied.slice()
    handleNewDuels(newDuels)
    updateActive()
    scheduledMatchMaking = null
    matchMakingTrigger(5000)
}

async function extractUserCharacter (player) {
    var eq = await itemFetcher.getCurrentVariants(
        player.character.equipment.helmet.itemId,
        player.character.equipment.armor.itemId,
        player.character.equipment.weapon.itemId
    )

    var character = {
        name: player.login,
        lvl: player.character.level,
        stats: {
            damageMin: eq[2].damageMin + Math.round(player.character.stats.str * 0.5),
            damageMax: eq[2].damageMax + Math.round(player.character.stats.str * 0.6),
            hp: 30 + player.character.stats.vit * 2,
            hpMax: 30 + player.character.stats.vit * 2,
            energy: 20 + Math.round(player.character.stats.sta * 1.5),
            energyMax: 20 + Math.round(player.character.stats.sta * 1.5),
            armor: (eq[1].armor + eq[0].armor),
            armorMax: (eq[1].armor + eq[0].armor)
        }
    }

    return character
}

function matchMakingTrigger(delay) {
    if (scheduledMatchMaking != null || getSearchers().length < 2)
        return

    scheduledMatchMaking = setTimeout(matchMake, delay)
}

function handleNewDuels(newDuels) {

    newDuels.forEach(element => {

        element.player1.socket.join(element.id)
        element.player2.socket.join(element.id)

        element.player1.socket.emit('gameFound', element.character1, element.character2)
        element.player2.socket.emit('gameFound', element.character2, element.character1)
    })
}

function getPlayerDuel (player) {
    
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

    init: function (app, ioParam) {

        io = ioParam

        io.on('connection', (socket) => {
            var player = socket.request.user
            var index = players.findIndex((element => { element.login == player.login }))
            if (index != -1) {
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
                var index = players.findIndex((element => { return element.player.login == player.login }))
                players[index].started = Date.now()
                updateActive()
                matchMakingTrigger(0)
            })

            socket.on('cancelFind', function () {
                var index = players.findIndex((element => { element.player.login == player.login }))
                players[index].started = 0
                updateActive()
            })

            socket.on('attack', function () {
                console.log(player.login)
            })

            socket.on('swiftAttack', function () {
                
            })

            socket.on('powerfulAttack', function () {
                
            })

            socket.on('rest', function () {
                
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
