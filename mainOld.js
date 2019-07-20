'use strict';

// Variable initalization
var canvas = document.getElementById('cvs'),
    gfx = canvas.getContext('2d'),
    running = false,
    width = 1250,
    endFade = 0,
    height = 620,
    spawnSpeed = 1500,
    imgs = ["grond", "meeuw", "meeuw_vleugels", "egg",
    "sky", "bord", "warning", "bord_mini", "sky_cloud_1",
    "menu", "knight1", "knight2", "knight3", "knight4",
    "knight5", "leg_1", "leg_2", "sky_cloud_2", "sky_cloud_3",
    "wall", "ball", "barrel", "charge", "wheel", "warningFKN", "warningFKN2", "warningMI", "warningMI2"],
    sky_1_offset = 0,
    sky_2_offset = 0,
    meeuw = null,
    egg = [null, null],
    mouse = [null, null],
    sky_3_offset = 0,
    score = 0,
    highscore = 0,
    scoreObj = document.getElementById('score'),
    // tower_offset = getRandomInt(0, 150),
    tower_offset = getRandomInt(30, 60),
    knights = [],
    bal = null,
    charging = false,
    mayCharge = true,
    chargeLoc = [null, null],
    chargePower = 80,
    chargeState = false,
    images = {},
    ball = null,
    barrelRotation = 0,
    muteBtn = document.getElementById('btn'),
    music = new Audio('music.mp3'),
    boom1 = new Audio('boom1.mp3'),
    boom2 = new Audio('boom2.mp3'),
    boom3 = new Audio('boom3.mp3'),
    boom4 = new Audio('boom4.mp3'),
    isFkn = false,
    mute = false;

music.loop = true;
music.play();

// Define the languages
canvas.width = width;
canvas.height = height;

// Load the images
imgs.forEach(function(name) {
    images[name] = new Image();
    images[name].src = "img/" + name + ".png";
});

// Our main game loop
function tick() {
    update();
    gfx.clearRect(0, 0, width, height);
    render();

    if(running) {
        window.requestAnimationFrame(tick);
    } else {
        finish();
    }
}

function update() {
    sky_1_offset -= 0.8;
    sky_2_offset -= 0.4;
    sky_3_offset -= 0.2;

    if(sky_1_offset <= -width) {
        sky_1_offset = 0;
    }

    if(sky_2_offset <= -width) {
        sky_2_offset = 0;
    }

    if(sky_3_offset <= -width) {
        sky_3_offset = 0;
    }

    if(mouse[0]) {
        let cannon = [images.barrel.width / 2 - 31, 170 + images.barrel.height / 2 + tower_offset],
            angle = getAngle(cannon, [mouse[0], mouse[1]]);

        if(angle > 30) {
            angle = 30;
        }

        if(angle <= -65) {
            angle = -65;
        }

        barrelRotation = angle;
    }

    // Charging arrow
    if(chargeState) {
        chargePower += 0.8;
    } else {
        chargePower -= 0.8;
    }

    // Min 60% - Max 90%
    if(chargePower < 60 || chargePower > 90) {
        chargeState = !chargeState;
    }

    let x = 45 + (1035 * (chargePower / 900)) * Math.cos(barrelRotation * Math.PI / 180);
    let y = (199 + tower_offset) + (1035 * (chargePower / 900)) * Math.sin(barrelRotation * Math.PI / 180);

    chargeLoc = [x, y];

    // Cannonball
    if(ball) {
        if(ball.pos[1] > 550 || ball.pos[0] > width + 10) {
            ball = null;
            mayCharge = true;
        } else {
            // ball.rot += 3;
            // ball.time += 0.13;
            ball.time += 0.1;

            let X = ball.begin[0] + (ball.vx * ball.amp) * ball.time
            let Y = ball.begin[1] + (ball.vy * ball.amp) * ball.time + 0.5 * 9.81 * Math.pow(ball.time, 2);

            ball.pos = [X, Y];
        }
    }

    // Knights
    knights.forEach(function(knight, i) {
        if(knight.alive) {
            knight.update();
        } else {
            knight.dead();

            if(knight.deathVel > 7) {
                knights.splice(i, 1);
            }
        }

        if(knight.pos <= 50) {
            running = false;
        }

        if(ball && getDistance(ball.pos, [knight.pos, 500]) <= 56 && knight.alive) {
            knight.alive = false;
            knight.deathVel = -2.3;

            score++;
            scoreObj.innerHTML = score;
        }

        // Increase the spawn speed
        spawnSpeed -= 0.001;

        if(spawnSpeed <= 400) {
            spawnSpeed = 400;
        }
    });

    // Meeuw
    if(meeuw && !meeuw.dead) {
        meeuw.update();

        if(meeuw.pos < -100) {
            meeuw = null;
        } else {
            if(ball && !meeuw.dead && getDistance(ball.pos, [meeuw.pos, meeuw.hoogte]) < 22) {
                meeuw.dead = true;

                egg = [meeuw.pos + 22, meeuw.hoogte + 6];
            }
        }
    }

    if(egg[0]) {
        egg[1] += 4;
    }
}

