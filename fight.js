const itemFetcher = require('./itemFetcher')
const userFetcher = require('./userFetcher')
const match = require("./models/match")
var log = require("./log")
var io

const swiftAttackCost = 6
const attackCost = 8
const powerfulAttackCost = 10

var players = []
var duels = new Map()
var bids = new Map()

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

async function matchMake() {
    var newDuels = []
    var copied = getSearchers().slice()
    while (copied.length > 1) {

        var player = copied[0]
        var matched = null
        var minLvlDiff = null
        var minRankDiff = null
        for (var i = 1; i < copied.length; i++) {
            //TODO lepszy algorytm xd
            var lvlDiff = Math.abs(player.player.level - copied[i].player.level)
            var rankDiff = Math.abs(player.player.rankingPoints - copied[i].player.level)

            if (!minLvlDiff || lvlDiff < minLvlDiff) {
                matched = copied[i]
                minLvlDiff = lvlDiff
                minRankDiff = rankDiff
            }
            else if (lvlDiff === minLvlDiff && rankDiff < minRankDiff) {
                matched = copied[i]
                minLvlDiff = lvlDiff
                minRankDiff = rankDiff
            }
        }

        if (matched) {
            var duelId = player.player.login + "VS" + matched.player.login

            // console.log('matchuje ' + player.socket.id + ' VS ' + matched.socket.id)
            var duel = {
                id: duelId,
                player1: player,
                player2: matched,
                characters: null,
            }


            duel.characters = await extractDuelCharacters(player.player.login, matched.player.login)

            duel.turn = (player.player.character.stats.agi >= matched.player.character.stats.agi
                ? player.player.login : matched.player.login)

            newDuels.push(duel)
            duels.set(player.player.login, duel)
            duels.set(matched.player.login, duel)

            players[getPlayerIndex(player.player.login)].started = 0;
            players[getPlayerIndex(matched.player.login)].started = 0;
        }

        copied.splice(0, 1)
        copied.splice(i, 1)
    }
    handleNewDuels(newDuels)
    updateActive()
    scheduledMatchMaking = null
    matchMakingTrigger(5000)
}

function changeTurn(duel) {
    clearInterval(duel.timer)
    duel.turn = duel.characters.get(duel.turn).opponent
    io.to(duel.id).emit('turn', duel.turn)

    duel.timer = setTimeout(() => {
        changeTurn(duel)}, 60000)
  }

async function extractDuelCharacters(p1Login, p2Login) {
    var result = new Map()

    var player1 = await userFetcher.getFullUser(p1Login)
    var player2 = await userFetcher.getFullUser(p2Login)

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
        weaponImage: p1Eq[2].image,
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
        weaponImage: p2Eq[2].image,
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

        element.player1.socket.emit('gameFound', ch1, ch2, element.turn)
        element.player2.socket.emit('gameFound', ch2, ch1, element.turn)

        setTimeout(function () {
            io.to(element.id).emit('turn', element.turn)
        }, 1000)

        element.timer = setTimeout(() => {
            changeTurn(element)}, 61000)

        modifyUserGold(element.player1.player, -1 * bids.get(element.player1.player.login))
        modifyUserGold(element.player2.player, -1 * bids.get(element.player2.player.login))
    })
}

function modifyUserGold(player, gold) {
    player.character.gold += parseInt(gold)

    player.save((function (err) {
        if (err)
            log.error(err)
    }))
}

function isUserTurn(login) {
    if (duels.get(login) == undefined || duels.get(login).turn != login)
        return false;
    return true
}

function getCharacterIndex(login) {
    if (!duels.get(login))
        return -1;
    else if (duels.get(login).character1.login == login)
        return 0
}

