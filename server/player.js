var engine = require('./physics.js');
var Mast = require('./mast.js');

class Player {
    constructor(id, x, y, speed = 3.0) {
        this.height = 64;
        this.width = 32;
        this.id = id;
        this.speed = speed;
        this.face = 0;
        this.useBat = false;
        this.progress = 0;
        this.phone = false;
        this.inAir = true;
        this.cooldown = false;

        this.physicsObj = new engine.PhysicsObject(x, y);
        this.jumpForce = new engine.Vector(0, -5);

        this.key_states = {
            up:    false,
            down:  false,
            left:  false,
            right: false,
            space: false,
            shift:  false
        }
    }

    resetBat() {
        this.useBat = false;
    }

    resetPhone() {
        this.phone = false;
    }

    closeEnough(){
        return ((Math.abs(this.physicsObj.pos.x - this.mast.first_end.x) < 32)
                &&
               (Math.abs(this.physicsObj.pos.y - this.mast.first_end.y) < 32));
    }

    update() {
        this.physicsObj.update();
         // TYMCZASOWO

        if(this.physicsObj.pos.x < 0){
            this.physicsObj.pos.x += 5;
            this.physicsObj.vel.x *= -1;
        }
        else if(this.physicsObj.pos.x > 608){
            this.physicsObj.pos.x -= 5;
            this.physicsObj.vel.x *= -1;

        }

        if(this.key_states.space && !this.cooldown){
            this.cooldown = true;
            this.useBat = true;
        }

        if(this.key_states.shift && !this.cooldown && !this.phone) {
            this.cooldown = true;
            this.phone = true;
        }

        if(!this.key_states.shift && this.phone) {
            this.phone = false;

            const me = this;
            setTimeout(function() {
                me.cooldown = false;
            }, 1000);
        }

        if (this.key_states.up) {
            if(!this.inAir) {
                this.physicsObj.applyForce(this.jumpForce);
            }
        }

        if (this.key_states.left) {
            this.face = 0;
            if (this.physicsObj.pos.x > 0) {
                this.physicsObj.pos.x -= this.speed;
            }
        }

        if (this.key_states.right) {
            this.face = 1; // to animate
            if(this.physicsObj.pos.x  < 608) { // 608 to static field (MAP_WIDTH)
                this.physicsObj.pos.x += this.speed;
            }
        }
    }

    get info() {
        return {
            x: this.physicsObj.pos.x,
            y: this.physicsObj.pos.y,
            moving: (this.key_states.left ^ this.key_states.right),
            face: this.face,
            phone: this.phone,
            progress: this.progress,
            useBat: this.useBat,
            cooldown: this.cooldown
        };
    }
}

module.exports = Player;
