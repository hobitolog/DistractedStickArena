const itemFetcher = require('./itemFetcher')
var log = require("./log")
var io

const swiftAttackCost = 6
const attackCost = 8
const powerfulAttackCost = 10

var players = []
var duels = new Map()

var scheduledMatchMaking = null

function getSearchers() {
    return players.filter(x => x.started > 0)
}

function updateActive() {
    io.emit('activeUpdate', {
        "players": getSearchers.length,
        "duels": duels.length
    })
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

        // console.log('matchuje ' + player.socket.id + ' z ' + matched.socket.id)
        var duel = {
            id: duelId,
            player1: player,
            player2: matched,
            characters: null,
        }

        duel.characters = await extractDuelCharacters(player.player, matched.player)

        duel.turn = (player.player.character.stats.agi >= matched.player.character.stats.agi 
            ? player.player.login : matched.player.login)

        newDuels.push(duel)
        duels.set(player.player.login, duel)
        duels.set(matched.player.login, duel)

        players[getPlayerIndex(player.player.login)].started = -1;
        players[getPlayerIndex(matched.player.login)].started = -1;

        copied.splice(0, 1)
        copied.splice(i, 1)
    }
    handleNewDuels(newDuels)
    updateActive()
    scheduledMatchMaking = null
    matchMakingTrigger(5000)
}

async function extractDuelCharacters (player1, player2) {
    var result = new Map()

    var p1Eq = await itemFetcher.getCurrentVariants(
        player1.character.equipment.helmet.itemId,
        player1.character.equipment.armor.itemId,
        player1.character.equipment.weapon.itemId
    )

    var p2Eq = await itemFetcher.getCurrentVariants(
        player2.character.equipment.helmet.itemId,
        player2.character.equipment.armor.itemId,
        player2.character.equipment.weapon.itemId
    )

    var character1 = {
        login: player1.login,
        opponent: player2.login,
        lvl: player1.character.level,
        stats: {
            damageMin: p1Eq[2].damageMin + Math.round(player1.character.stats.str * 0.5),
            damageMax: p1Eq[2].damageMax + Math.round(player1.character.stats.str * 0.6),
            hp: 30 + player1.character.stats.vit * 2,
            hpMax: 30 + player1.character.stats.vit * 2,
            energy: 20 + Math.round(player1.character.stats.sta * 1.5),
            energyMax: 20 + Math.round(player1.character.stats.sta * 1.5),
            armor: (p1Eq[1].armor + p1Eq[0].armor),
            armorMax: (p1Eq[1].armor + p1Eq[0].armor),
            hitChance: Math.round(50 * player1.character.stats.att / player2.character.stats.agi)
        }
    }

    var character2 = {
        login: player2.login,
        opponent: player1.login,
        lvl: player2.character.level,
        stats: {
            damageMin: p2Eq[2].damageMin + Math.round(player2.character.stats.str * 0.5),
            damageMax: p2Eq[2].damageMax + Math.round(player2.character.stats.str * 0.6),
            hp: 30 + player2.character.stats.vit * 2,
            hpMax: 30 + player2.character.stats.vit * 2,
            energy: 20 + Math.round(player2.character.stats.sta * 1.5),
            energyMax: 20 + Math.round(player2.character.stats.sta * 1.5),
            armor: (p2Eq[1].armor + p2Eq[0].armor),
            armorMax: (p2Eq[1].armor + p2Eq[0].armor),
            hitChance: Math.round(50 * player2.character.stats.att / player1.character.stats.agi)
        }
    }

    result.set(character1.login, character1)
    result.set(character2.login, character2)

    return result
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

        var ch1 = element.characters.get(element.player1.player.login)
        var ch2 = element.characters.get(element.player2.player.login)

        // console.log('leci do ' + element.player1.socket.id)
        // console.log('leci do ' + element.player2.socket.id)

        element.player1.socket.emit('gameFound', ch1, ch2)
        element.player2.socket.emit('gameFound', ch2, ch1)
    })
}

function isUserTurn(login) {
    if(duels.get(login) == undefined || duels.get(login).turn != login)
        return false;
    return true
}

function getCharacterIndex(login) {
    if(!duels.get(login))
        return -1;
    else if(duels.get(login).character1.login == login)
        return 0
}

