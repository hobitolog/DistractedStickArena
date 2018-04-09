var log = require("./log")
var config = require("./config")
var login = require("./login")

var path = require('path')

var mongoose = require('mongoose')
mongoose.connect(config.dbUrl)

var express = require('express')
var passport = require('passport')
var expressSession = require('express-session')
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')
var morgan = require('morgan')
var app = express()

app.use(expressSession({ secret: config.sessionSecret }))
app.use(passport.initialize())
app.use(passport.session())
app.use(cookieParser())
app.use(bodyParser())
login.init(passport)

app.use(express.static(path.join(__dirname, '/public')))
app.use(morgan('dev'))

var server = require('http').createServer(app)
var io = require('socket.io')(server)

app.get('/', login.isLoggedIn, (req, res) => {
    res.sendFile(path.join(__dirname, '/html', 'main.html'))
})

app.get('/login', (req, res) => {
    if (req.isAuthenticated())
        res.redirect('/')
    else
        res.sendFile(path.join(__dirname, '/html', 'login.html'))
})

app.post('/login', (req, res, next) => {
    passport.authenticate('local-login', function(err, user, info){
        if(err) return next(err)

        if(!user) {
            return res.json({
                "error": req.loginMessage
            })
        }
        req.logIn(user, function(err){
            if(err) return next(err)
            return res.json({
                "error": null
            })
        })
    })(req, res, next)
})

app.post('/register', (req, res, next) => {
    passport.authenticate('local-register', function(err, user, info){
        if(err) return next(err)

        if(!user) {
            return res.json({
                "error": req.registerMessage
            })
        }
        req.logIn(user, function(err){
            if(err) return next(err)
            return res.json({
                "error": null
            })
        })
    })(req, res, next)
})

app.get('/logout', (req, res) => {
    req.logout()
    res.redirect('/login');
})

server.listen(80, () => {
    log.info("Server started")
})