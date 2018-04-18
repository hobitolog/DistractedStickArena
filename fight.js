
var players = []
var duels = []

function updateActive(io) {
    
    io.emit('activeUpdate', {
        "players": players.length,
        "duels": duels.length
    })
}

//TODO nie czytać bo dalej jest syf
function matchMake() {
    if(players.length < 2)
        return
        
    var copied = players.splice()
    while(copied.length > 0) {
        
        findOpp(copied)   
        
    }
        
}

function findOpp(array)
{
    array.forEach((element) => {
        
        if(player.login == element.login) 
        
    })
}

module.exports = function (app, io) {


    /*app.get('/getActivePlayers', function(req, res) {
        res.json({"amount": players.length})
    })
    
    app.get('/getActiveDuels', function(req, res) {
        res.json({"amount": duels.length})
    })*/
    

    io.on('connection', (socket) => {
        
        var player = socket.request.user
        players.push(player)
        updateActive(io)
        
        matchMake()
        
    
        socket.on('disconnect'. function() {
            var index = players.findIndex((element => {
                element.login == player.login
            }))
            players.splice(index, 1)
            updateActive(io)
        })
    })
}
