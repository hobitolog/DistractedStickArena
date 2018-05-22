// utility log functions
const fs = require('fs')
const config = require('./config')
var stream = fs.createWriteStream("access.log", { flags: "a" })

module.exports = {

    info: function (...messages) {
        messages.unshift('\x1b[37m[INFO]')
        messages.push('\x1b[0m')
        console.log(...messages)
    },

    warning: function (...messages) {
        messages.unshift('\x1b[1;33m[WARN]')
        messages.push('\x1b[0m')
        console.log(...messages)
    },

    error: function (...messages) {
        messages.unshift('\x1b[1;31m[ERROR]')
        messages.push('\x1b[0m')
        console.log(...messages)
    },

    logActivity: (req, res, next) => {

        if (!config.enableActivityLog) {
            if (next)
                next()
            return
        }

        var time = new Date().toISOString().replace("T", " ")
        var login = "@"
        if (req.user)
            login = req.user.login
        var ua = req.headers['user-agent']
        var path = req.originalUrl
        var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
        var method = req.method
        var entry = time + "\t" + "\t" + method + "\t" + path + "\t" + login + "\t" + ip + "\t" + ua + "\n"
        stream.write(entry)
        if (next)
            next()
    }
}

