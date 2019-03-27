module.exports = class Player {
    constructor(id, x, y, speed = 3) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.speed = speed;

        this.key_states = {
            up:    false,
            down:  false,
            left:  false,
            right: false
        }
    }

    move() {
        if (this.key_states.up)
            this.y -= this.speed;
        if (this.key_states.down)
            this.y += this.speed;
        if (this.key_states.left)
            this.x -= this.speed;
        if (this.key_states.right)
            this.x += this.speed;
    }

    get info() {
        return {
            x: this.x,
            y: this.y
        };
    }
}
