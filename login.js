var LocalStrategy = require('passport-local').Strategy
var bcrypt = require('bcrypt')

var User = require('./models/user');
var log = require('./log')

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

            var createUser = () => {

                User.findOne({
                    $or: [
                        { email: req.body.registerEmail },
                        { login: req.body.registerLogin }
                    ]
                }).then(user => {

                    if (user) {
                        var msg = (user.email == req.body.registerEmail) ? "E-mail jest już używany." : "Login jest już używany."
                        req.registerMessage = msg
                        return done(null, false)
                    }
                    else if(req.body.registerLogin.length <3 | req.body.registerLogin.length >32) {
                        msg = "Login nie może być krótszy, niż 3 i dłuższy niż 32 znaki."
                        req.registerMessage = msg
                        return done(null, false)
                    }
                    else {
                        var newUser = new User()
                        newUser.login = req.body.registerLogin
                        newUser.email = req.body.registerEmail
                        newUser.setPassword(req.body.registerPassword)

                        newUser.save(function (err) {
                            if (err) {
                                log.error("Error creating user: " + err)
                                return done(err)
                            }

                            log.info('New user registered: ' + newUser.login)
                            return done(null, newUser);
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
            User.findOne({ login: username }, function (err, user) {
                if (err) { return done(err) }
                if (!user || !user.isValidPassword(password)) {
                    req.loginMessage = 'Nieprawidłowy login lub hasło.'
                    return done(null, false)
                }
                return done(null, user)
            })
        }))
    },

    isLoggedIn: (req, res, next) => {

        if (req.isAuthenticated())
            return next()

        res.redirect('/login')
    },
}