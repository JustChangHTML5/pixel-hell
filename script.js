var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var map = document.getElementById("map");
var gameMusic = document.getElementById("music");
gameMusic.loop = true;

//var music = new Audio("/game/music/maintheme.mp3");
//music.play();

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
ctx.imageSmoothingEnabled = false;

var loaded = false;
var curMousePos = [0, 0];

Math.dist = function(x1, y1, x2, y2) {
    if (!x2) x2 = 0;
    if (!y2) y2 = 0;
    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
}

function rotate(cx, cy, x, y, angle) {
    var radians = (Math.PI / 180) * angle,
        cos = Math.cos(radians),
        sin = Math.sin(radians),
        nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
        ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
    return [nx, ny];
}

function angle(cx, cy, ex, ey) {
    var dy = ey - cy;
    var dx = ex - cx;
    var theta = Math.atan2(dy, dx); // range (-PI, PI]
    theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
    //if (theta < 0) theta = 360 + theta; // range [0, 360)
    return theta;
}

function angle2(cx, cy, ex, ey, lastTheta) {
    var dy = ey - cy;
    var dx = ex - cx;
    if (Math.abs(dx) <= 2 || Math.abs(dy) <= 2) {
        return lastTheta - 90;
    } else {// fix
        var theta = Math.atan2(dy, dx); // range (-PI, PI]
        theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
        //if (theta < 0) theta = 360 + theta; // range [0, 360)
        return theta;
    }
}

var bullets = [];

document.onmousemove = handleMouseMove;
function handleMouseMove(event) {
    var eventDoc, doc, body;

    event = event || window.event; // IE-ism

    // If pageX/Y aren't available and clientX/Y are,
    // calculate pageX/Y - logic taken from jQuery.
    // (This is to support old IE)
    if (event.pageX == null && event.clientX != null) {
        eventDoc = (event.target && event.target.ownerDocument) || document;
        doc = eventDoc.documentElement;
        body = eventDoc.body;

        event.pageX = event.clientX +
            (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
            (doc && doc.clientLeft || body && body.clientLeft || 0);
        event.pageY = event.clientY +
            (doc && doc.scrollTop || body && body.scrollTop || 0) -
            (doc && doc.clientTop || body && body.clientTop || 0);
    }

    curMousePos = [event.clientX, event.clientY]
}

canvas.addEventListener('click', function(evt) {
    player.shoot(curMousePos); 
});

canvas.addEventListener('contextmenu', function(evt) {
    evt.preventDefault();
});

function loadFile(file) {
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                var allText = rawFile.responseText;
                map.innerHTML = allText;
            }
        }
    }
    rawFile.send(null);
}

class Map {
    constructor(stats, updateSpeed, skins) {
        this.stats = stats;
        this.bullets = [];
        this.updateSpeed = updateSpeed;
        this.skins = skins;
    }

    calcBullets() {
        for (var i = 0; i < this.bullets.length; i++) {
            var curBullet = this.bullets[i];
            curBullet.update();
            curBullet.draw();
            const playerHitbox = [player.skinData[0]*2/3, player.skinData[1]*2/3];
            if (curBullet.pos[0] >= player.pos[0] - playerHitbox[0] && curBullet.pos[0] <= player.pos[0] + playerHitbox[0]) {
                if (curBullet.pos[1] >= player.pos[1] - playerHitbox[1] && curBullet.pos[1] <= player.pos[1] + playerHitbox[1]) {
                    player.hp -= curBullet.damage;
                    curBullet.stopExisting();
                }
            }
        }
    }

    findPosAngle2becauseIamtoolazytomakeituseful(pos, pos0) {
        /*const angleX = this.pos[0] - pos[0];
        const angleY = this.pos[1] - pos[1];
        const whole = Math.abs(angleX) + Math.abs(angleY)
        const circle = 1 / Math.dist(0, 0, angleX / whole, angleY / whole);*/
        return angle(pos0[0], pos0[1], pos[0], pos[1]) + 90;

    }
    
