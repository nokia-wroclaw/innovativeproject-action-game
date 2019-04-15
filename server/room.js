var engine = require('./physics.js');
var scale = 32;
var block = [null, new engine.PhysicsObject(-1, -1, 0), new engine.PhysicsObject(-1, -1, 0.6)];

class Room {
    constructor(slots, code) {
        // TODO: slots validation
        this.slots = slots;
        this.code = code;
        this.players = [];
        this.map = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]];
    
        this.gravityForce = new engine.Vector(0, 0.3);
    }

    get info() {
        return {
            id: this.code,
            map: this.map
        };
    }

    updateLevel() {
        let room = this;
        this.players.forEach(function(player) {
            let x_l = Math.floor(player.physicsObj.pos.x / scale) % 19;
            let x_r = Math.floor((player.physicsObj.pos.x + scale - 1) / scale) % 19;
            let y = Math.floor((player.physicsObj.pos.y + 1) / scale + 1) % 15;

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
    }

    update(player_id, data) {
        if(!this.findPlayer(player_id)) return;
        this.findPlayer(player_id).key_states = data;
    }

    findPlayer(player_id) {
        return this.players.find(player => player.id == player_id);
    }
}

module.exports = Room;
