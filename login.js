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
            });
        })

        passport.use('local-register', new LocalStrategy({
            usernameField: "login",
            passwordField: "password",
            passReqToCallback: true
        }, (req, username, password, done) => {

            var createUser = () => {

                User.findOne({
                    $or: [
                        { email: req.body.email },
                        { login: req.body.login }
                    ]
                }).then(user => {

                    if (user) {
                        var msg = (user == req.body.email) ? "E-mail jest już używany." : "Login jest już używany."
                        return done(null, false, { message: msg })
                    }
                    else {
                        var newUser = new User()
                        newUser.login = username
                        newUser.email = req.body.email
                        newUser.setPassword(password)

                        newUser.save(function (err) {
                            if (err) {
                                log.error("Error creating user: " + err)
                                return done(err)
                            }

                            log.info('New user registered: ' + newUser.login)
                            return done(null, newUser);
                        });
                    }
                })
            }
            process.nextTick(createUser)
        }))

        passport.use('local-login', new LocalStrategy({
            usernameField: "login",
            passwordField: "password"
        }, function (username, password, done) {
            User.findOne({ login: username }, function (err, user) {
                if (err) { return done(err); }
                if (!user || !user.isValidPassword(password)) {
                    return done(null, false, { message: 'Nieprawidłowy login lub hasło.' })
                }
                return done(null, user);
            })
        }))
    },

    isLoggedIn: (req, res, next) => {

        if (req.isAuthenticated())
            return next()

        res.redirect('/login')
    },
}