var socket = io();

// W, S, A, D
var key_states = {
    up:    false,
    down:  false,
    left:  false,
    right: false
}

document.addEventListener('keyup', function(event) {
    switch (event.keyCode) {
        case 87:
            key_states.up = false;
            break;
        case 83:
            key_states.down = false;
            break;
        case 65:
            key_states.left = false;
            break;
        case 68:
            key_states.right = false;
            break;
        
    }
});

document.addEventListener('keydown', function(event) {
    switch (event.keyCode) {
        case 87:
            key_states.up = true;
            break;
        case 83:
            key_states.down = true;
            break;
        case 65:
            key_states.left = true;
            break;
        case 68:
            key_states.right = true;
            break;
    }
});

window.onload = function() {
    socket.emit('new_player');
    setInterval(function() {
        socket.emit('key_states', key_states);
    }, 1000 / 60);

    var width = 640;
    var height = 480;
    var scale = 16;

    var canv = document.getElementById('canvas');

    canv.width = width;
    canv.height = height;

    var ctx = canv.getContext('2d');

    socket.on('update', function(players) {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = 'red';
        for (var id in players) {
            ctx.fillRect(players[id].x-scale/2, players[id].y-scale/2, scale, scale);
        }
    });
}
