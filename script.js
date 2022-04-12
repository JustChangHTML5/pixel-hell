var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

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
        const fs = require('fs')

        fs.readFile("game/levels/earth.txt", (err, data) => {
            if (err) throw err;
          
            console.log(data.toString());
        })
    }
}

let player = new Player("game/sprites/gamemakor.JPG", [10, 10]);
player.loadIntoGame();

function loadFile() {
    reader.open('get', 'test.txt', true); 
    reader.onreadystatechange = displayContents;
    reader.send(null);
}

function displayContents() {
    if(reader.readyState==4) {
        var el = document.getElementById('main');
        el.innerHTML = reader.responseText;
    }
}