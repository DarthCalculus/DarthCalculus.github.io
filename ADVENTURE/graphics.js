var canvas = $("#canvas").get(0);
var ctx = canvas.getContext("2d");

var tileSize = 25;

function drawGrid() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	for (i = 0; i < width; i++) {
		for (j = 0; j < height; j++) {
			drawGridSquare(i,j);
		}
	}
	drawPlatforms();
	drawPlayer();
	$("#info").html(message);
}

function drawPlayer() {
	ctx.save();
	ctx.beginPath();
	ctx.arc(tileSize*(player.x+.5),tileSize*(height-player.y-1+.5),tileSize/3.,0,2*Math.PI);
	ctx.fillStyle = "#00FF00";
	ctx.fill();
	ctx.restore();
}

function drawPlatforms() {

	for (var i = 0; i < platforms.length; i++) {
		plat = platforms[i];

		var c = 0;
		switch (i) {
			case 0:
				c = "#FF0000";
				break;
			case 1:
				c = "#00CCFF";
				break;
			default:
				c = "#FF0000";
				break;
		}

		ctx.save();
	
		ctx.fillStyle = c;
		ctx.fillRect(tileSize*plat.pos.x,tileSize*(height - plat.pos.y - 1),tileSize,tileSize);
		ctx.restore();

		drawTerminal(plat.controller.x,plat.controller.y,i);

	}

	
}

function drawGridSquare(x,y) {
	ctx.save();
	var color = 0;
	switch (grid[x][y]) {
		case 0:
			color = "#999999";
			break;
		case 1:
			color = "#000000";
			break;
		case 2:
			color = "#777777";
			break;
		case 3:
			color = "#00FF00";
			break;
	}
	ctx.fillStyle = color;
	ctx.fillRect(tileSize*x,tileSize*(height - y - 1),tileSize,tileSize);

	//if (grid[x][y] == 2) drawTerminal(x,y);
	if (grid[x][y] == 3) drawGoal(x,y);

	ctx.restore();
}

function drawGoal(x,y) {
	ctx.save();
	ctx.beginPath();
	ctx.arc(tileSize*(x+.5),tileSize*(height-y-1+.5),tileSize/3.,0,2*Math.PI);
	ctx.rect(tileSize*x,tileSize*(height - y - 1),tileSize,tileSize);
	ctx.strokeStyle = "#000000";
	ctx.stroke();
	ctx.restore();
}

function drawTerminal(x,y,i) {

	var c1;
	var c2;
	switch (i) {
		case 0:
			c1 = "#FF0000";
			c2 = "#AA0000";
			break;
		case 1:
			c1 = "#00CCFF";;
			c2 = "#007799";
			break;
		default:
			c1 = "#FF0000";
			c2 = "#AA0000";
			break;
	}


	ctx.save();

	ctx.fillStyle = c1;
	ctx.beginPath();
	ctx.moveTo(tileSize*(x+.1),tileSize*(height-y-1+.7));
	ctx.lineTo(tileSize*(x+.25),tileSize*(height-y-1+.1));
	ctx.lineTo(tileSize*(x+.75),tileSize*(height-y-1+.1));
	ctx.lineTo(tileSize*(x+.9),tileSize*(height-y-1+.7));
	ctx.lineTo(tileSize*(x+.1),tileSize*(height-y-1+.7));

	ctx.fill();
	ctx.fillStyle = c2;
	ctx.fillRect(tileSize*(x+.1),tileSize*(height-y-1+.7),tileSize*.8,tileSize*.2)
	ctx.restore();
}
