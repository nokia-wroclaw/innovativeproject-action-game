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
var playerSprite;
var dishSprite;
var buildingTiles;

var players = [];
var dish;
var frame = 0;
var animation = 0;

window.onload = function() {
    let menu = document.getElementById('menu');
    let opt1 = document.getElementById('opt1');
    let opt2 = document.getElementById('opt2');
    let btnNew = document.getElementById('btn-new');
    let btnJoin = document.getElementById('btn-join');
    let btnBack = document.getElementById('btn-back');
    let btnStart = document.getElementById('btn-start');
    let input = document.getElementById('menu-input');
    let popup = document.getElementById('popup');

    btnNew.onclick = function() {
        socket.emit('new_room');
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
    };

    socket.on('started', function() {
        popup.classList.add('fadeOut');
        setTimeout(function() {
            popup.classList.add('blocked');
        }, 900);
    });

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

    socket.on('new_room_info', function(data) {
        if(!data) {
            alert('Creating a new room failed!');
        } else {
            menu.classList.add('fadeOut');
            setTimeout(function() {
                menu.classList.add('blocked');
                gameInit();
                mapTown = data.map;

                document.getElementById('code').innerText = "Code: " + data.id;
                popup.classList.remove('blocked', 'fadeOut');
                popup.classList.add('fadeIn');

                startGame();
            }, 900);
        }
    });
}

function gameInit() {
    canv = document.getElementById('canvas');

    canv.width = width;
    canv.height = height;

    ctx = canv.getContext('2d');
}

function startGame() {
    setInterval(function() {
        socket.emit('key_states', key_states);
    }, 1000 / 60);

    var blocks = new Array();

    backgroundLayer = new Image();
    backgroundLayer.src =  "/public/res/background.png";
    
    buildingTiles = new Image();
    buildingTiles.src = "public/res/building_tiles.png";

    buildingTiles.onload = function () {
        ctx.drawImage(buildingTiles,0,0);
        //var blocks = ["absolutely nothing",, ]; // 0 for nothing, 1 for a window, 2 for a brick
        blocks.push("absolutely nothing");
        blocks.push(ctx.getImageData(0,0,32,32));
        blocks.push(ctx.getImageData(32,0,32,32));
    }

    socket.on('update', function(data) {
        players = data.players;
        dish = new Signal(data.dish.x, data.dish.y, data.dish.angle, data.dish.offset, mapTown, scale);
    });

    playerSprite = new Image();
    playerSprite.src = '/public/res/player.png';

    dishSprite = new Image();
    dishSprite.src = '/public/res/dish.png';

    setInterval(function() {
        frame++;
        frame %= 32;
        animation = Math.floor(frame/4);

        let me = players[0];
        const camCap = canv.height*0.56; 
        const edge = mapTown.length*scale-canv.height;
        let yOffset =  (edge + camCap < me.y) ? edge : me.y - camCap;

        //TODO: make backgroundLayer move with camera, but slower
        ctx.drawImage(backgroundLayer,0, 0);
        for (var i = 0; i < mapTown.length ; i++){
            for (var j = 0 ; j < mapTown[i].length; j++) {
                if(mapTown[i][j] == 0) continue;
                ctx.putImageData(blocks[mapTown[i][j]], j * scale, (i * scale) - yOffset);
            }
        }

        // SIGNAL DISH
        ctx.drawImage(dishSprite, dish.x - 5, dish.y - yOffset - 29);
        ctx.strokeStyle = "#AAAA3344";

        dish.rays.forEach(ray => {
            ctx.beginPath();
            ctx.moveTo(ray.x1, ray.y1 - yOffset);
            ctx.lineTo(ray.x2, ray.y2 - yOffset);
            ctx.stroke();
        });
        // -----------

        for (var id in players) {
            let player = players[id];
            ctx.drawImage(
                playerSprite,
                64 * (player.moving * animation),
                64 * (!player.face) * 2,
                64,
                64,
                player.x - 16,
                player.y - 29 - yOffset,
                64,
                64);
        }
    }, 1000/60);

    canv.classList.remove('blocked');
    canv.classList.add('fadeIn');
}
