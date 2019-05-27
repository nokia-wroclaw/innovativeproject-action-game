var bounceEpsillon = 0.1;

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
    constructor(x, y, reflectForce = 0) {
        this.pos = new Vector(x, y);
        this.vel = new Vector(0, 0);
        this.acc = new Vector(0, 0);

        this.ref = reflectForce;
    }

    applyForce(force) {
        this.acc.add(force);
    }

    bounce(scale) {
        let force = this.vel.y * (-1) * scale;
        if(Math.abs(force) > bounceEpsillon)
            this.vel.y = this.vel.y * (-1) * scale;
        else this.vel.y = 0;
    }

    update() {
        this.vel.add(this.acc);
        this.acc.clear();
        this.pos.add(this.vel);
        this.vel.x *= (Math.abs(this.vel.x) < 0.01) ? 0 : 0.9;
    }
}

module.exports = {
    Vector,
    PhysicsObject
};