function handleUserAction(login, socket, action) {
    if (!isUserTurn(login)) {
        socket.emit('notYourTurn')
        return
    }

    var duel = duels.get(login)
    var room = duel.id
    var character = duel.characters.get(login)

    switch (action) {
        case 'attack':
            //TODO opakowac w funkcje, zeby ladnie wygladalo!!!
            var opponent = duel.characters.get(character.opponent)
            if (isEnoughEnergy(action, character.stats.energy)) {
                character.stats.energy -= attackCost
                if (!hitLanded(character.stats.hitChance)) {
                    io.to(room).emit('miss', 'normal', character)
                } else {
                    var hparm = opponent.stats.hp + opponent.stats.armor
                    var damage = character.stats.damageMin
                        + Math.round(Math.random() * (character.stats.damageMax - character.stats.damageMin))

                    var hparmAfterHit = hparm - damage
                    if (hparmAfterHit < opponent.stats.hpMax) {
                        opponent.stats.hp = (opponent.stats.hp - damage) < 1 ? 0 : opponent.stats.hp - (damage - opponent.stats.armor)
                        opponent.stats.armor = 0
                    } else {
                        opponent.stats.armor -= damage
                    }

                    io.to(room).emit('attack', 'normal', character, opponent)
                }
            } else {
                socket.emit('noEnoughEnergy')
                return
            }
            break

        case 'swiftAttack':
            var opponent = duel.characters.get(character.opponent)
            if (isEnoughEnergy(action, character.stats.energy)) {
                character.stats.energy -= swiftAttackCost

                if (!hitLanded(character.stats.hitChance)) {
                    io.to(room).emit('miss', 'swift', character)
                } else {
                    var hparm = opponent.stats.hp + opponent.stats.armor
                    var damage = Math.round((character.stats.damageMin
                        + Math.round(Math.random() * (character.stats.damageMax - character.stats.damageMin))) * 0.7)

                    var hparmAfterHit = hparm - damage
                    if (hparmAfterHit < opponent.stats.hpMax) {
                        opponent.stats.hp = (opponent.stats.hp - damage) < 1 ? 0 : opponent.stats.hp - (damage - opponent.stats.armor)
                        opponent.stats.armor = 0
                    } else {
                        opponent.stats.armor -= damage
                    }
                    io.to(room).emit('attack', 'swift', character, opponent)
                }
            } else {
                socket.emit('noEnoughEnergy')
                return
            }
            break

        case 'powerfulAttack':
            var opponent = duel.characters.get(character.opponent)
            if (isEnoughEnergy(action, character.stats.energy)) {
                character.stats.energy -= powerfulAttackCost
                if (!hitLanded(character.stats.hitChance)) {
                    io.to(room).emit('miss', 'powerful', character)
                } else {
                    var hparm = opponent.stats.hp + opponent.stats.armor
                    var damage = Math.round((character.stats.damageMin
                        + Math.round(Math.random() * (character.stats.damageMax - character.stats.damageMin))) * 1.3)

                    var hparmAfterHit = hparm - damage
                    if (hparmAfterHit < opponent.stats.hpMax) {
                        opponent.stats.hp = (opponent.stats.hp - damage) < 1 ? 0 : opponent.stats.hp - (damage - opponent.stats.armor)
                        opponent.stats.armor = 0
                    } else {
                        opponent.stats.armor -= damage
                    }

                    io.to(room).emit('attack', 'powerful', character, opponent)
                }
            } else {
                socket.emit('noEnoughEnergy')
                return
            }
            break

        case 'rest':
            var energyAfterRest = character.stats.energy + Math.round(character.stats.energyMax * 0.2)
            if (energyAfterRest > character.stats.energyMax)
                energyAfterRest = character.stats.energyMax
            character.stats.energy = energyAfterRest;

            io.to(room).emit('rest', character)
            break

        default:
            socket.emit('incorrectAction')
            return
            break
    }
    if (duel.characters.get(character.opponent).stats.hp < 1) {
        clearTimeout(duel.timer)
        handlePrizes(character.login, character.opponent)
    } else {
        duel.turn = duel.characters.get(login).opponent
        io.to(duel.id).emit('turn', duel.turn)
        clearTimeout(duel.timer)
        duel.timer = setTimeout(() => {
            changeTurn(duel)}, 60000)
    }
}

function hitLanded(hitChance) {
    if (Math.floor(Math.random() * 101) < hitChance)
        return true
    return false
}

