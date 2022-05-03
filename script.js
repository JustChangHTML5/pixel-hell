var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var map = document.getElementById("map");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
ctx.imageSmoothingEnabled = false;

var loaded = false;
var curMousePos = [0, 0];

Math.dist=function(x1,y1,x2,y2){ 
  if(!x2) x2=0; 
  if(!y2) y2=0;
  return Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1)); 
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
          (doc && doc.scrollTop  || body && body.scrollTop  || 0) -
          (doc && doc.clientTop  || body && body.clientTop  || 0 );
    }

    curMousePos = [event.clientX, event.clientY]
}

function loadFile(file)
{
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                var allText = rawFile.responseText;
                map.innerHTML = allText;
            }
        }
    }
    rawFile.send(null);
}

class Bullet {
    constructor(skin, skinData, stats, skinSpeed) {
        this.sprites = [];
        this.skin = skin;
        this.loadImages(skin);
        this.curImageNum = 0;
        this.curImage = this.sprites[0];
        this.skinData = skinData
        this.stats = stats;
        this.pos = [0, 0];
        this.vel = [];
        this.frameRate = skinSpeed;
        this.maxFrames = skinSpeed;
        this.loaded = false;
        this.destroyed = false;
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

    draw(angle) {
        ctx.save();
        ctx.translate(this.pos[0], this.pos[1]);
        ctx.rotate(angle * Math.PI / 180);
        ctx.drawImage(this.curImage, -this.skinData[0] / 2, - this.skinData[1] / 2, this.skinData[0], this.skinData[1]);
        ctx.restore();
        this.loaded = true;
    }

    update() {
        if (this.destroyed) {
            bullets.splice(bullets.find(this), 1);
        }
        
        if (this.pos[0] > canvas.width || this.pos[0] < 0) {
            this.destroyed = true;
        } else if (this.pos[1] > canvas.height || this.pos[1] < 0) {
            this.destroyed = true;
        }
    }
}

class Player {
    constructor(skin, skinData, stats, skinSpeed, bulletSkins) {
        this.sprites = [];
        this.skin = skin;
        this.loadImages(skin);
        this.curImageNum = 0;
        this.curImage = this.sprites[0];
        this.skinData = skinData
        this.stats = stats;
        this.pos = [0, 0];
        this.direction = 0;
        this.frameRate = skinSpeed;
        this.maxFrames = skinSpeed;
        this.loaded = false;
        this.bulletSkins = bulletSkins;
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
        this.pos[0] += (pos[0] - this.pos[0]) / this.stats[0];
        this.pos[1] += (pos[1] - this.pos[1]) / this.stats[0];
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
        this.direction = angle(this.pos[0], this.pos[1], pos[0], pos[1]) + 90;
        
    }

    shoot(pos) {
        const angleX = this.pos[0] - pos[0];
        const angleY = this.pos[1] - pos[1];
        const whole = Math.abs(angleX) + Math.abs(angleY)
        const circle = 1 / Math.dist(0, 0, angleX / whole, angleY / whole);
        let curBullet = new Bullet(this.bulletSkins, [this.stats[3], this.stats[4]], this.stats[2], this.stats[5]);
    }
}

//let player = new Player("game/sprites/gamemakor.JPG", [10, 10]);
//player.loadIntoGame();

let player = new Player(["/game/sprites/spaceships/spaceshipA/spaceship0.png", "/game/sprites/spaceships/spaceshipA/spaceship1.png", "/game/sprites/spaceships/spaceshipA/spaceship2.png"], [32, 64], [5, 0.25, 4, 4, 8, 10], 20, ["game/sprites/bullets/playerBullets/bulletA/bulletshoot0", "game/sprites/bullets/playerBullets/bulletA/bulletshoot1"]);

function main() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    player.draw();
    player.findPosAngle(curMousePos);
    player.update(curMousePos);
    //canvas.width = window.innerWidth;
    //canvas.height = window.innerHeight;
    if (player.loaded) {
        player.loaded = false;
    }
    window.requestAnimationFrame(main)
}

main()