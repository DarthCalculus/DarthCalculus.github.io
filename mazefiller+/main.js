var windowWidth = window.innerWidth;
var windowHeight = window.innerHeight;

var board = document.getElementById("canvas");
var ctx = board.getContext("2d");


board.height = windowHeight*0.8;
board.width = board.height;

var SIZE;


class Map {
	constructor(mapSize, roomSize) {
		this.mapSize = mapSize;
		this.roomSize = roomSize;
		this.grid = [];
		this.loc = {};
		this.dir = {};
		this.origin = {};
		this.goal = {};
		this.gold = 0;
		this.bombs = 0;
		this.bombcost = bombcost;
		this.path = [];
		this.endPhase = false;
		this.initGrid();
	}

	initGrid() {
		var gridSize = this.mapSize * (this.roomSize + 1) + 3;

		var dum0 = new Array(gridSize);
		dum0.fill(0);
		var dum2 = new Array(gridSize);
		dum2.fill(2);
		dum2[0] = 0;
		dum2[gridSize - 1] = 0;

		var dummy = [];
		dummy.push(0);
		dummy.push(2);
		for (var i = 0; i < this.mapSize; i++) {
			for (var j = 0; j < this.roomSize; j++) {
				dummy.push(1);
			}
			dummy.push(2);
		}
		dummy.push(0);

		this.grid.push(dum0.slice());
		this.grid.push(dum2.slice());

		for (var i = 0; i < this.mapSize; i++) {
			for (var j = 0; j < this.roomSize; j++) {
				this.grid.push(dummy.slice());
			}
			this.grid.push(dum2.slice());
		}
		this.grid.push(dum0.slice());

		for (var mapx = 0; mapx < this.mapSize; mapx ++) {
			for (var mapy = 0; mapy < this.mapSize; mapy ++) {

				var count = 0;
				while (count < this.roomSize*this.roomSize/4) {
					var x = Math.floor(Math.random()*this.roomSize);
					var y = Math.floor(Math.random()*this.roomSize);
					var adj_x = 2 + mapx*(this.roomSize + 1) + x;
					var adj_y = 2 + mapy*(this.roomSize + 1) + y;
					if (this.grid[adj_x][adj_y] == 1) {
						count += 1;
					}
					this.grid[adj_x][adj_y] = 2;
				}
				while (true) {
					var x = Math.floor(Math.random()*(this.roomSize-2))+1;
					var y = Math.floor(Math.random()*(this.roomSize-2))+1;
					var adj_x = 2 + mapx*(this.roomSize + 1) + x;
					var adj_y = 2 + mapy*(this.roomSize + 1) + y;
					if (this.grid[adj_x][adj_y] == 1) {
						this.grid[adj_x][adj_y] = 4;
						break;
					}
				}
			}
		}
		var r = Math.floor(Math.random()*16);
		var v = Math.floor((this.roomSize + 1)*.5)+1;
		switch (r) {
			case 0:
				this.goal = {x:0, y:v};
				break;
			case 1:
			case 2:
				this.goal = {x:0,y: this.roomSize + 1 + v};
				break;
			case 3:
				this.goal = {x:0,y: 2*(this.roomSize + 1) + v};
				break;
			case 4:
				this.goal = {x:gridSize-1, y:v};
				break;
			case 5:
			case 6:
				this.goal = {x:gridSize-1,y: this.roomSize + 1 + v};
				break;
			case 7:
				this.goal = {x:gridSize-1,y: 2*(this.roomSize + 1) + v};
				break;
			case 8:
				this.goal = {x:v, y:0};
				break;
			case 9:
			case 10:
				this.goal = {x:this.roomSize + 1 + v,y: 0};
				break;
			case 11:
				this.goal = {x:2*(this.roomSize + 1) + v,y: 0};
				break;
			case 12:
				this.goal = {x:v, y:gridSize-1};
				break;
			case 13:
			case 14:
				this.goal = {x:this.roomSize + 1 + v,y: gridSize -1};
				break;
			case 15:
				this.goal = {x:2*(this.roomSize + 1) + v,y: gridSize -1};
				break;
		}
		this.grid[this.goal.x][this.goal.y] = 2;

		var xg = Math.floor((this.goal.x - 2.0)/(this.roomSize + 1));
		var yg = Math.floor((this.goal.y - 2.0)/(this.roomSize + 1));

		while (true) {
			var x = Math.floor(Math.random()*gridSize);
			var y = Math.floor(Math.random()*gridSize);
			if (this.grid[x][y] == 1) {
				var xh = Math.floor((x - 2.0)/(this.roomSize + 1));
				var yh = Math.floor((y - 2.0)/(this.roomSize + 1));

				if ((xh-xg)*(xh-xg) + (yh-yg)*(yh-yg) > 1) {
					this.loc = {x:x,y:y};
					this.origin = {x:x,y:y};
					this.dir = getDir(Math.floor(Math.random()*4)+37);
					break;
				}
			}
		}

	}
}

