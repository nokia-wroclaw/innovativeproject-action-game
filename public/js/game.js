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
        case 32:
            socket.io.emit('test');
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

var backgroundLayer;
var player1Sprite;
var player2Sprite;
var mast1Sprite;
var building_tiles;

window.onload = function() {
    let menu = document.getElementById('menu');
    let opt1 = document.getElementById('opt1');
    let opt2 = document.getElementById('opt2');
    let btnNew = document.getElementById('btn-new');
    let btnJoin = document.getElementById('btn-join');
    let btnBack = document.getElementById('btn-back');
    let btnStart = document.getElementById('btn-start');
    let input = document.getElementById('menu-input');

    btnNew.onclick = function() {
        socket.emit('new_room');
        socket.on('new_room_info', function(data) {
            if(!data) {
                alert('Creating a new room failed!');
            } else {
                //alert('Created a new room with code:' + data.id);
                menu.classList.add('fadeOut');
                setTimeout(function() {
                    menu.classList.add('blocked');
                    gameInit();
                    mapTown = data.map;
                    startGame();
                }, 900);
            }
        });
    };

    btnBack.onclick = function() {
        opt2.classList.add('fadeOut');
        setTimeout(function() {
            opt2.classList.add('blocked');
            opt1.classList.remove('blocked', 'fadeOut');
            opt1.classList.add('fadeIn');
        }, 900);
    };

    btnJoin.onclick = function() {
        opt1.classList.add('fadeOut');
        setTimeout(function() {
            opt1.classList.add('blocked');
            opt2.classList.remove('blocked', 'fadeOut');
            opt2.classList.add('fadeIn');
        }, 900);
    };

    btnStart.onclick = function() {
        socket.emit('join_room', input.value);
        socket.on('join_room_info', function(data) {
            if(data == 'failed') {
                alert('Could not find a room with this id!');
            }else if(data == 'full') {
                alert('This room is full!');
            } else {
                menu.classList.add('fadeOut');
                setTimeout(function() {
                    menu.classList.add('blocked');
                    gameInit();
                    mapTown = data.map;
                    startGame();
                }, 900);
            }
        });
    };
}

function gameInit() {
    canv = document.getElementById('canvas');

    canv.width = width;
    canv.height = height;

    ctx = canv.getContext('2d');
}

var players = [];

function startGame() {
    setInterval(function() {
        socket.emit('key_states', key_states);
    }, 1000 / 60);
    player1Sprite = new Image();

    player2Sprite = new Image();
    mast1Sprite = new Image();
    backgroundLayer = new Image();
    building_tiles = new Image();
    player1Sprite.src = "/public/res/player1.png";

    var blocks = new Array();

    player2Sprite.src = "/public/res/player2.png";
    mast1Sprite.src = "/public/res/mast0.png";
    backgroundLayer.src =  "/public/res/background.png";
    building_tiles.src = "public/res/building_tiles.png";
    building_tiles.onload = function () {
        ctx.drawImage(building_tiles,0,0);
        //var blocks = ["absolutely nothing",, ]; // 0 for nothing, 1 for a window, 2 for a brick
        blocks.push("absolutely nothing");
        blocks.push(ctx.getImageData(0,0,32,32));
        blocks.push(ctx.getImageData(31,0,32,32));
    }

    socket.on('update', function(data) {
        players = data;
    });

    setInterval(function() {
        ctx.drawImage(backgroundLayer,0,0);
        for (var i = 0; i < mapTown.length ; i++){
            for (var j = 0 ; j < mapTown[i].length; j++) {
                if(mapTown[i][j] == 0) continue;
                // ctx.fillStyle = blocks[mapTown[i][j]];
                ctx.putImageData(blocks[mapTown[i][j]],j*scale,i*scale);
                //ctx.drawImage(blocks[mapTown[i][j]],j*scale,i*scale);
            }
        }
        //ctx.fillStyle = 'red';
        for (var id in players) {
            let player = players[id];
            ctx.drawImage(player1Sprite,player.x, player.y);
            //drawImageRot(mast1Sprite,player.mast.first_end.x,player.mast.first_end.y,16,32,player.mast.angle);
        }
    }, 1000/60);

    canv.classList.remove('blocked');
    canv.classList.add('fadeIn');
}

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
