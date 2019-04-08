

class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(force) {
        this.x += force.x;
        this.y += force.y;
    }

    mult(scale) {
        this.x *= scale;
        this.y *= scale;
    }

    clear() {
        this.x = 0;
        this.y = 0;
    }
}

class PhysicsObject {
    constructor(x, y) {
        this.pos = new Vector(x, y);
        this.vel = new Vector(0, 0);
        this.acc = new Vector(0, 0);
    }

    applyForce(force) {
        this.acc.add(force);
    }

    update() {
        this.vel.add(this.acc);
        this.acc.clear();
        this.pos.add(this.vel);
        if(this.pos.y > 480-32-16){
            this.pos.y = 480-32-16;
            this.vel.y = 0;
        }
    }
}

module.exports = {
    vector: Vector,
    physicsObject: PhysicsObject
};