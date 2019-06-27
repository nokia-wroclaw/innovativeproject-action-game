var engine = require('./physics.js');
var dish = require('./dish.js');
var scale = 32;
var block = [null, new engine.PhysicsObject(-1, -1, 0), new engine.PhysicsObject(-1, -1, 0.3)];

function rnd(beg, end){
    if (end <= beg){
        return beg;
    }
    return beg + Math.floor(Math.random() * (end - beg + 1));
}

class Room {
    constructor(slots, code) {
        // TODO: slots validation
        this.downloadSpeed = 0.05;
        this.slots = slots;
        this.thread;
        this.code = code;
        this.started = false;
        this.players = [];
        this.map = this.generate_map(
            100,
            20,
            5,
            5,
            6
        );
        this.dish = new dish.Dish((this.map[0].length-2)*scale, 32, 45, this.map);
        this.gravityForce = new engine.Vector(0, 0.3);
    }

    rand_block(){

        let seed    = rnd(1, 100);
        let chances = [0, 300, 30, 30, 10, 0, 0, 0, 0, 0];

        for (let i = 1; i < chances.length; i ++){
            chances[i] += chances[i - 1];
            if (chances[i] >= seed)
                return i;
        }
    }

    draw_path(A,  total_height, total_width, px, py){

        for (let i = 0; i < total_width; i ++)
            A[0][i] = 1;
        let I = [];
        let cur = [0, rnd(0, total_width - 1)];
        let prev = cur;
        let maks = [0, 0];
        while (cur[0] < total_height - 2){

            let vec   = [2, 0, 0, 2, -2, 0, 0, -2];
            let neibs = [];

            for (let i = 0; i < 8; i += 2){
                let x = vec[i + 0] + cur[0];
                let y = vec[i + 1] + cur[1];

                if (x >= total_height  || x < 0)
                    continue;
                if (y >= total_width  || y < 0)
                    continue;
                if (A[x][y] == 1)
                    continue;
                if (vec[i] < 0 && (y == 0 || y == total_width - 1))
                    continue;

                //  if (x > 0)
                for (let j = 0; j < (cur[0] == x || cur[1] < y) + 1; j ++)
                    neibs.push([x, y]);

            }
            let cand ;
            if (neibs.length == 0){
                cur = maks;
                cand = [maks[0] + 2, maks[1]];
            }
            else cand = neibs[rnd(0, neibs.length - 1)];
            if (cur[0] > maks[0]) maks = cur;
            A[cur[0]][cur[1]] = 1;
            A[(cur[0] + cand[0]) / 2][(cur[1] + cand[1]) / 2] = 1;
            cur = cand;
            if (px < Math.abs(prev[0] - cur[0]) || py < Math.abs(prev[1] - cur[1])){
                I.push(cur);
                prev = cur;
            }
        }
        for (let i = 0; i < total_height; i ++)
            for (let j = 0; j < total_width; j ++)
                A[i][j] = 0;

        for (let i = 0; i < I.length; i ++)
            A[I[i][0]][I[i][1]] = 101;


        return A;
    }

    is_wall(z){
        let walls = [0, 6, 7, 8];
        for (let i = 0; i < walls.length; i ++)
            if (walls[i] == z)
                return true;
        return false;
    }

    only_ones(A){

        for (let i = 0; i < A.length; i ++)
            for (let j = 0; j < A[i].length; j ++)
                A[i][j] = (A[i][j] == 1 ? 1 : 0);
        return A;
    }

    generate_map(total_height, total_width, px, py, size_of_platform){
        let matrix = [];
        for (let i = 0;  i < total_height; i ++){
            let cand = [];
            for (let j = 0; j < total_width; j ++)
                cand.push(0);
            matrix.push(cand);
        }
        matrix = this.draw_path(matrix, total_height, total_width, px, py);

        for (let i = 0; i < total_height; i ++)
            for (let j = 0; j < total_width; j ++)
                if (matrix[i][j] == 101){
                    let for_left  = rnd(1, size_of_platform / 2);
                    let for_right = rnd(1, size_of_platform / 2);
                    let T = this.rand_block();
                    for (let o = j - for_left; o <= j + for_right; o ++){
                        if (o < 0 || o >= total_width) continue;
                        matrix[i][o] = T;
                    }
                }

        for (let i = 0; i < total_width; i ++)
            matrix[0][i] = 1;
        matrix.reverse();
        for (let j = 0; j < total_width; j ++){
            let what = 0; // 0 - nothing, 6 - left, 7 - right, 8 - middle
            for (let i = 0; i < total_height; i ++){
                if (matrix[i][j] == 1){
                    if (j == 0 || this.is_wall(matrix[i][j - 1]))
                        what = 6;
                    else if (j == total_width - 1 || this.is_wall( matrix[i][j + 1]))
                        what = 7;
                    else what = 8;
                }
                else matrix[i][j] = what;
            }
        }


        //matrix = this.only_ones(matrix);
        // for (let i = 0; i < total_height; i ++){
        //     console.log(matrix[i]);
        // }
        return matrix;
    }
    /*/
    generate_map2(total_height, total_width, max_x_move, max_y_move){
        var res = [];
        for (var i = 0; i < total_height; i ++){
            var cand = [];
            for (var j = 0; j < total_width; j ++)
                cand.push(0);
            res.push(cand);
        }
        var beg = rnd(0, 10);
        var end = rnd(beg + 3, beg + 7);
        for (var i = 0; i < total_height; i += rnd(2, max_y_move)){
            if (i == 0){
                for (var j = 0; j < total_width; j ++){
                    res[i][j]  = 1;
                }
                continue;
            }
            var block_type = this.rand_block();
            for (var j = beg; j <= end; j ++){
                res[i][j] = block_type;
            }
            var size_of_platform = rnd(3, 7);
            beg = Math.max(0,               beg - max_x_move);
            end = Math.min(total_width - 1, end + max_x_move);
            beg += rnd(0, (end - beg + 1) - size_of_platform);
            end -= (end - beg + 1) - size_of_platform;
        }
        res.reverse();
        for (var i = 0; i < total_height; i ++){
            console.log(res[i]);
        }
        return res;
    }
    /*/

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
                player.physicsObj.bounce(0);
                
                player.inAir = false;
            }

            if(player.phone && player.progress < 100) {
                if(room.dish.download(player.x-16, player.y-29, player.width, player.height)) {
                    player.progress += room.downloadSpeed;
                }
            }

            if(player.useBat){
                player.resetBat();
                setTimeout(function() {
                    player.cooldown = false;
                }, 1000);
                room.hitPlayer(player);
            }

            room.dish.move();
            player.update();
        });
    }


    // player.face = 0 for left and 1 for right
    hitPlayer(p1){
        this.players.forEach( p2 => {
            if(p1.id != p2.id){
                if(Math.abs(p1.physicsObj.pos.y - p2.physicsObj.pos.y) > p2.height / 2) return;
                const force = p1.physicsObj.pos.x - p2.physicsObj.pos.x;

                const p1_sign = Math.sign(2*p1.face - 1);
                //const p2_sign = Math.sign(2*p2.face - 1);

                if(p1_sign == Math.sign(force)) return;

                if (Math.abs(force) > 40) return;
                p2.physicsObj.applyForce(new engine.Vector(-force * 0.4, -Math.abs(force) * 0.4));

                if(p2.phone) {
                    p2.resetPhone();
                    p2.cooldown = true;
                    setTimeout(function() {
                        p2.cooldown = false;
                    }, 1000);
                }
            }
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
