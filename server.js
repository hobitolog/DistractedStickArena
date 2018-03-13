var log = require("./log")

var path = require('path')

var express = require('express')
var morgan = require('morgan')
var app = express()

var server = require('http').createServer(app)
var io = require('socket.io')(server)

app.use(express.static(path.join(__dirname + '/public')))
app.use(morgan('dev'))

app.get('/', (req, res) => {
    res.send("Hello there")
})

server.listen(80, () => {
    log.info("Server started")
})