function Knight() {
    this.pos = width + 50;
    this.speedMod = 1 + getRandomInt(-20, 80) / 100;
    this.legProgress = 0;
    this.legState = true;
    this.alive = true;
    this.deathPos = 0;
    this.deathFade = 2;
    this.knightType = getRandomInt(1, 5);
    this.deathVel;

    if(isFkn) {
        this.knightType = getRandomInt(3, 5);
    } else {
        this.knightType = getRandomInt(1, 4);
    }

    this.update = function() {
        this.pos -= 2 * this.speedMod;

        if(this.legState) {
            // this.legProgress += 2;
        } else {
            // this.legProgress -= 2;
        }

        if(this.legProgress > 20 || this.legProgress < -20) {
            this.legState = !this.legState;
        }
    }

    this.dead = function() {
        this.deathVel += 0.2;
        this.deathFade -= 0.04;

        if(this.deathFade < 0) {
            this.deathFade = 0;
        }

        this.deathPos += this.deathVel;
    }
}
