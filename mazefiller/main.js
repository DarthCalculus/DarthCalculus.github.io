var windowWidth = window.innerWidth;
var windowHeight = window.innerHeight;

var board = document.getElementById("canvas");
var ctx = board.getContext("2d");


board.height = windowHeight*0.8;
board.width = board.height;

var gameSize = 10;
var SIZE; 

var game = [];

var player;
var playerStart;
var canMoveStart;
var path;
var score;
var highscore = new Array(100);
highscore.fill(0);

function initGame() {
	SIZE = board.height/(gameSize+2);
	game = [];
	score = 0;
	path = [];
	player = {}
	playerStart = {}
	canMoveStart = true;


	var dum = new Array(gameSize+2);
	dum.fill(0);
	var dummy = new Array(gameSize+2);
	dummy.fill(1);
	dummy[0] = 0;
	dummy[gameSize+1] = 0;
	game = [dum.slice()];
	for (var i = 0; i < gameSize; i++) {
		game.push(dummy.slice());
	}
	game.push(dum.slice());


	var count = 0;
	while (count < gameSize*gameSize/3) {
		var x = Math.ceil(Math.random()*gameSize);
		var y = Math.ceil(Math.random()*gameSize);
		if (game[x][y] == 1) {
			count += 1;
		}
		game[x][y] = 0;
	}
	while (true) {
		var x = Math.ceil(Math.random()*gameSize);
		var y = Math.ceil(Math.random()*gameSize);
		if (game[x][y] == 1) {
			player = {x:x,y:y};
			playerStart = {x:x,y:y};
			break;
		}
	}
	draw();

}


function fillSquare(color,x,y) { // x and y are in game coords
	ctx.save();
	ctx.fillStyle = color;
	ctx.fillRect(SIZE * x + 1, board.height - SIZE * (y+1),  SIZE - 1,  SIZE - 1);
	ctx.restore();
}
function drawPlayer(x,y) {
	ctx.save();
	ctx.beginPath();
	ctx.fillStyle = "blue";
	ctx.arc(SIZE*(x+.5), board.height - SIZE*(y+0.5), SIZE/4, 0, 2 * Math.PI);
	ctx.fill();
	ctx.restore();
}

function drawPath(){
	ctx.save();
	ctx.fillStyle = "DodgerBlue";
	var x = playerStart.x;
	var y = playerStart.y;
	for(var i = 0; i < path.length; i++) {
		var d = path[i];
		if (d == 37) {
			ctx.fillRect(SIZE * (x-0.65) , board.height - SIZE * (y+.65),  SIZE*1.3,  SIZE*.3);
			x -= 1;
		}
		if (d == 38) {
			ctx.fillRect(SIZE * (x+0.35) , board.height - SIZE * (y+1.65),  SIZE*.3,  SIZE*1.3);
			y += 1;
		}
		if (d == 39) {
			ctx.fillRect(SIZE * (x+0.35) , board.height - SIZE * (y+.65),  SIZE*1.3,  SIZE*.3);
			x += 1;
		}
		if (d == 40) {
			ctx.fillRect(SIZE * (x+0.35) , board.height - SIZE * (y+.65),  SIZE*.3,  SIZE*1.3);
			y -= 1;
		}
	}
	ctx.restore();
}

function draw() {
	ctx.clearRect(0, 0, board.width, board.height);
	ctx.fillStyle = "white";
	ctx.fillRect(0,0,board.width,board.height);
	ctx.beginPath();

	for (var i = 0; i <= gameSize+2; i++) {
		ctx.moveTo(SIZE * i, 0);
		ctx.lineTo(SIZE * i, (gameSize+2) * SIZE);
		ctx.moveTo(0, SIZE * i);
		ctx.lineTo((gameSize+2) * SIZE, SIZE * i);
	}
	ctx.stroke();


	var color;
	for (var i = 0; i < gameSize + 2; i++) {
		for (var j = 0; j < gameSize + 2; j++) {
			if( game[i][j] == 0) {
				color = "black";
			}
			if( game[i][j] == 1) {
				color = "white";
			}
			if( game[i][j] == 2) {
				color = "white";
			}
			fillSquare(color,i,j);
		}
	}
	drawPath();

	drawPlayer(player.x,player.y);
}

var shiftDown = false;

window.onkeydown = function(event) { 
	var key = event.keyCode;
	if (key == 16) {
		shiftDown  = true;
	}
};

window.onkeyup = function(event) { 
	var key = event.keyCode;
	console.log(key);
	if (key == 16) {
		shiftDown = false;
	}
	if (key < 41 && key > 36) {
		document.getElementById("hideme").style.display = "none";

		var dx = 0;
		var dy = 0;
		if (key == 37) dx= -1;
		if (key == 38) dy= 1;
		if (key == 39) dx= 1;
		if (key == 40) dy= -1;
		var newx = player.x + dx;
		var newy = player.y + dy;
		if (game[newx][newy] != 1) {
			return;
		}
		console.log(canMoveStart);
		console.log(shiftDown);
		if (shiftDown && canMoveStart) {
			player = {x:newx,y:newy};
			playerStart = {x:newx,y:newy};
		}
		else {
			canMoveStart = false;
			game[player.x][player.y] = 2;
			player = {x:newx,y:newy};
			path.push(key);
			score += 1;
			document.getElementById("score").innerHTML = "Score: " + score;
			if (score > highscore[gameSize]) {
				highscore[gameSize] = score;
				document.getElementById("best").innerHTML = "Best: " + score;

			}
		}

		draw();
	}
	if (key == 82) {
		document.getElementById("newGame").onclick();
	}

};


document.getElementById("newGame").onclick = function(){
	var newSize = Number(document.getElementById("size").value);
	if (newSize < 100 && newSize >= 2) {
		gameSize = Math.floor(newSize);
	}
	initGame();
	document.getElementById("score").innerHTML = "Score: 0";
	document.getElementById("best").innerHTML = "Best: " + highscore[gameSize];
};

window.onload = initGame;
