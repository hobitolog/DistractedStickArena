var log = require("./log")
var config = require("./config")
var login = require("./login")
var api = require("./api")
var weapons = require('./models/weapon')
var fight = require("./fight")
var passportSocketIo = require("passport.socketio")

var path = require('path')

var mongoose = require('mongoose')
mongoose.connect(config.dbUrl)

var express = require('express')
var app = express()

var passport = require('passport')
var expressSession = require('express-session')
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')
var morgan = require('morgan')
var MongoStore = require('connect-mongo')(expressSession)
var mongoStore = new MongoStore({ mongooseConnection: mongoose.connection })

app.use(expressSession({
    // key: 'connect.sid',
    store: mongoStore,
    secret: config.sessionSecret,
    resave: true,
    saveUninitialized: true,
    cookie: {
        httpOnly: false
    }
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(cookieParser())
app.use(bodyParser.json())
login.init(passport)

app.use(express.static(path.join(__dirname, '/public')))
app.use(morgan('dev'))

var server = require('http').createServer(app)
var io = require('socket.io')(server)
io.use(passportSocketIo.authorize({
    cookieParser: cookieParser,
    key: 'connect.sid',
    secret: config.sessionSecret,
    store: mongoStore,
    success: onAuthorizeSuccess,
    fail: onAuthorizeFail,  
}))
function onAuthorizeSuccess(data, accept){
    accept();
}
  
function onAuthorizeFail(data, message, error, accept){
    if(error)
        accept(new Error(message));
}
api(app)
fight.init(app, io)

app.get('/activation', login.isLoggedIn, (req, res) => {
    if (req.user.activation.activated)
        res.redirect('../')
    else
        res.sendFile(path.join(__dirname, '/html', 'activation.html'))
})

app.get('/activate', (req, res) => {

    var reqToken = req.query.token
    if (!reqToken) {
        res.sendFile(path.join(__dirname, '/html', 'activateFail.html'))
        return
    }

    var User = require('./models/user')
    User.findOne({ "activation.token": reqToken }, function (err, user) {

        if (!user || user.activation.activated) {
            res.sendFile(path.join(__dirname, '/html', 'activateFail.html'))
            return
        }

        user.activation.activated = true
        user.save(function (err) {
            if (err)
                log.error(err)
            else
                res.sendFile(path.join(__dirname, '/html', 'activateSuccess.html'))
        })
    })
})

app.get('/', login.isLoggedIn, login.isActivated, (req, res) => {
    res.sendFile(path.join(__dirname, '/html', 'main.html'))
})

app.get('/addWeapon', (req, res) => {
    res.sendFile(path.join(__dirname, '/html', 'addWeapon.html'))
})

app.post('/addWeapon', (req, res) => {

    var newWeapon = {
        "name": req.body.name,
        "type": req.body.type,
        "armor": req.body.armor,
        "damageMin": req.body.damageMin,
        "damageMax": req.body.damageMax,
        "level": req.body.level,
        "value": req.body.value
    }

    mongoose.connection.collection('prototypes').insert(newWeapon)
    res.redirect('addWeapon')
})

app.get('/login', (req, res) => {
    if (req.isAuthenticated())
        res.redirect('../')
    else
        res.sendFile(path.join(__dirname, '/html', 'login.html'))
})

app.post('/login', (req, res, next) => {
    passport.authenticate('local-login', function (err, user, info) {
        if (err) return next(err)

        if (!user) {
            return res.json({
                "error": req.loginMessage
            })
        }
        req.logIn(user, function (err) {
            if (err) return next(err)
            return res.json({
                "error": null
            })
        })
    })(req, res, next)
})

app.post('/register', (req, res, next) => {
    passport.authenticate('local-register', function (err, user, info) {
        if (err) return next(err)

        if (!user) {
            return res.json({
                "error": req.registerMessage
            })
        }
        req.logIn(user, function (err) {
            if (err) return next(err)
            return res.json({
                "error": null
            })
        })
    })(req, res, next)
})

app.get('/logout', (req, res) => {
    req.logout()
    res.redirect('login')
})

// UWAGA - NIE DODAWAĆ NIC PO TYM
app.use(function (req, res) {
    res.status(404).send('404: Page not Found')
})

app.use(function (err, req, res, next) {
    log.error(err)
    res.status(500).send('500: Internal Server Error<br>Dlaczego zepsułeś nam stronę? ;_;')
})

server.listen(80, () => {
    log.info("Server started")
})
