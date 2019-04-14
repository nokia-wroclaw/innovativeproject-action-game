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

var width = 640;
var height = 480;
var scale = 32;
var canv, ctx;
var mapTown;

var player1Sprite;
var player2Sprite;
var mast1Sprite;

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,    
        function(m,key,value) {
            vars[key] = value;
        });
    return vars;
}

window.onload = function() {
    canv = document.getElementById('canvas');

    canv.width = width;
    canv.height = height;

    ctx = canv.getContext('2d');

    var room_id = getUrlVars()['id'];
    if(room_id) {
        socket.emit('join_room', room_id);
        socket.on('join_room_info', function(data) {
            if(data == 'failed') {
                alert('Could not find a room with this id!');
            } else {
                mapTown = data.map;
                startGame();
            }
        });
    } else {
        socket.emit('new_room');
        socket.on('new_room_info', function(data) {
            if(!data) {
                alert('Creating a new room failed!');
            } else {
                alert('Created a new room, invitation link: ' + window.location.href + '?id=' + data.id);
                mapTown = data.map;
                startGame();
            }
        });
    }
}

function startGame() {
    setInterval(function() {
        socket.emit('key_states', key_states);
    }, 1000 / 60);

    var blocks = ["white", "black", "green"];

    player1Sprite = new Image();
    player2Sprite = new Image();
    mast1Sprite = new Image();

    player1Sprite.src = "/public/res/player1.png";
    player2Sprite.src = "/public/res/player2.png";
    mast1Sprite.src = "/public/res/mast0.png";
    socket.on('update', function(players) {
        for (var i = 0; i < mapTown.length ; i++){
            for (var j = 0 ; j < mapTown[i].length; j++) {
                ctx.fillStyle = blocks[mapTown[i][j]];
                ctx.fillRect(scale * j, scale * i, scale, scale);
            }
        }
        ctx.fillStyle = 'red';
        for (var id in players) {

            let player = players[id];
            ctx.drawImage(player1Sprite,player.x-scale/2, player.y-scale/2);
            drawImageRot(mast1Sprite,player.mast.first_end.x,player.mast.first_end.y,16,32,player.mast.angle);
             }

    });

function drawImageRot(img,x,y,width,height,deg){

        //Convert degrees to radian
        var rad = deg * Math.PI / 180;

        //Set the origin to the center of the image
        ctx.translate(x + width / 2, y + height / 2);

        //Rotate the canvas around the origin
        ctx.rotate(rad);

        //draw the image
        ctx.drawImage(img,width / 2 * (-1),height / 2 * (-1),width,height);

        //reset the canvas
        ctx.rotate(rad * ( -1 ) );
        ctx.translate((x + width / 2) * (-1), (y + height / 2) * (-1));
    }
}