function render() {
    // Sky
    gfx.drawImage(images.sky, 0, 0, width, height);

    gfx.drawImage(images.sky_cloud_1, sky_1_offset, 0, width, height);
    gfx.drawImage(images.sky_cloud_1, width + sky_1_offset, 0, width, height);

    gfx.drawImage(images.sky_cloud_2, sky_2_offset, 0, width, height);
    gfx.drawImage(images.sky_cloud_2, width + sky_2_offset, 0, width, height);

    gfx.drawImage(images.sky_cloud_3, sky_3_offset, 0, width, height);
    gfx.drawImage(images.sky_cloud_3, width + sky_3_offset, 0, width, height);

    // charge
    if(charging && chargeLoc[0]) {
        drawRotatedImage(images.charge, barrelRotation, chargeLoc[0], chargeLoc[1], (images.charge.width / 2) * (chargePower / 100), (images.charge.height / 2) * (chargePower / 100));
    }

    // Cannonball
    if(ball) {
        drawRotatedImage(images.ball, ball.rot, ball.pos[0], ball.pos[1], images.ball.width * 0.9, images.ball.height * 0.9);
    }

    // Cannon
    drawRotatedImage(images.barrel, barrelRotation, 45, 200 + tower_offset);
    gfx.drawImage(images.wheel, 25, 197 + tower_offset);

    // knights
    knights.forEach(function(knight) {
        if(!knight.alive) {
            gfx.globalAlpha = knight.deathFade;
        }
        let type = images['knight' + knight.knightType];

        gfx.drawImage(type, knight.pos, 458 + knight.deathPos);

        if(!knight.alive) {
            gfx.globalAlpha = knight.deathFade;
            // gfx.drawImage(images.warning, knight.pos + 15, 382 + knight.deathFade * 10, images.warning.width * 0.8,  images.warning.height * 0.8);
            if (!isFkn) {
                if (knight.knightType % 2 == 1) {
                    gfx.drawImage(images.warningFKN, knight.pos + 15, 382 + knight.deathFade * 10, images.warningFKN.width * 0.8,  images.warningFKN.height * 0.8);
                } else {
                    gfx.drawImage(images.warningFKN2, knight.pos + 15, 382 + knight.deathFade * 10, images.warningFKN2.width * 0.8,  images.warningFKN2.height * 0.8);
                }
            }
            if (isFkn) {
                if (knight.knightType % 2 == 0) {
                    gfx.drawImage(images.warningMI, knight.pos + 15, 382 + knight.deathFade * 10, images.warningMI.width * 0.8,  images.warningMI.height * 0.8);
                } else {
                    gfx.drawImage(images.warningMI2, knight.pos + 15, 382 + knight.deathFade * 10, images.warningMI2.width * 0.8,  images.warningMI2.height * 0.8);
                }
            }  
        }

        gfx.globalAlpha = 1;
    });

    // Tower
    gfx.drawImage(images.wall, 0, 230 + tower_offset);

    // Ground
    gfx.drawImage(images.grond, 0, 550);
    gfx.drawImage(images.grond, images.grond.width, 550);
    gfx.drawImage(images.grond, images.grond.width * 2, 550);
    gfx.drawImage(images.grond, images.grond.width * 3, 550);

    // egg
    if(egg[0]) {
        gfx.drawImage(images.egg, egg[0], egg[1]);
    }

    // Meeuw
    if(meeuw && !meeuw.dead) {
        gfx.drawImage(images.meeuw, meeuw.pos, meeuw.hoogte);
        drawRotatedImage(images.meeuw_vleugels, meeuw.rot, meeuw.pos + 39, meeuw.hoogte + 28);
    }

    // Score Boards
    gfx.drawImage(images.bord, 20, 20, images.bord.width * 0.9, images.bord.height * 0.9);

    if(highscore > 0) {
        gfx.drawImage(images.bord, 200, 20, images.bord.width * 0.9, images.bord.height * 0.9);
    }

    // Sound baord
    gfx.drawImage(images.bord_mini, width - images.bord_mini.width - 20, 20, images.bord_mini.width * 0.9, images.bord_mini.height * 0.9);
}

