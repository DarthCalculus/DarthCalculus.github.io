function Point(x,y) {
	this.x = x;
	this.y = y;
}

function rotateSquare(pt,scale) {
	var shiftx = 0;
	var shifty = 0;
	while (pt.x > scale) { 
		pt.x = pt.x - scale;
		shiftx++;
	}
	while (pt.y > scale) {
		pt.y = pt.y - scale;
		shifty++;
	}
	while (pt.x < 0) {
		pt.x = pt.x + scale;
		shiftx--;
	}
	while (pt.y < 0) {
		pt.y = pt.y + scale;
		shifty--;
	}

	var newy = pt.x;
	var newx = scale - pt.y;

	pt.x = newx + scale*shiftx;
	pt.y = newy + scale*shifty;
}

var showPath = false;
var showDots = false;
var showRegions = true;
var showIdeal = false;

var ratio = 1.7;
var startx = .001*Math.round(1000*ratio/computeZoom(ratio)/2.);
var starty = .001*Math.round(1000*ratio/computeZoom(ratio)/2.);
var xRange = 1.;//computeZoom(ratio);
var yRange = 1.;//computeZoom(ratio);
var timeout = 10000;


$(document).ready(function(){ 
	$("#zoom").val(xRange);
	$("#timeout").val(timeout);
	$("#startx").val(startx);
	$("#starty").val(starty);
	$("#ratio").val(ratio);
	draw(); 
});

$("#apply").click(function(){
	cache = [];
	xRange = parseFloat($("#zoom").val());
	yRange = parseFloat($("#zoom").val());
	startx = parseFloat($("#startx").val());
	starty = parseFloat($("#starty").val());
	timeout = parseFloat($("#timeout").val());
	ratio = eval($("#ratio").val());

	var cf = $("#cf").val();
	if (cf != "") ratio = evalFraction(cf.split(","));
	$("#ratio").val(ratio);
	draw();
});

$("#zoomout").click(function(){
	cache = [];
	xRange = computeZoom(ratio);
	yRange = xRange;
	draw();
	$("#zoom").val(xRange);
});

function computeZoom(r) {
	for (var i = 1; true; i++) {
		var z = i*r;
		var string = z.toFixed(5);
		if (string.substring(string.length-5,string.length) == "00000") {
			return Math.round(i*r);
		}
	}
}

$("#regOn").click(function(){
	showRegions = true;
	draw();
});
$("#regOff").click(function(){
	showRegions = false;
	draw();
});
$("#pathOn").click(function(){
	showPath = true;
	$("#canvas2").show();
	draw();
});
$("#pathOff").click(function(){
	showPath = false;
	$("#canvas2").hide();
	draw();
});

$("#dotsOn").click(function(){
	showDots = true;
	draw();
});
$("#dotsOff").click(function(){
	showDots = false;
	draw();
});

$("#idealOn").click(function(){
	showIdeal = true;
	draw();
});
$("#idealOff").click(function(){
	showIdeal = false;
	draw();
});

function evalFraction(array) {
	
	for (var i = 0; i < array.length; i++) {
		array[i] = parseInt(array[i]);
	}
	cfarray = array.slice(0,array.length);
	array = array.reverse();
	var result = parseInt(array[0]);
	for (var i = 1; i < array.length; i++) {
		result = 1.0/result + array[i];
	}
	return result;
}

function generateFraction(val) {
	var res = [];
	while (true) {
		floor = Math.floor(val);
		res.push(floor);
		if (val.toFixed(5) == floor.toFixed(5)) break;
		val = 1./(val-floor);
	}
	return res;
}