    shoot(pos) {
        const angleX = 10 - pos[0];
        const angleY = 10 - pos[1];
        const whole = Math.abs(angleX) + Math.abs(angleY)
        const circle = 1 / Math.dist(0, 0, angleX / whole, angleY / whole);
        let curBullet = new Bullet(["/game/sprites/bullets/enemyBullets/bulletA/bullet0.png", "/game/sprites/bullets/enemyBullets/bulletA/bullet1.png", "/game/sprites/bullets/enemyBullets/bulletA/bullet2.png"], [16, 16], [10], 10, [-angleX / whole * circle * 10, -angleY / whole * circle * 10], [10, 10], this, this.findPosAngle2becauseIamtoolazytomakeituseful(pos, [10, 10]), 10);
        this.bullets.push(curBullet);
    }

    update() {
        this.shoot([player.pos[0], player.pos[1]]);
    }
}

class Bullet {
    constructor(skin, skinData, stats, skinSpeed, velocity, startPos, parent, direction, damage) {
        this.sprites = [];
        this.skin = skin;
        this.loadImages(skin);
        this.curImageNum = 0;
        this.curImage = this.sprites[0];
        this.skinData = skinData
        this.stats = stats;
        this.pos = startPos;
        this.vel = velocity;
        this.direction = direction;
        this.frameRate = skinSpeed;
        this.maxFrames = skinSpeed;
        this.loaded = false;
        this.destroyed = false;
        this.parent = parent;
        this.damage = damage;
    }

    loadImage(url) {
        let l = new Image();
        l.src = url

        return l;
    }

    loadImages(paths) {
        for (var i = 0; i < paths.length; i++) {
            var curPath = paths[i];
            var image = this.loadImage(curPath);
            this.sprites.push(image);
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.pos[0], this.pos[1]);
        ctx.rotate(this.direction * Math.PI / 180);
        ctx.drawImage(this.curImage, -this.skinData[0] / 2, - this.skinData[1] / 2, this.skinData[0], this.skinData[1]);
        ctx.restore();
        this.loaded = true;
    }

    update() {
        this.pos[0] += this.vel[0];
        this.pos[1] += this.vel[1];
        if (this.frameRate <= 0) {
            this.frameRate = this.maxFrames;
            this.curImageNum++;
            this.curImage = this.sprites[this.curImageNum % this.sprites.length];
        } else {
            this.frameRate--;
        }

        if (this.destroyed) {
            this.parent.bullets.splice(this.parent.bullets.indexOf(this), 1);
        }

        if (this.pos[0] > canvas.width || this.pos[0] < 0) {
            this.destroyed = true;
        } else if (this.pos[1] > canvas.height || this.pos[1] < 0) {
            this.destroyed = true;
        }
    }

    stopExisting() {
        this.parent.bullets.splice(this.parent.bullets.indexOf(this), 1);
    }
}

class Player {
    constructor(skin, skinData, stats, skinSpeed, bulletSkins, bulletSpeed) {
        this.sprites = [];
        this.skin = skin;
        this.loadImages(skin);
        this.curImageNum = 0;
        this.curImage = this.sprites[0];
        this.skinData = skinData
        this.stats = stats;
        this.pos = [canvas.width / 2, canvas.height / 2];
        this.direction = 0;
        this.frameRate = skinSpeed;
        this.maxFrames = skinSpeed;
        this.loaded = false;
        this.bullets = [];
        this.bulletSkins = bulletSkins;
        this.bulletSpeed = bulletSpeed;
        this.hp = stats[6];
    }

    loadImage(url) {
        let l = new Image();
        l.src = url

        return l;
    }

    loadImages(paths) {
        for (var i = 0; i < paths.length; i++) {
            var curPath = paths[i];
            var image = this.loadImage(curPath);
            this.sprites.push(image);
        }
    }

