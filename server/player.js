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
        this.mast = new Mast(id,x,y);
        this.holding_mast = true;
        this.inAir = true;
        this.cooldown = false;

        this.physicsObj = new engine.PhysicsObject(x, y);
        this.jumpForce = new engine.Vector(0, -5);

        this.key_states = {
            up:    false,
            down:  false,
            left:  false,
            right: false,
            space: false
        }
    }
    //@TODO make some time limit so players cannot pick up masts instantly after their drop it. Weird exploit.
    pickUpMast(){
        if(this.holding_mast) return;
        if (this.closeEnough()) {
            this.holding_mast = true;
            this.mast.angle = 0.0;
        }
    }

    resetBat() {
        this.useBat = false;
    }

    closeEnough(){
        return ((Math.abs(this.physicsObj.pos.x - this.mast.first_end.x) < 32)
                &&
               (Math.abs(this.physicsObj.pos.y - this.mast.first_end.y) < 32));
    }
    mastActive(){ // mast is active if it isn't parallel to the ground level
        return this.mast.angle > -87 && this.mast.angle < 87; // -90 and 90 means mast is parallel to the ground level
    }



    update() {
        this.physicsObj.update();
         // TYMCZASOWO

        if(this.physicsObj.pos.x < 0){
            this.physicsObj.pos.x += 5;
            this.physicsObj.vel.x *= -1;
        }
        else
        if(this.physicsObj.pos.x > 608){
            this.physicsObj.pos.x -= 5;
            this.physicsObj.vel.x *= -1;

        }

        if(this.key_states.space && !this.cooldown){
            //this.pickUpMast(); //checks for mast update and picks it up if possible
            this.cooldown = true;
            this.useBat = true;
        }
        if (this.key_states.up) {
            if(!this.inAir) {
                this.physicsObj.applyForce(this.jumpForce);
                if(this.holding_mast)
                     this.mast.physicsObj.applyForce(this.jumpForce); //use force on mast as well. @TODO check if player is holding the mast
            }
        }
        if (this.key_states.left) {
            this.face = 0;
            if (this.physicsObj.pos.x > 0) {
                this.physicsObj.pos.x -= this.speed;
                this.mast.physicsObj.pos.x -= this.speed;
                this.mast.angle += this.speed * ((this.mast.angle + 90.0)/4) * 0.03; //while walking left increase the angle. 0.004 is a fixed value to slow the process down
            }
        }
        if (this.key_states.right) {
            this.face = 1; // to animate
            if(this.physicsObj.pos.x  < 608)  // 608 to static field (MAP_WIDTH)
            {this.physicsObj.pos.x += this.speed;
                this.mast.physicsObj.pos.x += this.speed;
                this.mast.angle -= this.speed * ((90.0 - this.mast.angle)/4) * 0.03; //while walking right decrease the angle
            }
        }

        this.holding_mast = this.mastActive();
        this.mast.update(this.holding_mast); //update mast here
    }

    get info() {
        return {
            x: this.physicsObj.pos.x,
            y: this.physicsObj.pos.y,
            moving: (this.key_states.left ^ this.key_states.right),
            face: this.face,
            mast: this.mast,
            useBat: this.useBat
        };
    }
}

module.exports = Player;
