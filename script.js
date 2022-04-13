var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var map = document.getElementById("map");


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
    constructor(skin, stats) {
        this.skin = skin;
        this.image = new Image();
        this.image.src = this.skin;
        this.stats = stats;
        this.pos = [];
        this.vel = [];
    }

    loadIntoGame(map) {
        loadFile("game/levels/earth.txt");
        const mapData = map.innerHTML;
        for (var i = 0; i < mapData.length; i++) {
            if (mapData[i] = ":") {
                
            }
        }
    }
}

//let player = new Player("game/sprites/gamemakor.JPG", [10, 10]);
//player.loadIntoGame();