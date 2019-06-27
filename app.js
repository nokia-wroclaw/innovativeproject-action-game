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
var currID = 0;

function hash(code) {
    let res = 0;
    let ans = "";
    const key = 307;
    const mod = 1000000009;

    for (let i = 0; i < code.length; i ++){
        res *= key;
        res += code.charCodeAt(i);
        res %= mod;
    }
    for (let i = 0; i < 6; i ++){
        ans += String.fromCharCode(res % (122 - 97) + 97);
        res /= key;
    }
    
    return ans;
}


io.on('connection', function(socket) {
    socket.on('new_room', function() {
        var room = new Room(2, hash("room" + currID));
        currID++;
        room.join(new Player(socket.id, 300, 300));
        rooms.push(room);

        // TODO: hash room_id for client
        io.sockets.to(socket.id).emit('new_room_info', room.info);

        let thread = setInterval(function() {
            let end = false;
            room.updateLevel();
            room.players.forEach(function(player) {
                if(player.progress >= 100) {
                    end = true;
                }
                let info = room.players.filter(p => p.id != player.id).map(p => p.info);
                info.unshift(player.info);
                info = { players: info, dish: room.dish };
                io.sockets.to(player.id).emit('update', info);
            });

            if(end) {
                room.players.forEach(function(player) {
                    if(player.progress >= 100) {
                        io.sockets.to(player.id).emit('win');
                    }else {
                        io.sockets.to(player.id).emit('lose');
                    }
                });
                rooms = rooms.filter(finished => finished.code != room.code);
                console.log("Room ended");
                clearInterval(this);
            }
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
