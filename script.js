var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var map = document.getElementById("map");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

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

    curMousePos = [event.clientX, event.clientX]
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


class Player {
    constructor(skin, stats, skinSpeed) {
        this.skin = skin;
        this.sprites = this.loadImages(skin);
        this.curImageNum = 0;
        this.curImage = this.sprites[this.curImageNum];
        this.stats = stats;
        this.pos = [];
        this.vel = [];
        this.frameRate = skinSpeed;
        this.maxFrames = skinSpeed;
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
        var imageList = [];
        for (var i = 0; i < paths.length; i++) {
            var curPath = paths[i];
            let image = new Image();
            image.src = curPath;
            image.onload = function() {
                console.log()
            }
            imageList.push(image);
        }

        return imageList;
    }

    draw(pos) {
        let image = new Image();
        image.src = "/game/sprites/spaceship0.png";
        image.onload = function() {
            //ctx.drawImage(image, 100, 100, 100, 200);
        }
        ctx.drawImage(this.curImage, 100, 100, 32, 64);
    }
    

    update() {
        if (this.frameRate <= 0) {
            this.frameRate = this.maxFrames;
            this.curImageNum++;
            this.curImage = this.sprites[this.curImageNum % this.sprites.length];
        } else {
            this.frameRate--;
        }
    }
}

//let player = new Player("game/sprites/gamemakor.JPG", [10, 10]);
//player.loadIntoGame();

let player = new Player(["/game/sprites/spaceship0.png", "/game/sprites/spaceship1.png", "/game/sprites/spaceship2.png"], [10, 10, 10], 20);

function main() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    player.draw(curMousePos);
    player.update()
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

var gameLoop = setInterval(main, 10);