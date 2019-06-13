var LocalStrategy = require('passport-local').Strategy
var bcrypt = require('bcrypt')
var request = require('request')
var config = require("./config")

var User = require('./models/user')
var log = require('./log')

var allowedChars = "123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
    + "ąćęśżźńół_-+=<>,.?"

module.exports = {
    init: function (passport) {

        passport.serializeUser(function (user, done) {
            done(null, user._id)
        })

        passport.deserializeUser(function (id, done) {
            User.findById(id, function (err, user) {
                done(err, user)
            })
        })

        passport.use('local-register', new LocalStrategy({
            usernameField: "registerLogin",
            passwordField: "registerPassword",
            passReqToCallback: true
        }, (req, username, password, done) => {
            return done(null, false)
            var createUser = () => {

                var email = req.body.registerEmail

                if (!username || !password || !email) {
                    req.registerMessage = "Dane są niekompletne"

                }

                if (!email.includes("@")) {
                    req.registerMessage = "Adres e-mail jest nieprawidłowy"
                    return done(null, false)
                }

                if (username.length < 2 || username.length > 30) {
                    req.registerMessage = "Login musi zawierać od 2 do 30 znaków"
                    return done(null, false)
                }

                username.split("").forEach(char => {
                    if (!allowedChars.includes(char)) {
                        req.registerMessage = "Login zawiera niedozwolony znak: '" + char + "'"
                        return done(null, false)
                    }
                })

                if (password.length < 8) {
                    req.registerMessage = "Hasło musi zawierać conajmniej 8 znaków"
                    return done(null, false)
                }

                User.findOne({
                    $or: [
                        { "email": email },
                        { "login": username }
                    ]
                }).then(user => {

                    if (user) {
                        var msg = (user.email == email) ? "Adres e-mail jest już używany." : "Login jest już używany."
                        req.registerMessage = msg
                        return done(null, false)
                    }
                    else {
                        var newUser = new User()
                        newUser.email = email
                        newUser.initActivation(function (success) {
                            if (!success) {
                                req.registerMessage = "Adres e-mail jest nieprawidłowy."
                                return done(null, false)
                            }
                            else {
                                newUser.login = username
                                newUser.setPassword(password)

                                newUser.save(function (err) {
                                    if (err) {
                                        log.error("Error creating user: " + err)
                                        return done(err)
                                    }

                                    log.info('New user registered: ' + newUser.login)
                                    return done(null, newUser)
                                })
                            }
                        })
                    }
                })
            }
            process.nextTick(createUser)
        }))

        passport.use('local-login', new LocalStrategy({
            usernameField: "login",
            passwordField: "password",
            passReqToCallback: true
        }, function (req, username, password, done) {
            request.post(
                'http://' + config.mainServer + ":" + config.mainServerPort + '/authUser',
                { json: {
                    "login": username,
                    "password": password
                 } },
                function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        User.findOne({ login: username }, function (err, user) {
                            if (err) { return done(err) }
                            if (!user) {
                                var newUser = new User()
                                newUser.login = username
                                newUser.activation.activated=true
                                newUser.setPassword(password)
                                newUser.save(function (err) {
                                    if (err) {
                                        log.error("Error creating user: " + err)
                                        return done(err)
                                    }

                                    log.info('Registered user character created: ' + newUser.login)
                                    return done(null, newUser)
                                })  
                            } else {
                                return done(null, user)
                            }
                        })
                    } else {
                        if(error) {
                            req.loginMessage = 'Wystąpił błąd!';
                            return done(null, false)
                        } else {
                            req.loginMessage = 'Nieprawidłowy login lub hasło!'
                            return done(null, false)
                        }
                    }
                }
            )
        }))
    },

    isLoggedIn: (req, res, next) => {

        log.logActivity(req, res, null)

        if (req.isAuthenticated())
            return next()

        return res.redirect('login')
    },

    isActivated: (req, res, next) => {

        if (req.user.activation.activated)
            return next()

        return res.redirect('activation')
    }
}