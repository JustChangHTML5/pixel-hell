var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var map = document.getElementById("map");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
ctx.imageSmoothingEnabled = false;

var loaded = false;
var curMousePos = [0, 0];

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
    }
}

class Player {
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
    }
    
    loadImage(url) {
        let l = new Image();
        l.src = url

        return l;
    }
    
    loadIntoGame(map) {
        loadFile("game/levels/earth.txt");
        const mapData = map.innerHTML;
        var filteredMapData = []
        var indexes = [];
        for (var i = 0; i < mapData.length; i++) {
            if (mapData[i] = ":") {
                indexes.push(i);
            }
        } for (var i = 0; i < indexes.length; i++) {
            var data = mapData.slice(indexes[i] + 1, indexes[i + 1]);
            var outputNum = 0;
            for (var j = 0; j < data.length; j++) {
                const number = data[j];
                outputNum *= 10;
                outputNum += number;//no support for decimals :(
            }
            filteredMapData.push(outputNum);
        }
        //also add image pathz or something.
        return filteredMapData;
    }

    loadImages(paths) {
        for (var i = 0; i < paths.length; i++) {
            var curPath = paths[i];
            var image = this.loadImage(curPath);
            this.sprites.push(image);
        }
    }

    draw(pos) {
        ctx.drawImage(this.curImage, this.pos[0] - this.skinData[0] / 2, this.pos[1] - this.skinData[1] / 2, this.skinData[0], this.skinData[1]);
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
}

//let player = new Player("game/sprites/gamemakor.JPG", [10, 10]);
//player.loadIntoGame();

let player = new Player(["/game/sprites/spaceships/spaceshipA/spaceship0.png", "/game/sprites/spaceships/spaceshipA/spaceship1.png", "/game/sprites/spaceships/spaceshipA/spaceship2.png"], [32, 64], [10, 0.25, 10], 20);

function main() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    player.draw();
    player.update(curMousePos);
    //canvas.width = window.innerWidth;
    //canvas.height = window.innerHeight;
    if (player.loaded) {
        player.loaded = false;
    }
    window.requestAnimationFrame(main)
}

main()