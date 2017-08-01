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
			if( game[i][j] == 3) {
				color = "orange";
			}
			if( game[i][j] == 4) {
				color = "red";
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
	//console.log(key);
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
		if (game[newx][newy] == 0 || game[newx][newy] == 2) {
			return;
		}
	
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

var dirs = [{x:0,y:1},{x:0,y:-1},{x:1,y:0},{x:-1,y:0}];

function copyOf(grid) {
	return grid.map(function(arr) {
    	return arr.slice();
	});
}

function dist(grid, p1, p2) {
	var copy = copyOf(grid);
	if (p1.x == p2.x && p1.y == p2.y) return 0;
	copy[p1.x][p1.y] = 0;
	var current = [p1];
	var next = [];
	var distance = 0;
	var answer = 0;
	while (true) {
		distance += 1;
		current.forEach(function(p) {
    		dirs.forEach(function(d) {
    			var newx = p.x+d.x;
    			var newy = p.y+d.y;
    			if (copy[newx][newy] != 0) {
    				if (newx == p2.x && newy == p2.y) {
    					answer = distance;
    				}
    				copy[newx][newy] = 0;
    				next.push({x:newx, y:newy});
    			}
			});
		});
		if (answer != 0) return answer;
		if (next.length == 0) return -1;
		current = next;
		next = [];
	}
}

function showCutPoints(grid, start) {
	var copy = copyOf(grid);
	var comp = sizeOfComponent(copy, start);
	for (var i = 1; i <= gameSize; i++) {
		for (var j = 1; j <= gameSize; j++) {
			if (copy[i][j] == 0) continue;
			if (i == start.x && j == start.y) continue;
			copy[i][j] = 0;
			newcomp = sizeOfComponent(copy, start);
			if (newcomp < comp - 1) {
				grid[i][j] = 3;
			}
			if (newcomp < comp - 10) {
				//grid[i][j] = 4;
			}
			copy[i][j] = 1;
		}
	}
	/*
	for (var i = 1; i <= gameSize; i++) {
		for (var j = 1; j <= gameSize; j++) {
			if (grid[i][j] == 3) {
				var d = dist(grid, start, {x:i,y:j});

				var best = {x:i,y:j};
				
				dirs.forEach(function(d) {
					var newx = i+d.x;
	    			var newy = j+d.y;
	    			var newd = dist(grid,start,{x:newx,y:newy});
	    			if (newd < d) {
	    				grid[newx][newy] = 1;
	    			}
	    			else {
	    				d = newd;
	    				grid[best.x][best.y] = 1;
	    				best = {x:newx,y:newy};
	    			}
				});
			}
		}
	}*/
		
}

function getKey(dir) {
	if (dir.x == -1) return 37;
	if (dir.x == 1) return 39;
	if (dir.y == -1) return 40;
	if (dir.y == 1) return 38;
}

function bruteForce(grid, start, end) {
	var grid = copyOf(grid);
	var curPath = [];
	var bestPath = [];
	var curX = start.x;
	var curY = start.y;
	function bruteForceHelper() {
		if (end != undefined) {
			if (curX == end.x && curY == end.y) {
	    		if (curPath.length > bestPath.length) {
	    			bestPath = curPath.slice();
	   			}
	   			return;
	    	}
	    }
	    else {
	    	if (curPath.length > bestPath.length) {
	    		bestPath = curPath.slice();
	   		}
	    }
		grid[curX][curY] = 0;
		for (var i = 0; i < 4; i++) {
			
	    	if (grid[curX+dirs[i].x][curY+dirs[i].y] != 0) {
	    		curPath.push(getKey(dirs[i]));
	    		curX += dirs[i].x;
	    		curY += dirs[i].y;
	    		bruteForceHelper();
	    		curX -= dirs[i].x;
	    		curY -= dirs[i].y;
	    		curPath.pop();
	    	}
	    }
	    grid[curX][curY] = 1;
	}
	bruteForceHelper();
	path = bestPath;
	console.log("Best:",bestPath.length);
}

function sizeOfComponent(grid, start) {
	var copy = copyOf(grid);
	return sizeOfComponentHelper(copy,start.x,start.y);
}
function sizeOfComponentHelper(grid, x, y) {
	if (grid[x][y] == 0) {
		return 0;
	}
	var sum = 1;
	grid[x][y] = 0;
	for (var i = 0; i < 4; i++) {
		sum += sizeOfComponentHelper(grid, x + dirs[i].x, y + dirs[i].y);
	}
	return sum;
}

function initGame() {
	SIZE = board.height/(gameSize+2);
	score = 0;
	path = [];
	player = {}
	playerStart = {}
	canMoveStart = true;


	while (true) {
		game = [];
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
		if (sizeOfComponent(game,player) >= gameSize*gameSize*6/10) {
			break;
		}
	}

	//console.log(sizeOfComponent(game,player));
	//showCutPoints(game,player);
	//console.log(dist(game, player, {x:player.x,y:player.y+5}));
	//bruteForce(game,player);
	draw();

}

window.onload = initGame;
