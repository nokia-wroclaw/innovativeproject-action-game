var scale = 32;

class Dish {
    constructor(x, y, angle, map) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.offset = 85;
        this.map = map;
        this.dir = 0.1;

        this.convertMap();
    }

    // 85 <-> 120 degrees
    move() {
        this.offset += this.dir;
        if(this.offset >= 120 && this.dir == 0.1) this.dir = -0.1;
        if(this.offset <= 85 && this.dir == -0.1) this.dir = 0.1;
    }

    // TODO: check if player is in signal range
    download(px, py, pw, ph) {
        return true;
    }

    get info() {
        return {
            x: this.x,
            y: this.y,
            angle: this.angle,
            offset: this.offset
        };
    }

    convertMap() {
        let map = this.map;
        this.map = [];
        for (var y = 0; y < map.length ; y++){
            for (var x = 0 ; x < map[y].length; x++) {
                if(map[y][x] == 0) continue;
                this.map.push({ x1: x * scale, y1: y * scale, x2: (x + 1) * scale, y2: y * scale });
                this.map.push({ x1: x * scale, y1: (y + 1) * scale, x2: (x + 1) * scale, y2: (y + 1) * scale });
                this.map.push({ x1: x * scale, y1: y * scale, x2: x * scale, y2: (y + 1) * scale });
                this.map.push({ x1: (x + 1) * scale, y1: y * scale, x2: (x + 1) * scale, y2: (y + 1) * scale });
            }
        }
    }
}

module.exports = {
    Dish
};