function isEnoughEnergy(attack, energy) {
    switch (attack) {
        case 'attack':
            if (energy >= attackCost)
                return true
            break

        case 'swiftAttack':
            if (energy >= swiftAttackCost)
                return true
            break

        case 'powerfulAttack':
            if (energy >= powerfulAttackCost)
                return true
            break
    }
    return false
}

async function refreshPlayer(login, socket) {
    var index = getPlayerIndex(login)
    var user = await userFetcher.getFullUser(login)
    if(index != -1) {
        players[index].player = user
    }

    socket.request.user = user
}

function getPlayerIndex(login) {
    return players.findIndex((element => { return element.player.login == login }))
}

function handlePrizes(winner, loser) {
    var winnerProfile = players[getPlayerIndex(winner)]
    var loserProfile = players[getPlayerIndex(loser)]

    var exp = getRndInteger(6, 10)

    addExpToUser(winnerProfile.player, Math.round(exp * 1.3))
    addExpToUser(loserProfile.player, Math.round(exp * 0.7))

    modifyUserGold(winnerProfile.player, 2 * bids.get(winner))


    var rPoints = 8 + (winnerProfile.rankingPoints > loserProfile.player.character.rankingPoints ?
        0 : Math.round(((loserProfile.player.character.rankingPoints - winnerProfile.player.character.rankingPoints)/ 40) * 8))
    modifyRankingPoints(winnerProfile.player, rPoints)
    modifyRankingPoints(loserProfile.player, -rPoints)

    var winnerReward = {
        exp: Math.round(exp * 1.3),
        gold: bids.get(winner),
        rankingPoints: rPoints,
    }

    match.addMatch([winnerProfile, loserProfile], winner, winnerReward, { "exp": Math.round(exp * 0.7), "gold": -bids.get(loser) })

    winnerProfile.socket.emit("endDuel", winnerReward)
    loserProfile.socket.emit('endDuel', {
        exp: Math.round(exp * 0.7),
        rankingPoints: -rPoints,
    })

    bids.delete(winner)
    bids.delete(loser)

    duels.delete(winner)
    duels.delete(loser)

}

function addExpToUser(player, exp) {
    player.character.exp += exp
    if (player.character.exp >= (100 + (player.character.level - 1) * 50)) {
        player.character.exp -= (100 + (player.character.level - 1) * 50)
        player.character.level += 1
        player.character.stats.free += 5
    }

    player.save((function (err) {
        if (err)
            log.error(err)
    }))
}

function modifyRankingPoints(player, points) {
    player.character.rankingPoints += points
    if (player.character.rankingPoints < 0)
        player.character.rankingPoints = 0

    player.save((function (err) {
        if (err)
            log.error(err)
    }))
}

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

module.exports = {

    activeGameBlock: (req, res, next) => {

        var username = req.user.login
        var index = getSearchers().findIndex((element => { return element.player.login == username }))
        if (index != -1)
            return res.json({ "error": "Niedozwolone podczas szukania gry" })

        if (duels.get(req.user.login))
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

            socket.on('findGame', function (userBid) {
                if (player.character.gold < userBid) {
                    socket.emit('notEnoughGold')
                } else {
                    var index = getPlayerIndex(player.login)
                    bids.set(player.login, userBid)
                    players[index].started = Date.now()
                    updateActive()
                    matchMakingTrigger(0)
                    refreshPlayer(player.login, socket)
                }
            })

            socket.on('cancelFind', function () {
                bids.delete(player.login)
                var index = getPlayerIndex(player.login)
                players[index].started = 0
                updateActive()
            })

            socket.on('action', function (actionType) {
                if (duels.get(player.login))
                    handleUserAction(player.login, socket, actionType)
            })

            socket.on('surrender', function () {
                var d = duels.get(player.login)
                if (d) {
                    var opp = d.characters.get(player.login).opponent
                    handlePrizes(opp, player.login)
                }
            })

            socket.on('disconnect', function () {
                if (duels.get(player.login) != undefined) {
                    var d = duels.get(player.login)
                    var opp = d.characters.get(player.login).opponent
                    handlePrizes(opp, player.login)
                }
                bids.delete(player.login)
                var index = getPlayerIndex(player.login)
                if (index == -1) return
                players.splice(index, 1)
                updateActive()
            })
        })
    }
}
