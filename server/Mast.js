var engine = require('./physics.js');

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    get info(){
        return {
            x: this.physicsObj.pos.x,
            y: this.physicsObj.pos.y
        };
    }
}


module.exports = class Mast {
    constructor(id, x, y) {
        this.id = id;
        this.physicsObj = new engine.physicsObject(x - this.length, y - this.length);
        this.gravityForce = new engine.vector(0, 0.4);
        this.jumpForce = new engine.vector(0, -10);
        this.length = 16;
        this.physicsObj = new engine.physicsObject(x - this.length, y - this.length);
        this.first_end = new Point(x - this.length,y - this.length);
        this.angle = 0.0;
        this.key_states = {
            up:    false,
            down:  false,
            left:  false,
            right: false
        }
        }



        update(isHeld) {
            //console.log(this.first_end.x+" "+this.first_end.y);

            //@TODO limit mast not to fall beneath player's shoulder
            this.physicsObj.applyForce(this.gravityForce);
            this.physicsObj.update();
            this.first_end.y = this.physicsObj.pos.y;  // gravity is independent from player's movement
            if(isHeld) {
                this.first_end.x = this.physicsObj.pos.x;
                       }
            if(this.angle == 0) return;

            if(this.angle < 0) {
                this.angle += 0.033*(this.angle);
                this.angle = Math.max(-90,this.angle)  //pull mast towards floor
            }
            if(this.angle > 0){
                this.angle += 0.033*(this.angle); // power of pull. The bigger the angle, the stronger is the pulling
                this.angle = Math.min(90,this.angle) // pull mast towards floot
            }
           // console.log(this.angle+"\n"); //debug
                }

        get info() {
            return {
                x: this.first_end.x,
                y: this.first_end.y,
                angle: this.angle
            };

        }

    }
