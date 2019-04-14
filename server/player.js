var engine = require('./physics.js');
var Mast = require('./Mast');

module.exports = class Player {
    constructor(id, x, y, speed = 3) {
        this.id = id;
        this.speed = speed;
        this.face = 0;
        this.mast = new Mast(id,x,y);
        this.physicsObj = new engine.physicsObject(x, y);
        this.gravityForce = new engine.vector(0, 0.4);
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
            if(this.physicsObj.pos.y >= 480-32-16) {
                this.physicsObj.applyForce(this.jumpForce);
                this.mast.physicsObj.applyForce(this.jumpForce); //use force on mast as well. @TODO check if player is holding the mast
            }
        }
        if (this.key_states.left) {
            this.face = 0;
            if (this.physicsObj.pos.x > 16) {
                this.physicsObj.pos.x -= this.speed;
                this.mast.physicsObj.pos.x -= this.speed;
                this.mast.angle += this.speed * (this.mast.angle + 90.0) * 0.004; //while walking left increase the angle. 0.004 is a fixed value to slow the process down
            }
        }
        if (this.key_states.right) {
            this.face = 1; // to animate
            if(this.physicsObj.pos.x  < 624)
            {this.physicsObj.pos.x += this.speed;
                this.mast.physicsObj.pos.x += this.speed;
                this.mast.angle -= this.speed * (90.0 - this.mast.angle) * 0.004; //while walking right decrease the angle
            }
        }
        this.mast.update(); //update mast here
       }

    get info() {
        return {
            x: this.physicsObj.pos.x,
            y: this.physicsObj.pos.y,
            mast: this.mast
        };
    }
}
