var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');

var app = express();
var server = http.Server(app);
var io = socketIO(server);

var Player = require('./server/player.js');
var Room = require('./server/room.js');

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

var rooms = [];

io.on('connection', function(socket) {
    socket.on('new_room', function() {
        var room = new Room(2, "test" + rooms.length);
        room.join(new Player(socket.id, 300, 300));
        rooms.push(room);
        var room_id = rooms.length - 1;

        setInterval(function() {
            rooms[room_id].players.forEach(function(player) {
                player.update();
            });
            rooms[room_id].players.forEach(function(player) {
                io.sockets.to(player.id).emit('update', room.players.map(player => player.info));
            });
        }, 1000 / 60);
    });

    // TODO: validate data sent from user

    socket.on('join_room', function(data) {
        rooms.find(room => room.code == data).join(new Player(socket.id, 300, 300));
    });

    socket.on('key_states', function(data) {
        rooms.forEach(function(room) {
            room.update(socket.id, data);
        });
    });

    socket.on('disconnect', function() {
        rooms.forEach(function(room) {
            room.disconnect(socket.id);
        });
    });
});
