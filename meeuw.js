function Meeuw() {
    this.pos = width;
    this.hoogte = getRandomInt(10, 120);
    this.dead = false;
    this.rot = 0;
    this.rotState = true;

    this.update = function() {
        this.pos -= 2;

        if(this.rotState) {
            this.rot += 3;
        } else {
            this.rot -= 3;
        }

        if(this.rot < -10 || this.rot > 50) {
            this.rotState = !this.rotState;
        }
    }
}
