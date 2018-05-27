const mongoose = require('mongoose')

module.exports = {

    addMatch: function (players, winnerNick, winnerReward, loserReward) {

        const match = {
            "date": new Date(),
            "rewards": {
                "winner": winnerReward,
                "loser": loserReward
            }
        }

        players.forEach(element => {
            var player = {
                "login": element.player.login,
                "lvl": element.player.character.level,
                "rank": element.player.character.rankingPoints,
                "stats": {
                    "str": element.player.character.stats.str,
                    "att": element.player.character.stats.att,
                    "agi": element.player.character.stats.agi,
                    "vit": element.player.character.stats.vit,
                    "sta": element.player.character.stats.sta,
                },
                "weapon": {
                    "itemId": element.player.character.equipment.weapon.itemId
                }
            }
            if (player.login == winnerNick)
                match.winner = player
            else
                match.loser = player
        })

        mongoose.connection.collection('matches').insert(match)
    }
}