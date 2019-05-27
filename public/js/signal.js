class Ray {
    constructor(x1, y1, x2, y2, dist) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.dist = dist;
    }
}

class Signal {
    constructor(x, y, angle, offset, map, scale) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.offset = offset;
        this.map = map;
        this.scale = scale;
        this.range = 1000;

        this.rays = [];

        this.convertMap();
        this.update();
    }

    set(x, y, angle, offset) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.offset = offset;
    }

    update() {
        this.rays.length = 0;
        for(let i = 0; i < this.angle * 2; i++) {
            let currAngle = ((this.offset + i*0.5)%361) * (Math.PI/180);

            const x3 = this.x;
            const y3 = this.y;
            const x4 = this.x + Math.cos(currAngle) * this.range;
            const y4 = this.y + Math.sin(currAngle) * this.range;

            let ray = { x: x4, y: y4, dist: this.range };

            this.map.forEach(wall => {
                const x1 = wall.x1;
                const y1 = wall.y1;
                const x2 = wall.x2;
                const y2 = wall.y2;

                const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
                if(den != 0) {
                    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
                    const u = - ((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;

                    if(t > 0 && t < 1 && u > 0) {
                        const new_x = x1 + t * (x2 - x1);
                        const new_y = y1 + t * (y2 - y1);

                        const dist = Math.sqrt((this.x - new_x) * (this.x - new_x) + (this.y - new_y) * (this.y - new_y));
                        if(ray.dist > dist) {
                            ray.x = new_x;
                            ray.y = new_y;
                            ray.dist = dist;
                        }
                    }
                }
            });

            this.rays.push(new Ray(this.x, this.y, ray.x, ray.y, ray.dist));
        }
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