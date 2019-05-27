var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');

var app = express();
var server = http.Server(app);
var io = socketIO(server);

var Player = require('./server/player.js');
var Room = require('./server/room.js');
var Mast = require('./server/Mast');
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
var currID = 0;

io.on('connection', function(socket) {
    socket.on('new_room', function() {
        var room = new Room(2, "x3W1oc" + currID);
        currID++;
        room.join(new Player(socket.id, 300, 300));
        rooms.push(room);

        // TODO: hash room_id for client
        io.sockets.to(socket.id).emit('new_room_info', room.info);

        let thread = setInterval(function() {
            room.updateLevel();
            room.players.forEach(function(player) {
                let info = room.players.filter(p => p.id != player.id).map(p => p.info);
                info.unshift(player.info);
                info = { players: info, dish: room.dish };
                io.sockets.to(player.id).emit('update', info);
            });
        }, 1000 / 120);

        room.thread = thread;
    });

    socket.on('join_room', function(data) {
        var room = rooms.find(room => room.code == data)
        if(room){
            if(room.slots == room.players.length) {
                io.sockets.to(socket.id).emit('join_room_info', 'full');
            } else {
                room.join(new Player(socket.id, 300, 300))
                io.sockets.to(socket.id).emit('join_room_info', room.info);
                if(room.slots == room.players.length) {
                    room.started = true;
                    room.players.forEach(function(player) {
                        io.sockets.to(player.id).emit('started');
                    });
                }
            }
        } else {
            io.sockets.to(socket.id).emit('join_room_info', 'failed');
        }
    });

    // TODO: validate data sent from user
    socket.on('key_states', function(data) {
        rooms.forEach(function(room) {
            room.update(socket.id, data);
        });
    });

    // TODO: rooms bug somehow after removal :(
    socket.on('disconnect', function() {
        let toRemove;
        rooms.forEach(function(room) {
            if(room.disconnect(socket.id) == 1) {
                toRemove = room.code;
                clearInterval(room.thread);
            }
        });
        if(toRemove) {
            rooms = rooms.filter(room => room.code != toRemove);
            console.log("Room terminated (" + toRemove + ")");
        }
    });
});
