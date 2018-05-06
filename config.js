var fs = require('fs')

var defaults = {
    dbUrl: 'mongodb://localhost/StickArena',
    sessionSecret: 'tududu',
    disableMail: true,
    mailConfig: null
}

/*
Przykładowy mailConfig:
mailConfig: {
    host: 'mail.student.put.poznan.pl',
    port: 587,
    secure: false,
    auth: {
        user: "imie.nazwisko@student.put.poznan.pl",
        pass: "haslo"
    }
}*/

if (!fs.existsSync('config.json')) {
    var json = JSON.stringify(defaults)
    fs.writeFileSync('config.json', json, { encoding: 'utf8' })
}
var contents = fs.readFileSync('config.json', { encoding: 'utf8' })
var config = JSON.parse(contents)

module.exports = config