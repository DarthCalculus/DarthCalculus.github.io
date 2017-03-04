function Loc(x,y) {
	this.x = x;
	this.y = y;
}

function Platform(index, controllerLoc, startLoc, codeLength) {
	this.controller = controllerLoc;
	this.start = startLoc;
	this.pos = Object.assign({}, startLoc);
	
	this.speed = 1;
	this.code = "";
	this.codeLength = codeLength;
	this.pointer = 0;
	this.index = index;
}


var width;
var height;
var message = "";
var editing = false;

var grid = [];

var player = new Loc();

var platforms = [];
var timers = [];

var level;


$(document).ready(function(){
	loadLevel(level);
});


function whichController() {

	for (var i = 0; i < platforms.length; i++) 
		if (player.x == platforms[i].controller.x && player.y + 1 == platforms[i].controller.y) 
			return i;
	return -1;
}


function canMoveTo(x,y) {
	if (x<0 || x >= width || y<0 || y>=height)
		return false;
	for (i in platforms) {
		if (x==platforms[i].pos.x && y==platforms[i].pos.y) return true;
	}
	
	if (grid[x][y] == 1 || grid[x][y] == 2) return false;
	return true;
}

function canPlatformMoveTo(x,y) {
	if (x<0 || x >= width || y<0 || y>=height)
		return false;
	for (i in platforms) {
		if (x==platforms[i].pos.x && y==platforms[i].pos.y) return false;
	}
	
	if (grid[x][y] != 1) return false;
	return true;
}

function interact() {
	if (editing) return;

	var idx = whichController();
	
	if (idx == -1) return;

	removeqattheend();

	for (i in platforms) {
		var p = platforms[i];
		var q = platforms[idx]
		if (q.start.x == p.pos.x && q.start.y==p.pos.y && p.index != q.index)
			return; 
	}
	
	var c = "Red";
	switch (idx) {
		case 0:
			c = "Red";
			break;
		case 1:
			c = "Blue";
			break;
	
	}
	message = c + " Platform Controller Version 1.4 Booted Up.\n" +
		"Platform Speed: <input id =\"length\" value = \""+platforms[idx].speed+"\"></input>"+
		"Tile/sec<br>" +
		"Available Commands: \nL,R,U,D<br>" +
		"Use ENTER to Execute or Q to quit<br>" +
		"Available Code Space = " +platforms[idx].codeLength;
	platforms[idx].pos.x = platforms[idx].start.x;
	platforms[idx].pos.y = platforms[idx].start.y;
	drawGrid();
	clearTimeout(timers[idx]);
	platforms[idx].pointer = 0;

	$("#code").attr("maxlength",platforms[idx].codeLength);
	$("#code").val(platforms[idx].code);
	$("#code").show().focus();
	editing = true;
	
	

	
}

function removeqattheend() {
	var idx = whichController();
	var q1 = platforms[idx].code;
	var q2 = platforms[idx].speed;
	if (q1.length > 0 && q1.substring(q1.length-1,q1.length) == "q")
		platforms[idx].code = q1.substring(0,q1.length-1);
	if (q2.length > 0 && q2.substring(q2.length-1,q2.length) == "q")
		platforms[idx].speed = q2.substring(0,q2.length-1);
}

validChar = function(char) {
	if (char == 'l' || char == 'r' || char == 'd' || char == 'u') 
		return true;
	return false;
}


Platform.prototype.processMove = function() {
	while (!validChar(this.code.charAt(this.pointer)) && this.pointer < this.code.length)
		this.pointer++;

	if (this.pointer == this.code.length) {
		this.pointer = 0;
		return;
	}
	var dx = 0;
	var dy = 0;
	switch (this.code.charAt(this.pointer)) {
		case "l":
			dx = -1;
			break;
		case "r":
			dx = 1;
			break;
		case "u":
			dy = 1;
			break;
		case "d":
			dy = -1;
			break;
	}
	this.pointer++;


	if (canPlatformMoveTo(this.pos.x +dx,this.pos.y +dy)) {

		if (player.x == this.pos.x && player.y == this.pos.y) {
			

			if (editing) {
				var idx = whichController();
				platforms[idx].speed = $("#length").val();

				message = "";
				$("#code").hide();
				editing = false;
				//$("#code").val($("#code").val().substring(0,$("#code").val().length-1));
				platforms[idx].code = $("#code").val().toLowerCase();
				drawGrid();
			}
			player.x += dx;
			player.y += dy;
		}
		this.pos.x += dx;
		this.pos.y += dy;
	}
	drawGrid();
	timers[this.index] = setTimeout(this.processMove.bind(this),1000.0/this.speed);
}

