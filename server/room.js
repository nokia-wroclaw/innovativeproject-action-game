var engine = require('./physics.js');
var dish = require('./dish.js');
var scale = 32;
var block = [null, new engine.PhysicsObject(-1, -1, 0), new engine.PhysicsObject(-1, -1, 0.3)];

class Room {
    constructor(slots, code) {
        // TODO: slots validation
        this.slots = slots;
        this.thread;
        this.code = code;
        this.started = false;
        this.players = [];
        this.map = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]];

        this.dish = new dish.Dish((this.map[0].length-2)*scale, 160, 45, this.map);
        this.gravityForce = new engine.Vector(0, 0.3);
    }

    get info() {
        return {
            id: this.code,
            map: this.map
        };
    }

    updateLevel() {
        const room = this;
        this.players.forEach(function(player) {
            let x_l = Math.floor(player.physicsObj.pos.x / scale) % room.map[0].length;
            let x_r = Math.floor((player.physicsObj.pos.x + scale - 1) / scale) % room.map[0].length;
            let y = Math.floor((player.physicsObj.pos.y + 1) / scale + 1) % room.map.length;

            x_l = (x_l < 0) ? 0 : x_l;
            x_r = (x_r < 0) ? 0 : x_r;
            y = (y < 0) ? 0 : y;

            if(room.map[y][x_l] == 0 && room.map[y][x_r] == 0) {
                player.physicsObj.applyForce(room.gravityForce);
                player.inAir = true;
            } else {
                player.physicsObj.pos.y = (y - 1) * scale;
                if(block[room.map[y][x_l]])
                    player.physicsObj.bounce(block[room.map[y][x_l]].ref);
                else
                    player.physicsObj.bounce(block[room.map[y][x_r]].ref);
                
                player.inAir = false;
            }
            
            room.dish.move();
            player.update();
        });
    }

    join(player) {
        this.players.push(player);
        console.log("Player [" + player.id + "] has joined room '" + this.code + "'");
    }

    disconnect(player_id) {
        if(!this.findPlayer(player_id)) return;
        this.players = this.players.filter(player => player.id != player_id);
        if(this.players.length == 0) return 1;
    }

    update(player_id, data) {
        if(!this.findPlayer(player_id) || !this.started) return;
        this.findPlayer(player_id).key_states = data;
    }

    findPlayer(player_id) {
        return this.players.find(player => player.id == player_id);
    }
}

module.exports = Room;
