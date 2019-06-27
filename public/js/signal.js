class Ray {

    constructor(x1, y1, x2, y2, dist) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
    }

    dist(){

        return Math.sqrt(
            (this.x1 - this.x2) * (this.x1 - this.x2) +
            (this.y1 - this.y2) * (this.y1 - this.y2)
        )
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

        //this.convertMap();
        this.update();
    }

    set(x, y, angle, offset) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.offset = offset;
    }

    update() {

        // UWAGA, RADAR MOŻE BYC TYLKO W PRAWYM GÓRNYM ROGU
        this.rays.length = 0;
        for(let i = 0; i < this.angle * 2; i++) {

            let currAngle = ((this.offset + i*0.5)%361) * (Math.PI/180);

            const x3 = Math.floor(this.x);
            const y3 = Math.floor(this.y);
            const x4 = Math.floor(this.x + Math.cos(currAngle) * this.range);
            const y4 = Math.floor(this.y + Math.sin(currAngle) * this.range);

            let curr = {x: x3 - 16, y: y3 + 16};
            let b = true;
        //    alert("od nowa..");

            while (b){

          //      alert(curr.x);
              //     alert(curr.y);

                let dirs = [-1, 0, 0, 1];
                for (let i = 0; i < 4 && b; i += 2) {

                    let new_point = {x: curr.x + dirs[i] * 32, y: curr.y + dirs[i + 1] * 32};
                    let mid_point = {x: curr.x + dirs[i] * 16, y: curr.y + dirs[i + 1] * 16};
                    let x1, x2, y1, y2;

                    if (!dirs[i + 1]) {
                   //     alert("zrobilem ifa");
                        y1 = mid_point.y - 16;
                        y2 = mid_point.y + 16;
                        x1 = mid_point.x;
                        x2 = mid_point.x;
                    }
                    else {
                        y1 = mid_point.y;
                        y2 = mid_point.y;
                        x1 = mid_point.x - 16;
                        x2 = mid_point.x + 16;
                    }
/*/
                    alert("superalert");
                    alert(x1); alert(y1);
                    alert(x2); alert(y2);
                    alert(x3); alert(y3);
                    alert(x4); alert(y4);
  /*/
                    let den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
                    if (den != 0) {
                        let t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
                        let u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;
                        if (t > 0 && t < 1 && u > 0) {
                            let new_x = x1 + t * (x2 - x1);
                            let new_y = y1 + t * (y2 - y1);

                            if (this.map[Math.floor(new_point.y / 32)][Math.floor(new_point.x / 32)] == 0 ||
                                this.map[Math.floor(new_point.y / 32)][Math.floor(new_point.x / 32)] >= 4){
                                curr = new_point;
                            }
                            else{
                                curr.x = Math.floor(new_x);
                                curr.y = Math.floor(new_y);
                                b = false;
                            }
                        }
                    }
                    else{
                        // alert("wtedy jest lipa");
                        b = true;
                    }
                }
            }

            if (b){
                curr.x = x4;
                curr.y = y4;
            }
            alert(curr.x); alert(curr.y);
            this.rays.push(new Ray(this.x, this.y, curr.x, curr.y));

        }
     //   alert("skonczylem");
    }


}