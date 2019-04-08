var engine = require('./physics.js');

module.exports = class Player {
    constructor(id, x, y, speed = 3) {
        this.id = id;
        this.speed = speed;
        this.face = 0;

        this.physicsObj = new engine.physicsObject(x, y);
        this.gravityForce = new engine.vector(0, 0.3);
        this.jumpForce = new engine.vector(0, -10);

        this.key_states = {
            up:    false,
            down:  false,
            left:  false,
            right: false
        }
    }

    update() {
        this.physicsObj.applyForce(this.gravityForce);
        this.physicsObj.update();

         // TYMCZASOWO

        if (this.key_states.up) {
            if(this.physicsObj.pos.y >= 32*14)
                this.physicsObj.applyForce(this.jumpForce);
        }
        if (this.key_states.left) {
            this.face = 0;
            this.physicsObj.pos.x -= this.speed;
        }
        if (this.key_states.right) {
            this.face = 1;
            this.physicsObj.pos.x += this.speed;
        }
    }

    get info() {
        return {
            x: this.physicsObj.pos.x,
            y: this.physicsObj.pos.y
        };
    }
}