function handleUserAction(login, socket, action) {
    if(!isUserTurn(login)) {
        socket.emit('notYourTurn')
        return
    }

    var duel = duels.get(login)
    var room = duel.id
    var character = duel.characters.get(login)

    switch(action) {
        case 'attack':
        //TODO opakowac w funkcje, zeby ladnie wygladalo!!!
        var opponent = duel.characters.get(character.opponent)
        if(isEnoughEnergy(action, character.stats.energy)) {
            character.stats.energy -= attackCost
            if(!hitLanded(character.stats.hitChance)) {
                io.to(room).emit('miss', character)
            } else {
                
                
                var hparm = opponent.stats.hp + opponent.stats.armor
                var damage = character.stats.damageMin
                + Math.round(Math.random() * (character.stats.damageMax - character.stats.damageMin)) 
                + 1
                
                var hparmAfterHit = hparm - damage
                if(hparmAfterHit < opponent.stats.hpMax) {
                    opponent.stats.hp -= damage
                    opponent.stats.armor = 0
                } else {
                    opponent.stats.armor -= damage
                }

                io.to(room).emit('attack', character, opponent)
            }
        } else {
            socket.emit('noEnoughEnergy')
            return
        }
        break

        case 'swiftAttack':
        var opponent = duel.characters.get(character.opponent)
        if(isEnoughEnergy(action, character.stats.energy)) {
            character.stats.energy -= swiftAttackCost

            if(!hitLanded(character.stats.hitChance)) {
                io.to(room).emit('swiftMiss', character)
            } else {
                var hparm = opponent.stats.hp + opponent.stats.armor
                var damage = Math.round((character.stats.damageMin
                + Math.round(Math.random() * (character.stats.damageMax - character.stats.damageMin)) 
                + 1) * 0.7)
                
                var hparmAfterHit = hparm - damage
                if(hparmAfterHit < opponent.stats.hpMax) {
                    opponent.stats.hp -= damage
                    opponent.stats.armor = 0
                } else {
                    opponent.stats.armor -= damage
                }
                io.to(room).emit('swiftAttack', character, opponent)
            }
        } else {
            socket.emit('noEnoughEnergy')
            return
        }
        break

        case 'powerfulAttack':
        var opponent = duel.characters.get(character.opponent)
        if(isEnoughEnergy(action, character.stats.energy)) {
            character.stats.energy -= powerfulAttackCost
            if(!hitLanded(character.stats.hitChance)) {
                io.to(room).emit('powerfulMiss', character)
            } else {
                var hparm = opponent.stats.hp + opponent.stats.armor
                var damage = Math.round((character.stats.damageMin
                + Math.round(Math.random() * (character.stats.damageMax - character.stats.damageMin)) 
                + 1) * 1.3)
                
                var hparmAfterHit = hparm - damage
                if(hparmAfterHit < opponent.stats.hpMax) {
                    opponent.stats.hp -= damage
                    opponent.stats.armor = 0
                } else {
                    opponent.stats.armor -= damage
                }

                io.to(room).emit('powerfulAttack', character, opponent)
            }
        } else {
            socket.emit('noEnoughEnergy')
            return
        }
        break

        case 'rest':
        var energyAfterRest = character.stats.energy + Math.round(character.stats.energyMax * 0.2)
        if(energyAfterRest > character.stats.energyMax)
            energyAfterRest = character.stats.energyMax
        character.stats.energy = energyAfterRest;

        io.to(room).emit('rest', character)
        break

        default:
        socket.emit('incorrectAction')
        return
        break
    }
    duel.turn = duel.characters.get(login).opponent
}

function hitLanded(hitChance) {
    if(Math.floor(Math.random() * 101) < hitChance)
        return true
    return false
}

function isEnoughEnergy(attack, energy) {
    switch(attack) {
        case 'attack':
            if(energy >= attackCost)
                return true
        break

        case 'swiftAttack':
            if(energy >= swiftAttackCost)
                return true
        break

        case 'powerfulAttack':
            if(energy >= powerfulAttackCost)
                return true
        break
    }
    return false
}

function getPlayerIndex(login) {
    return players.findIndex((element => { return element.player.login == login }))
}

module.exports = {

    activeGameBlock: (req, res, next) => {

        var username = req.user.login
        var index = getSearchers.findIndex((element => { return element.player.login == username }))
        if (index != -1)
            return res.json({ "error": "Niedozwolone podczas szukania gry" })

        index = duels.findIndex((element) => { return element.player1.login == username || element.player2.login == username })
        if (index != -1)
            return res.json({ "error": "Niedozwolone podczas gry w toku" })

        return next()
    },

    init: function (app, ioParam) {

        io = ioParam

        io.on('connection', (socket) => {
            var player = socket.request.user
            var index = getPlayerIndex(player.login)
            if (index != -1) {
                socket.emit("errorMessage", "Gracz jest już połączony")
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
                var index = getPlayerIndex(player.login)
                players[index].started = Date.now()
                updateActive()
                matchMakingTrigger(0)
            })

            socket.on('cancelFind', function () {
                var index = getPlayerIndex(player.login)
                players[index].started = 0
                updateActive()
            })

            socket.on('attack', function () {
                handleUserAction(player.login, socket, 'attack')
            })

            socket.on('swiftAttack', function () {
                handleUserAction(player.login, socket, 'swiftAttack')
            })

            socket.on('powerfulAttack', function () {
                handleUserAction(player.login, socket, 'powerfulAttack')
            })

            socket.on('rest', function () {
                handleUserAction(player.login, socket, 'rest')
            })

            socket.on('disconnect', function () {
                if(duels.get(player.login) != undefined) {
                    var d = duels.get(player.login)
                    var opp = d.characters.get(player.login).opponent
                    io.to(d.id).emit('endDuel', opp)
                    duels.delete(player.login)
                    duels.delete(opp)
                }
                var index = getPlayerIndex(player.login)
                if (index == -1) return
                players.splice(index, 1)
                updateActive()
            })
        })
    }
}