$(document).keyup(function(event){
	if (editing) {

		var idx = whichController();
		if (event.which == 81 || event.which == 13) {

			//removeqattheend();

			platforms[idx].speed = $("#length").val();

			message = "";
			$("#code").hide();
			editing = false;
			//$("#code").val($("#code").val().substring(0,$("#code").val().length-1));
			platforms[idx].code = $("#code").val().toLowerCase();
			drawGrid();
		}
		if (event.which == 13) {
			platforms[idx].processMove();
		}
		return;
	}

	//console.log("keycode",event.which);

	var newX = player.x;
	var newY = player.y;

	switch (event.which) {
		case 65: //a
			newX--;
			break;
		case 87: //w
			newY++;
			break;
		case 68: //d
			newX++;
			break;
		case 83: //s
			newY--;
			break;
		case 69: //e
			interact();
			break;
		case 82: //r
			loadLevel(level);
			return;
		default:
			return;
	}
	if (canMoveTo(newX,newY)) {
		player.x = newX;
		player.y = newY;
		if (grid[player.x][player.y] == 3) {
			message = "Success!";
			if (level+1 < levels.length) loadLevel(++level);
		}
	}
	drawGrid();
});

level = 0;

var levels = [{ grid:[  
"----------",
"-1.......-",
"----------",
"----------",
"----a-----",
"-........-",
"-.A..0...-",
"-........-",
"----------"
], platformInfo: {A:{length:3}}},


{ grid:[  
"----------",
"-1.......-",
"----------",
"----b-----",
"--a-------",
"-........-",
"-.A.B0...-",
"-........-",
"----------"
], platformInfo: {A:{length:2},B:{length:2}}},


{ grid:[  

"----------",
"-----1----",
"----------",
"----------",
"--.A-....-",
"--.0abB..-",
"----------"
], platformInfo: {A:{length:4},B:{length:5}}}

];

function find(level, char) {
	var levelCode = levels[level]["grid"];
	var h = levelCode.length;
	var w = levelCode[0].length;
	for (var i = 0; i < w; i++) 
		for (var j = 0; j < h; j++) 
			if (levelCode[height-1-j].charAt(i) == char)
				return new Loc(i,j);
}

function loadLevel(level) {
	if (level == 0) {
		message = "WASD to move. E to interact. R to reset.";
	}
	if (level == 2) {
		message = "Speed is Important";
	}

	platforms = [];
	timers = [];

	var levelCode = levels[level]["grid"].slice(0);
	height = levelCode.length;
	width = levelCode[0].length;



	for (i = 0; i < width; i++) {
		grid[i] = [];
		for (j = 0; j < height; j++) {
			grid[i][j] = 0;
	}}
	

	for (i = 0; i < width; i++) {
		for (j = 0; j < height; j++) {
			var val = 0;

			var char = levelCode[height-1-j].charAt(i);

			if (char >= "A" && char <= "Z") {
				
				platforms.push(
					new Platform(platforms.length,new Loc(i,j),
						find(level,char.toLowerCase()),
						//levels[level]["platformInfo"][char]["speed"], 
						levels[level]["platformInfo"][char]["length"]));
				val = 2;

			}
			else if (char >= "a" && char <= "z") {

				val = 1;
			}
			else {
			switch (char) {
				case ".":
					val = 0;
					break;
				case "-": 
					val = 1;
					break;
				case "0":
					val = 0;
					player = new Loc(i,j)
					break;
				case "1":
					val = 3;
					break;

			}}
			grid[i][j] = val;

		}
	}
	drawGrid();
}
