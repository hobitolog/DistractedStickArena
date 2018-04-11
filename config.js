var fs = require('fs')

var defaults = {
    dbUrl: 'mongodb://localhost/StickArena',
    sessionSecret: 'tududu',
    disableMail: true,
    mailConfig: null
}

if (!fs.existsSync('config.json')) {
    var json = JSON.stringify(defaults)
    fs.writeFileSync('config.json', json, { encoding: 'utf8' })
}
var contents = fs.readFileSync('config.json', { encoding: 'utf8' })
var config = JSON.parse(contents)

module.exports = config