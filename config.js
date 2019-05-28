var fs = require('fs')

var defaults = {
    dbUrl: 'mongodb://localhost/StickArena',
    sessionSecret: 'tududu',
    disableMail: true,
    mailConfig: null,
    skipWeaponChanges: false,
    enableActivityLog: false,
    adminToken: "admin",
    mainServer: "http://192.168.0.14:8080",
    serverAddress: "192.168.0.12",
    // mainServer: "http://192.168.0.12:8080",
    // serverAddress: "192.168.0.12",
    serverPort: 9090,
    serverIdentifier: "Duckling",
    serverDescription: "Server for ducklings"
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
var config = Object.assign(defaults, JSON.parse(contents))

module.exports = config