// Start our game
tick();

// This is called when a cannon ball gets fired
function shoot() {
    let x = 45 + 75 * Math.cos(barrelRotation * Math.PI / 180);
    let y = (199 + tower_offset) + 75 * Math.sin(barrelRotation * Math.PI / 180);
    // chargePower = 90; //for mobile

    let vx = chargePower * 2 * Math.cos(barrelRotation * Math.PI / 180);
    let vy = chargePower * 2 * Math.sin(barrelRotation * Math.PI / 180);

    let amp = Math.round((33 * (chargePower - 60) / 100) * 10) / 130;

    ball = {
        pos: [x, y],
        begin: [x, y],
        time: 0,
        rot: 0,
        vy: vy,
        vx: vx,
        amp: amp
    }

    if(!mute) {
        let sound;

        switch(getRandomInt(1, 4)) {
        case 1: sound = boom1; break;
        case 2: sound = boom2; break;
        case 3: sound = boom3; break;
        case 4: sound = boom4; break;
        }

        sound.load();
        sound.volume = 0.4;
        sound.play();
    }
}

document.getElementById('container').style.width = cvs.clientWidth + "px";

// Set the sound button toggle
muteBtn.addEventListener("click", function() {
    var tog = muteBtn.getAttribute('data-enabled');

    if(tog == "true") {
        muteBtn.src = "img/mute.png";
        music.volume = 0;
        mute = true;
        muteBtn.setAttribute('data-enabled', 'false');
    } else {
        muteBtn.src = "img/sound.png";
        music.volume = 1;
        mute = false;
        muteBtn.setAttribute('data-enabled', 'true');
    }
});

/* Utility */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function drawRotatedImage(img, angle, x, y) {
    drawRotatedImage(img, angle, x, y, img.width, img.height);
}

function getDistance(pos1, pos2) {
    let x1 = pos1[0],
        y1 = pos1[1],
        x2 = pos2[0],
	    y2 = pos2[1];
	return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
}

var TO_RADIANS = Math.PI/180;

function drawRotatedImage(image, angle, x, y, width, height) {
    if(!width) {
        width = image.width;
    }
    if(!height) {
        height = image.height;
    }
	gfx.save();
	gfx.translate(x, y);
	gfx.rotate(angle * TO_RADIANS);
	gfx.drawImage(image, -(width / 2), -(height / 2), width, height);
	gfx.restore();
}

cvs.addEventListener('mousemove', function(evt) {
    let rect = cvs.getBoundingClientRect(),
        root = document.documentElement;

    // return relative mouse position
    let mouseX = evt.clientX - rect.left - root.scrollLeft;
    let mouseY = evt.clientY - rect.top - root.scrollTop;

    mouse = [mouseX, mouseY];
});

cvs.addEventListener('mousedown', function(evt) {
    if(mayCharge) {
        if(!charging) {
            chargePower = 60;
        }

        charging = true;
        mayCharge = false;
    }
});

cvs.addEventListener('mouseup', function(evt) {
    if(charging) {
        shoot();
    }

    charging = false;
});

document.addEventListener('keydown', function(evt) {
    if(mayCharge && evt.which == 32) {
        if(!charging) {
            chargePower = 60;
        }

        charging = true;
        mayCharge = false;
    }
});

document.addEventListener('keyup', function(evt) {
    if(charging && evt.which == 32) {
        shoot();
    }

    charging = false;
});

function getAngle(pos1, pos2) {
    let angle = Math.atan2(pos2[1] - pos1[1], pos2[0] - pos1[0]) * (180/Math.PI);

    return angle;
}

function spawn() {
    if(running) {
        let knight = new Knight();
        if(isFkn) {
            knight.knightType = getRandomInt(3, 5);
        } else {
            knight.knightType = getRandomInt(1, 4);
        }

        knights.push(knight);

        if(!meeuw && getRandomInt(1, 5) == 1) {
            meeuw = new Meeuw();
        }
    }

    setTimeout(function() {
        spawn();
    }, spawnSpeed);
}