function produceCopy(obj) {
	c = new Map(3,10);

	for (var i = 0; i < obj.grid.length; i++)
		c.grid[i] = obj.grid[i].slice();
	c.loc = {x:obj.loc.x,y:obj.loc.y};
	c.dir = {x:obj.dir.x,y:obj.dir.y};
	c.origin = {x:obj.origin.x,y:obj.origin.y};
	c.goal = {x:obj.goal.x,y:obj.goal.y};
	c.gold = obj.gold;
	c.bombs = obj.bombs;
	c.bombcost = obj.bombcost;
	c.path = obj.path.slice();
	c.endPhase = obj.endPhase;

	return c;
}

var world;
var bombcost = 8;
var save;
var goal;

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
	if (world.dir.x == 1)
		ctx.fillRect(SIZE*(x+.5), board.height - SIZE*(y+0.6), SIZE*.4, SIZE*.2);
	if (world.dir.x == -1)
		ctx.fillRect(SIZE*(x+.1), board.height - SIZE*(y+0.6), SIZE*.4, SIZE*.2);
	if (world.dir.y == 1)
		ctx.fillRect(SIZE*(x+.4), board.height - SIZE*(y+0.9), SIZE*.2, SIZE*.4);
	if (world.dir.y == -1)
		ctx.fillRect(SIZE*(x+.4), board.height - SIZE*(y+0.5), SIZE*.2, SIZE*.4);
	ctx.restore();
}

