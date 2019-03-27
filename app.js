var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');

var app = express();
var server = http.Server(app);
var io = socketIO(server);

var Player = require('./server/player.js');

app.set('port', 5000);

app.use(express.static(__dirname + '/public'));
app.use('/public', express.static(__dirname + '/public'));

// ROUTING
app.get('/', function(request, response) {
    response.sendFile(path.join(__dirname, 'index.html'));
});
// -------

server.listen(5000, function() {
    console.log('Nokia Action Game server\nRunning on port 5000');
});

var players = [];

io.on('connection', function(socket) {
    socket.on('new_player', function() {
        players.push(new Player(socket.id, 300, 300));
    });

    socket.on('key_states', function(data) {
        players.find(function(player){
            return player.id == socket.id;
        }).key_states = data;
    });

    socket.on('disconnect', function() {
        players = players.filter(player => player.id != socket.id);
    });
});

// TODO: Implement better fps timing
setInterval(function() {
    players.forEach(function(player){
        player.move(); 
    });
    io.sockets.emit('update', players.map(player => player.info));
}, 1000 / 60);