// Spawn the first knight
spawn();

// Show the canvas
document.getElementById('container').style.opacity = 1;

function finish() {
    let menu = document.getElementById('menu'),
        opacity = 0;

    if(score > highscore) {
        highscore = score;
        document.getElementById('menu-high-score').innerHTML = highscore;
    }

    menu.style.display = "block";

    document.getElementById('menu-score').innerHTML = score;

    let itv = setInterval(function() {
        opacity += 0.05;

        if(opacity >= 1) {
            opacity = 1;
            clearInterval(itv);
        }

        menu.style.opacity = opacity;
    }, 10);
    let menu2 = document.getElementById('menu2');
    if (menu2.style.display == "none") {
        var person = prompt("Введите имя для таблицы рекордов", "");
        if (person != null) {
            let json_data = {"name": person, "score": highscore};
            $.ajax({
                type: 'POST',
                url: 'https://hse.then.wtf/api/v1/leaderboard',
                data: JSON.stringify(json_data),
                dataType: 'json',
                contentType: "application/json; charset=utf-8"
            });
            $.ajax({
                type: 'GET',
                url: 'https://hse.then.wtf/api/v1/leaderboard',
                dataType: 'json',
                success: function(resp){
                    for (var i = 0; i < resp.length; i++) {
                        var player = document.getElementById("name" + (i + 1));
                        var playerscore = document.getElementById("score" + (i + 1));
                        player.innerText = resp[i]["user_name"];
                        playerscore.innerText = resp[i]["user_score"];
                    }
                }
            });
        }
    }
}

$(window).blur(function() {
    knights = [];
    score = 0;
    scoreObj.innerHTML = 0;
});

function restart() {
    knights = [];
    spawnSpeed = 1200;
    ball = null;
    score = 0;
    mayCharge = true;
    // tower_offset = getRandomInt(0, 150);
    tower_offset = getRandomInt(30, 60);
    scoreObj.innerHTML = 0;

    if(highscore > 0) {
        let hs = document.getElementById('highscore');

        hs.style.display = "block";
        hs.innerHTML = "Best:<br>"+ highscore;
    }

    let opacity = 1;

    let itv = setInterval(function() {
        opacity -= 0.05;

        if(opacity <= 0) {
            opacity = 0;
            menu.style.display = "none";
            document.getElementById('menu-score').innerHTML = 0;
            clearInterval(itv);
        }

        menu.style.opacity = opacity;
    }, 10);

    running = true;

    tick();
}

function restartFKN() {
    knights = [];
    spawnSpeed = 1200;
    ball = null;
    score = 0;
    mayCharge = true;
    isFkn = true;
    // tower_offset = getRandomInt(0, 150);
    tower_offset = getRandomInt(30, 60);
    scoreObj.innerHTML = 0;

    if(highscore > 0) {
        let hs = document.getElementById('highscore');

        hs.style.display = "block";
        hs.innerHTML = "Best:<br>"+ highscore;
    }

    let opacity = 1;

    let itv = setInterval(function() {
        opacity -= 0.05;

        if(opacity <= 0) {
            opacity = 0;
            menu.style.display = "none";
            document.getElementById('menu-score').innerHTML = 0;
            let menu2 = document.getElementById('menu2');
            menu2.style.display = "none";
            clearInterval(itv);
        }

        menu.style.opacity = opacity;
    }, 10);

    running = true;

    tick();
}

function restartMI() {
    knights = [];
    spawnSpeed = 1200;
    ball = null;
    score = 0;
    mayCharge = true;
    isFkn = false;
    // tower_offset = getRandomInt(0, 150);
    tower_offset = getRandomInt(30, 60);
    scoreObj.innerHTML = 0;

    if(highscore > 0) {
        let hs = document.getElementById('highscore');

        hs.style.display = "block";
        hs.innerHTML = "Best:<br>"+ highscore;
    }

    let opacity = 1;

    let itv = setInterval(function() {
        opacity -= 0.05;

        if(opacity <= 0) {
            opacity = 0;
            menu.style.display = "none";
            document.getElementById('menu-score').innerHTML = 0;
            let menu2 = document.getElementById('menu2');
            menu2.style.display = "none";
            clearInterval(itv);
        }

        menu.style.opacity = opacity;
    }, 10);

    running = true;

    tick();
}