function drawPath(xmin, ymin){
	ctx.save();
	ctx.fillStyle = "DodgerBlue";

	var x = world.origin.x - xmin;
	var y = world.origin.y - ymin;
	for(var i = 0; i < world.path.length; i++) {
		var d = world.path[i];
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

function fillGrid(grid, xmin, ymin, width) {
	for (var i = 0; i < width; i++) {
		for (var j = 0; j < width; j++) {
			var color;
			switch (grid[xmin+i][ymin+j]) {
				case 0:
					color = "black";
					break;
				case 1:
					color = "white";
					break;
				case 2:
					color = "gray";
					break;
				case 3:
					color = "orange";
					break;
				case 4:
					color = "tan";
					break;
			}
			fillSquare(color,i,j);
		}
	}
}

function draw() {
	ctx.clearRect(0, 0, board.width, board.height);
	ctx.fillStyle = "white";
	ctx.fillRect(0,0,board.width,board.height);
	ctx.beginPath();

	for (var i = 0; i <= world.roomSize+4; i++) {
		ctx.moveTo(SIZE * i, 0);
		ctx.lineTo(SIZE * i, (world.roomSize+4) * SIZE);
		ctx.moveTo(0, SIZE * i);
		ctx.lineTo((world.roomSize+4) * SIZE, SIZE * i);
	}
	ctx.stroke();


	var xcorner = Math.floor((world.loc.x - 2.0)/(world.roomSize + 1))
													*(world.roomSize + 1);
	var ycorner = Math.floor((world.loc.y - 2.0)/(world.roomSize + 1))
													*(world.roomSize + 1);
	if (xcorner < 0) xcorner = 0;
	if (ycorner < 0) ycorner = 0;

	if (world.endPhase) {
		xcorner = 0;
		ycorner = 0;
	}

	fillGrid(world.grid, xcorner, ycorner, world.roomSize+4);

	drawPath(xcorner, ycorner);

	drawPlayer(world.loc.x-xcorner,world.loc.y-ycorner);

	if (world.endPhase) {
		if (world.loc.x != goal.x || world.loc.y != goal.y) {
			ctx.save();
			ctx.beginPath();
			ctx.fillStyle = "red";
			ctx.arc(SIZE*(goal.x+.5), board.height - SIZE*(goal.y+0.5), SIZE/4, 0, 2 * Math.PI);
			ctx.fill();
			ctx.restore();
		}
	}
}

var shiftDown = false;

window.onkeydown = function(event) {
	var key = event.keyCode;
};

function transpose(mode, coords) {
	if (mode == 0)
		return coords;
	if (mode == 1)
		return {x: coords.y, y: coords.x};
	if (mode == 2)
		return {x: coords.x, y: world.roomSize + 3 - coords.y};
	if (mode == 3)
		return {x: world.roomSize + 3 - coords.y, y: coords.x};
}

function endGame() {
	for (var i = 0; i < world.grid.length; i++) {
		world.grid[i].fill(0);
	}
	world.path = [];
	var v = Math.floor((world.roomSize + 1)*.5)+1;

	var mode;
	if (world.goal.y == 0){
		world.loc.x = v;
		world.loc.y = world.roomSize+3;
		mode = 0;
	}
	if (world.goal.x == 0){
		world.loc.x = world.roomSize+3;
		world.loc.y = v;
		mode = 1;
	}
	if (world.goal.y == world.grid.length - 1){
		world.loc.x = v;
		world.loc.y = 0;
		mode = 2;
	}
	if (world.goal.x ==  world.grid.length - 1){
		world.loc.x = 0;
		world.loc.y = v;
		mode = 3;
	}
	world.origin.x = world.loc.x;
	world.origin.y = world.loc.y;

	var r = world.roomSize;
	coordList = [{x: v, y: r+3, z: 1},{x: v, y: r+2, z: 1},{x: v-1, y: r+2, z: 1},
							{x: v-2, y: r+2, z: 1},{x: v-3, y: r+2, z: 2},{x: v-3, y: r+1, z: 2},
							{x: v-3, y: r, z: 2},{x: v-3, y: r-1, z: 2},{x: v-3, y: r-2, z: 2},
							{x: v-3, y: r-3, z: 2},{x: v-3, y: r-4, z: 2},{x: v-3, y: r-5, z: 2},
							{x: v-3, y: r-6, z: 2},{x: v-2, y: r-6, z: 2},
							{x: v-1, y: r-6, z: 2},{x: v, y: r-6, z: 2},{x: v+1, y: r-6, z: 2},
							{x: v+2, y: r-6, z: 2},{x: v+3, y: r-6, z: 2},
							{x: v+4, y: r-6, z: 2},{x: v+4, y: r-5, z: 2},{x: v+4, y: r-4, z: 2},
							{x: v+4, y: r-3, z: 2},{x: v+4, y: r-2, z: 2},{x: v+4, y: r-1, z: 2},
							{x: v+4, y: r, z: 2},{x: v+3, y: r, z: 2},{x: v+2, y: r, z: 2},
							{x: v+1, y: r, z: 2},{x: v, y: r, z: 2},{x: v-1, y: r, z: 2},
							{x: v-1, y: r-1, z: 2},{x: v-1, y: r-2, z: 2},{x: v-1, y: r-3, z: 2},
							{x: v, y: r-3, z: 1},{x: v+1, y: r-3, z: 1}


	];
	for (var i = 0; i < coordList.length; i++) {
		newCoord = transpose(mode, {x: coordList[i].x, y: coordList[i].y});
		world.grid[newCoord.x][newCoord.y] = coordList[i].z;
		if (i == coordList.length -1) {
			goal = newCoord;
		}
	}
	world.endPhase = true;
	save = produceCopy(world);
}

window.onkeyup = function(event) {
	var key = event.keyCode;
	//console.log(key);

	if (key < 41 && key > 36) {
		document.getElementById("hideme").style.display = "none";

		var d = getDir(key);
		if (world.endPhase) {
			if (world.loc.x != goal.x || world.loc.y != goal.y)
				world.dir = d;
		}
		else {
			world.dir = d;
		}

		var newx = world.loc.x + d.x;
		var newy = world.loc.y + d.y;
		if (world.grid[newx][newy] == 0 || world.grid[newx][newy] == 2
			|| world.grid[newx][newy] == 3) {
		}

		else {
			world.grid[world.loc.x][world.loc.y] = 3;
			world.loc = {x:newx,y:newy};
			world.path.push(key);
			world.gold += 1;
			document.getElementById("gold").innerHTML = "Gold: " + world.gold;

			if (world.loc.x == world.goal.x && world.loc.y == world.goal.y) {
				endGame();
			}
			if (world.endPhase) {

				if (world.loc.x == goal.x && world.loc.y == goal.y) {
					document.getElementById("end").style.display = "block";
					document.getElementById("spare").innerHTML = "" + world.bombs;
					save = produceCopy(world);
				}
			}

			if (world.grid[world.loc.x][world.loc.y] == 4) {
				document.getElementById("shop").style.display = "block";
			}
			else {
				document.getElementById("shop").style.display = "none";
				world.bombcost = bombcost;
				document.getElementById("bomb").innerHTML = "Buy Bomb "+
																		world.bombcost+" gold (b)";
				document.getElementById("hint").style.display = "none";
				document.getElementById("advice").style.display = "block";

			}
		}
		draw();
		if ((world.loc.x - 1) % (world.roomSize + 1) == 0 ||
				(world.loc.y - 1) % (world.roomSize + 1) == 0) {
			save = produceCopy(world);
		}
	}
	if (key == 82) {
		document.getElementById("newGame").onclick();
	}
	if (key == 66) {
		document.getElementById("bomb").onclick();
	}
	if (key == 85) {
		document.getElementById("use").onclick();
	}
	if (key == 90) {
		document.getElementById("reset").onclick();
	}
	if (key == 65) {
		if (document.getElementById("advice").style.display == "block")
			document.getElementById("advice").onclick();
	}
};

document.getElementById("newGame").onclick = function(){
	/*
	var newSize = Number(document.getElementById("size").value);
	if (newSize < 100 && newSize >= 2) {
		gameSize = Math.floor(newSize);
	}
	*/
	initGame();
	document.getElementById("gold").innerHTML = "Gold: 0";
	document.getElementById("bombs").innerHTML = "Bombs: 0";
	document.getElementById("shop").style.display = "none";
	document.getElementById("end").style.display = "none";
};
document.getElementById("bomb").onclick = function(){
	if (world.gold >= world.bombcost && world.grid[world.loc.x][world.loc.y] == 4) {
		world.gold -= world.bombcost;
		world.bombcost += 1;
		world.bombs += 1;
		document.getElementById("gold").innerHTML = "Gold: "+ world.gold;
		document.getElementById("bombs").innerHTML = "Bombs: " + world.bombs;
		document.getElementById("use").style.display = "block";
		document.getElementById("bomb").innerHTML = "Buy Bomb "+
		 																	world.bombcost+" gold (b)";

	}
};
document.getElementById("use").onclick = function(){
	if (world.bombs < 1) return;

	var facingx = world.loc.x + world.dir.x;
	var facingy = world.loc.y + world.dir.y;
	if (world.grid[facingx][facingy] == 2) {
		world.grid[facingx][facingy] = 1
		world.bombs -= 1;
		document.getElementById("bombs").innerHTML = "Bombs: " + world.bombs;
		if (world.bombs < 1) {
			document.getElementById("use").style.display = "none";
		}

	}
	draw();
};

document.getElementById("advice").onclick = function(){
	if (world.gold >= 3 && world.grid[world.loc.x][world.loc.y] == 4) {
		world.gold -= 3;
		var answer;
		var xg = Math.floor((world.goal.x - 2.0)/(world.roomSize + 1));
		var yg = Math.floor((world.goal.y - 2.0)/(world.roomSize + 1));
		var xh = Math.floor((world.loc.x - 2.0)/(world.roomSize + 1));
		var yh = Math.floor((world.loc.y - 2.0)/(world.roomSize + 1));

		if (xg == xh && yg == yh) answer = "NEARBY";
		if (xg == xh && yg < yh) answer = "SOUTH";
		if (xg == xh && yg > yh) answer = "NORTH";
		if (xg < xh && yg == yh) answer = "WEST";
		if (xg < xh && yg < yh) answer = "SOUTH-WEST";
		if (xg < xh && yg > yh) answer = "NORTH-WEST";
		if (xg > xh && yg == yh) answer = "EAST";
		if (xg > xh && yg < yh) answer = "SOUTH-EAST";
		if (xg > xh && yg > yh) answer = "NORTH-EAST";

		document.getElementById("answer").innerHTML = answer;
		document.getElementById("gold").innerHTML = "Gold: "+ world.gold;
		document.getElementById("hint").style.display = "block";
		document.getElementById("advice").style.display = "none";
		save = produceCopy(world);
	}
};

document.getElementById("reset").onclick = function(){
	world = produceCopy(save);
	draw();
	document.getElementById("gold").innerHTML = "Gold: "+ world.gold;
	document.getElementById("bombs").innerHTML = "Bombs: " + world.bombs;
}


var dirs = [{x:0,y:1},{x:0,y:-1},{x:1,y:0},{x:-1,y:0}];

function copyOf(grid) {
	return grid.map(function(arr) {
    	return arr.slice();
	});
}



function getDir(key) {
	var dx = 0;
	var dy = 0;
	if (key == 37) dx= -1;
	if (key == 38) dy= 1;
	if (key == 39) dx= 1;
	if (key == 40) dy= -1;
	return {x:dx,y:dy};
}

function getKey(dir) {
	if (dir.x == -1) return 37;
	if (dir.x == 1) return 39;
	if (dir.y == -1) return 40;
	if (dir.y == 1) return 38;
}

function initGame() {
	world = new Map(3,10);
	save = produceCopy(world);

	SIZE = board.height/(world.roomSize+4);


	draw();

}

window.onload = initGame;
