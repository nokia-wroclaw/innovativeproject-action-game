class Dish {
    constructor(x, y, angle, map) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.offset = 85;
        this.map = map;
        this.dir = 0.1;
    }

    // 85 <-> 120 degrees
    move() {
        this.offset += this.dir;
        if(this.offset >= 120 && this.dir == 0.1) this.dir = -0.1;
        if(this.offset <= 85 && this.dir == -0.1) this.dir = 0.1;
    }

    get info() {
        return {
            x: this.x,
            y: this.y,
            angle: this.angle,
            offset: this.offset
        };
    }
}

module.exports = {
    Dish
};