    draw(pos) {
        ctx.save();
        ctx.translate(this.pos[0], this.pos[1]);
        ctx.rotate(this.direction * Math.PI / 180);
        ctx.drawImage(this.curImage, -this.skinData[0] / 2, - this.skinData[1] / 2, this.skinData[0], this.skinData[1]);
        ctx.restore();
        this.loaded = true;
        //ctx.drawImage(img, 100, 100, 100, 100);
    }


    update(pos) {
        if (Math.abs(pos[0] - this.pos[0]) > 2 && Math.abs(pos[1] - this.pos[1]) > 2) {
            this.pos[0] += (pos[0] - this.pos[0]) / this.stats[0];
        this.pos[1] += (pos[1] - this.pos[1]) / this.stats[0];
        } 
        
        if (this.frameRate <= 0) {
            this.frameRate = this.maxFrames;
            this.curImageNum++;
            this.curImage = this.sprites[this.curImageNum % this.sprites.length];
        } else {
            this.frameRate--;
        }
        this.pos[0] = Math.round(this.pos[0] / this.stats[1]) * this.stats[1];
        this.pos[1] = Math.round(this.pos[1] / this.stats[1]) * this.stats[1];
    }

    findPosAngle(pos) {
        /*const angleX = this.pos[0] - pos[0];
        const angleY = this.pos[1] - pos[1];
        const whole = Math.abs(angleX) + Math.abs(angleY)
        const circle = 1 / Math.dist(0, 0, angleX / whole, angleY / whole);*/
        this.direction = angle2(this.pos[0], this.pos[1], pos[0], pos[1], this.direction) + 90;

    }

    findPosAngle2becauseIamtoolazytomakeituseful(pos) {
        /*const angleX = this.pos[0] - pos[0];
        const angleY = this.pos[1] - pos[1];
        const whole = Math.abs(angleX) + Math.abs(angleY)
        const circle = 1 / Math.dist(0, 0, angleX / whole, angleY / whole);*/
        return angle(this.pos[0], this.pos[1], pos[0], pos[1]) + 90;

    }

    shoot(pos) {
        const angleX = this.pos[0] - pos[0];
        const angleY = this.pos[1] - pos[1];
        const whole = Math.abs(angleX) + Math.abs(angleY)
        const circle = 1 / Math.dist(0, 0, angleX / whole, angleY / whole);
        let curBullet = new Bullet(this.bulletSkins, [this.stats[3], this.stats[4]], this.stats[2], this.stats[5], [-angleX / whole * circle * this.bulletSpeed, -angleY / whole * circle * this.bulletSpeed], [this.pos[0], this.pos[1]], this, this.findPosAngle2becauseIamtoolazytomakeituseful(pos), this.stats[7]);
        this.bullets.push(curBullet);
    }

    updateBullets() {
        for (var i = 0; i < this.bullets.length; i++) {
            var curBullet = this.bullets[i];
            curBullet.update();
        }
        for (var i = 0; i < this.bullets.length; i++) {
            var curBullet = this.bullets[i];
            curBullet.draw();
        }
    }
}

//let player = new Player("game/sprites/gamemakor.JPG", [10, 10]);
//player.loadIntoGame();

let player = new Player(["/game/sprites/spaceships/spaceshipA/spaceship0.png", "/game/sprites/spaceships/spaceshipA/spaceship1.png", "/game/sprites/spaceships/spaceshipA/spaceship2.png"], [32, 64], [10, 0.25, 4, 8, 16, 10, 100, 5], 20, ["game/sprites/bullets/playerBullets/bulletA/bulletshoot0.png", "game/sprites/bullets/playerBullets/bulletA/bulletshoot1.png"], 10);
let gameMap = new Map(0, 0, 0);

function main() {
    gameMusic.play();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    player.draw();
    player.findPosAngle(curMousePos);
    player.update(curMousePos);
    player.updateBullets();
    gameMap.update();
    gameMap.calcBullets();
    //canvas.width = window.innerWidth;
    //canvas.height = window.innerHeight;
    if (player.loaded) {
        player.loaded = false;
    }
    window.requestAnimationFrame(main);
}

main()