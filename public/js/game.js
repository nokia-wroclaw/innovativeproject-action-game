var socket = io();

// W, S, A, D
var key_states = {
    up:    false,
    down:  false,
    left:  false,
    right: false,
    space: false,
    shift: false
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
            key_states.space = false;
            break;
        case 16:
            key_states.shift = false;
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
        case 32:
            key_states.space = true;
            break;
        case 16:
            key_states.shift = true;
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
var phoneSprite;
var buildingTiles;
var buildingTilesLeft;
var buildingTilesRight;
var platformTile;
var leftPlatformTile;
var rightPlatformTile;

var players = [];
var dish;
var frame = 0;
var animation = 0;
var assets = 0;

var blocks = new Array();

var downloadProgress = new ProgressBar(0, 100, 50, 5);

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
                dish = new Signal(0,0,0,0, mapTown, scale);
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
                dish = new Signal(0,0,0,0, mapTown, scale);

                document.getElementById('code').innerText = "Code: " + data.id;
                popup.classList.remove('blocked', 'fadeOut');
                popup.classList.add('fadeIn');

                startGame();
            }, 900);
        }
    });

    socket.on('win', function() {
        alert("You win!");
        location.reload();
    });

    socket.on('lose', function() {
        alert("You lose!");
        location.reload();
    });
}

function gameInit() {
    canv = document.getElementById('canvas');

    canv.width = width;
    canv.height = height;

    ctx = canv.getContext('2d');
}

function assetsInc() {
    console.log("XD");
    assets++;
    if(assets >= 6) {
        // 0 -> null
        // 1 -> platforma
        // 2, 3 -> lewa i prawa platforma
        // 4 - 9 -> lewa sciana
        // 10 - 15 -> prawa sciana
        // 16 - 21 -> sciany
        blocks.push("absolutely nothing");
        //init building tiles
        loadBlock(platformTile);
        loadBlock(leftPlatformTile);
        loadBlock(rightPlatformTile);
        loadBlock(buildingTilesLeft);
        loadBlock(buildingTilesRight);
        loadBlock(buildingTiles);
        console.log("Loaded");
    }
}

function loadBlock(img) {
    ctx.drawImage(img, 0, 0);
    for(let i = 0 ; i < img.width ; i += 32){
        for(let j = 0 ; j < img.height; j += 32 ){
            blocks.push(ctx.getImageData(j,i,32,32));
        }
    }
}

function startGame() {
    setInterval(function() {
        socket.emit('key_states', key_states);
    }, 1000 / 60);

    backgroundLayer = new Image();
    backgroundLayer.src =  "/public/res/background.png";
    
    buildingTiles = new Image();
    buildingTilesLeft = new Image();
    buildingTilesRight = new Image();
    platformTile = new Image();
    leftPlatformTile = new Image();
    rightPlatformTile = new Image();

    buildingTiles.onload = assetsInc;
    buildingTilesLeft.onload = assetsInc;
    buildingTilesRight.onload = assetsInc;
    buildingTilesRight.onload = assetsInc;
    platformTile.onload = assetsInc;
    leftPlatformTile.onload = assetsInc;
    rightPlatformTile.onload = assetsInc;

    buildingTiles.src = "public/res/bsan.png";
    buildingTilesLeft.src = "public/res/nlsa.png";
    buildingTilesRight.src = "public/res/nrsa.png";
    platformTile.src = "public/res/pn.jpg";
    leftPlatformTile.src = "public/res/pln.png";
    rightPlatformTile.src = "public/res/prno.png";

    socket.on('update', function(data) {
        players = data.players;
        dish.set(data.dish.x, data.dish.y, data.dish.angle, data.dish.offset);
    });

    playerSprite = new Image();
    playerSprite.src = '/public/res/player.png';

    dishSprite = new Image();
    dishSprite.src = '/public/res/dish.png';

    phoneSprite = new Image();
    phoneSprite.src = '/public/res/phone.png';

    setInterval(function() {


// Do your operations


        console.log("siemka");
        if(assets < 6) return;
        dish.update();
        frame++;
        frame %= 32;
        animation = Math.floor(frame/4);

        let me = players[0];
        const camCap = canv.height*0.56; 
        const edge = mapTown.length*scale-canv.height;
        let yOffset =  (edge + camCap < me.y) ? edge : me.y - camCap;

        //TODO: make backgroundLayer move with camera, but slower
        ctx.drawImage(backgroundLayer,0, 0);

        var startDate = new Date();
        let from = Math.max(Math.floor(me.y / 32) - 11, 0);
        let to = Math.min(mapTown.length, Math.floor(me.y / 32) + 11);

        for (let i = from; i < to ; i++){
            for (let j = 0 ; j < mapTown[i].length; j++) {
                if(mapTown[i][j] == 0) continue;
                try {
                    ctx.putImageData(blocks[mapTown[i][j]], j * scale, (i * scale) - yOffset);
                }
                catch(err){
                    console.log(mapTown[i][j] + " doesnt exists!")
                }
            }
        }

        var endDate   = new Date();
        var seconds = (endDate.getTime() - startDate.getTime()) / 1000;
        console.log(seconds);
        // SIGNAL DISH
        ctx.drawImage(dishSprite, dish.x - 5, dish.y - yOffset - 29);
        ctx.strokeStyle = "#AAAA3344";

        // dish.rays.forEach(ray => {
        //     ctx.beginPath();
        //     ctx.moveTo(ray.x1, ray.y1 - yOffset);
        //     ctx.lineTo(ray.x2, ray.y2 - yOffset);
        //     ctx.stroke();
        // });
        // -----------

        for (let id in players) {
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
            if(player.phone) {
                ctx.drawImage(phoneSprite, player.x + (player.face ? 21 : - 5), player.y - 16 - yOffset);
                downloadProgress.setValue(player.progress);
                downloadProgress.draw(ctx, player.x - 8, player.y - 35 - yOffset, "#44FF44");
            }
        }

        if(players[0].cooldown) {
            ctx.fillStyle = "#4444FF";
            ctx.fillRect(15, 15, 15, 15);
        }

    }, 1000/60);

    canv.classList.remove('blocked');
    canv.classList.add('fadeIn');

}
