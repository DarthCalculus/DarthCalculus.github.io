var canvas = $("#canvas").get(0);
var ctx = canvas.getContext("2d");
var canvas2 = $("#canvas2").get(0);
var ctx2 = canvas2.getContext("2d");
var width = canvas.width;
var height = canvas.height;

var cache = [];

var cfarray;

function plotPoint(pt,color,radius) {
	ctx.beginPath();
	ctx.arc(pt.x*width/xRange,height-pt.y*height/yRange,radius,0,2*Math.PI);
	ctx.fillStyle = color;
	ctx.fill();
}

function drawLine(p1,p2,color,ctx) {
	ctx.beginPath();
	ctx.moveTo(p1.x*width/xRange, height- p1.y*height/xRange);
	ctx.lineTo(p2.x*width/xRange, height - p2.y*height/xRange);
	ctx.strokeStyle = color;
	ctx.stroke();
}

function drawCenteredGridLines(scale,color) { 
	for (var i = 0; i*scale < xRange; i++) {
		drawLine(new Point(i*scale,-yRange),new Point(i*scale,yRange),color);
		drawLine(new Point(-i*scale,-yRange),new Point(-i*scale,yRange),color);
	}
	for (var i = 0; i*scale < yRange; i++) {
		drawLine(new Point(-xRange,i*scale),new Point(xRange,i*scale),color);
		drawLine(new Point(-xRange,-i*scale),new Point(xRange,-i*scale),color);
	}
}

function drawGridLines(scale,color,ctx) {

	var save = xRange;
	xRange = computeZoom(ratio);

	for (var i = 0; i*scale < xRange; i++) {
		drawLine(new Point(i*scale,-xRange),new Point(i*scale,xRange),color,ctx);
		drawLine(new Point(-xRange,i*scale),new Point(xRange,i*scale),color,ctx);
	}
	xRange = save;
}

function drawPath(points) {
	var c = "#"+String(Math.round(1000000*Math.random()));
	console.log(c);
	/*
	for (var i = 0; i < points.length-1; i += 2) {
		
		drawLine(points[i],points[i+1],"#000000",ctx);

	}
	*/

	var message;
	var xsave = xRange;
	xRange = computeZoom(ratio);
	//xRange = 70 ;
	//drawGridLines(ratio,"#FF0000",ctx2);
	//drawGridLines(1,"#0000FF",ctx2);
	for (var i = 0; i < points.length-1; i += 2) {
		//drawLine(points[i],points[i+1],"#000000");
		//drawLine(points[i+1],points[i+2],"#000000");
		drawLine(points[i],points[i+1],c,ctx2);
		drawLine(points[i+1],points[i+2],c,ctx2);
/*
		if (i % 4 == 0) {
			ctx2.beginPath();
			var pt = points[i+1];
			ctx2.arc(pt.x*width/xRange,height-pt.y*height/xRange,4,0,2*Math.PI);
			ctx2.fillStyle = "#FF0000";
			ctx2.fill();
		}
		*/
	}
	
	message =  "Returned after " + (points.length-1)/4 + " iterations!<br>"+
	"Zoomed out to " + xRange;

	$("#message").html(message);
	xRange = xsave;
}

function calculatePath(pt,useTimeout) {
	var points = [];

	var start = new Point(pt.x,pt.y);
	var p1 = new Point(start.x,start.y);
	

	points.push(new Point(p1.x, p1.y));

	var p2;
	for (var i = 1; true; i++)
	{
		if(useTimeout) if (i > timeout) return [];

		p2 = new Point(p1.x,p1.y);
		rotateSquare(p2, 1.);

		p1 = p2;

		points.push(new Point(p1.x, p1.y));
		p2 = new Point(p1.x,p1.y);
		rotateSquare(p2, ratio);

		

		p1 = p2;

		if (p1.x.toFixed(4) == start.x.toFixed(4) && p1.y.toFixed(4) == start.y.toFixed(4)) {
			break;
		}
		points.push(new Point(p1.x, p1.y));
	}
	points.push(new Point(points[0].x,points[0].y));


	return points;
}

function plotRegions() {
	var tile = ratio/computeZoom(ratio);
	for (var x = tile/2.1; x < xRange; x+= tile) for (var y = tile/2.1; y < xRange; y+=tile) {

		var returnTime = (calculatePath(new Point(x,y),true).length - 1)/2;
		var color;
		switch (returnTime) {
			case 284:
				color = "#FF0000";
				break;
			case 12:
				color = "#0000FF";
				break;
			case 4:
				color = "#C590D4";
				break;
			case 2:
				color = "#000000";
				break;
			case 30:
				color = "#00FF00";
				break;
			default:
				//console.log(returnTime);
				color = "#FFFFFF";

		}

		plotPoint(new Point(x,y),color ,3);

	}
}

function closePaths(path1,path2,maxDistance) {
	if (path1.length != path2.length) return false;
	for (var i = 0; i < path2.length; i++) {
		if (Math.abs(path1[i].x - path2[i].x) > maxDistance
		 || Math.abs(path1[i].y - path2[i].y) > maxDistance) return false;
	}
	return true;
}

function outlineRegions() {
	var results = {};

	//console.log("Permutation of minimal tiles:");
	var z = computeZoom(ratio);
	var tile = ratio/z;
	var wid= Math.round(xRange/tile);

	var arr = new Array(wid);
	for (var i = 0; i < wid; i++) {
		var foo = new Array(wid);
		for (var ii = 0; ii < wid; ii++) {
			foo[ii]= false;
		}
  		arr[i] = foo;
	}

	for (var i = 0; i < wid; i++) for (var j = 0; j < wid; j++) {
		if (arr[i][j]) continue;

		box = computeRegion(new Point(tile*(i+.3),tile*(j+.3)));

		var area = Math.round((box[1] - box[0])/tile)*Math.round((box[3] - box[2])/tile);


		//console.log(area + " cycles of length " + box[4]);
		
		var str = String(box[4]);
		if (str in results) {
			results[str] += area;
		}
		else {
			results[str] = area;
		}


		for (var x = Math.round(box[0]/tile); x < Math.round(box[1]/tile); x++) 
			for (var y = Math.round(box[2]/tile); y < Math.round(box[3]/tile); y++) {
				arr[x][y] = true;
			}
			
	} 
	for (num in results) {
		//console.log(results[num]/num + " cycles of order " + num);
	}


/*
	var up;
	if (cfarray.length % 2 == 0) up = true;
	else up = false;

	for (var i = 0; i < cfarray[0]; i++) {
		var box;
		if (up) {
			box = [0,tile,i*tile,(i+1)*tile];
		}
		else {
			box = [i*tile,(i+1)*tile,0,tile];
		}
		drawBox(box,"#0000FF");
	}
	for (var i = 0; i < cfarray[1]; i++) {

		if (up) {
			var box = [tile*(cfarray[0]*i+1), 
						tile*cfarray[0]*(i+1), 0, tile*cfarray[0]];
			
		}
		drawBox(box,"#0000FF");

		for (var j = 0; j < cfarray[0]; j++) {
			var box;
			if (up) {
				box = [cfarray[0]*tile*(i+1),tile*(cfarray[0]*(i+1)+1),j*tile,(j+1)*tile];
			}
			else {
				box = [j*tile,(j+1)*tile,0,tile];
			}
			drawBox(box,"#0000FF");
		}
	}


*/

	//drawLine(new Point(0,0),new Point(1,1),"#000000",ctx);
}


function iterate(rect,isVert,cf) {
	cf = cf.slice(0,cf.length);
	if (cf.length == 0) return;
	var val = cf.shift();

	var prev = 0;
	var next = ratio/computeZoom(ratio);
	for (var i = cf.length-1; i > 0; i--) {
		var temp = next;
		next = cf[i]*next + prev;
		prev = temp;
	}
	

	if (cf.length == 0) next = 0;

	if (isVert) {
		var w = rect[1]-rect[0];
		var h = rect[3]-rect[2];
		
		var newh = next;
		for (var i = 0; i <= val; i++) {
			var newrect = [rect[0],rect[1],rect[2]+w*i,rect[2]+w*i + newh];
			if (newh != 0) iterate(newrect,false, cf);
			var newbox = [rect[0],rect[1],rect[2]+w*i+newh,rect[2]+w*(i+1)];
			if ( i != val) {
				drawBox(newbox,"#00FF00");
				
			}
		}
	}
	else {
		var w = rect[1]-rect[0];
		var h = rect[3]-rect[2];

	
		var neww = next;
		for (var i = 0; i <= val; i++) {
			var newrect = [rect[0]+h*i,rect[0]+h*i + neww,rect[2],rect[3]];
			if (neww != 0) iterate(newrect,true, cf);
			var newbox = [rect[0]+h*i+neww,rect[0]+h*(i+1),rect[2],rect[3]];
			if (i != val) {
				drawBox(newbox,"#00FF00");
				
			}	
		}
	}
}

function draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
	
	
	if (!showPath) {
		//drawGridLines(ratio,"#000000",ctx);
		//drawGridLines(1,"000000",ctx);
	}
	//console.log(showPath,showRegions,showDots,showIdeal);
	//drawHyperbolicTiling();
	
	if (showRegions) {
		if (cache.length == 0) outlineRegions();
		else drawCache();
	}
	if (showDots) plotRegions();

	if (showPath) {
		/*
		for (var i = 2; i < 50; i++) {
			ratio = evalFraction([1,i,2]);
			var pts = calculatePath ( new Point ((ratio-1)/2., 3./(4*i+2),false));

			drawPath(pts);

		}*/
		var points = calculatePath (new Point(startx,starty),false);
		console.log(points);
		plotPoint(points[0],"#FF0000",8);

		//drawGridLines(ratio,"#000000",ctx2);
		//drawGridLines(1,"#CCCCCC",ctx2);

		drawPath(points);
		computeRegion(new Point(startx,starty));
	}
	if (showIdeal) {
		cfarray = generateFraction(ratio);

		iterate([0,ratio-1,0,1],true,cfarray.slice(1,cfarray.length));
	}

	//for (idx in points) {
	//		console.log(idx,points[idx].x.toFixed(1),points[idx].y.toFixed(1));
	//}	

}

var mousex;
var mousey;

$("#canvas").click(function(event) {
	mousex = event.clientX - canvas.offsetLeft;
	mousey = event.clientY - canvas.offsetTop;
	startx = .001*Math.round(1000*mousex*xRange/width);
	starty = .001*Math.round(1000*(height - mousey)*xRange/height);
	$("#startx").val(startx);
	$("#starty").val(starty);
	//console.log(startx,starty);
	draw();
});

function northDist(pt,ratio) {
	var y1 = pt.y;
	var y2 = pt.y;
	while (y1 > 0) {
		y1 = y1 -1;
	}
	while (y2 > 0) {
		y2 = y2 -ratio;
	}
	y1 = -1*y1;
	y2 = -1*y2;
	return Math.min(y1,y2);
}

function southDist(pt,ratio) {
	var y1 = pt.y;
	var y2 = pt.y;
	while (y1 > 1) {
		y1 = y1 -1;
	}
	while (y2 > ratio) {
		y2 = y2 -ratio;
	}
	return Math.min(y1,y2);
}
function eastDist(pt,ratio) {
	var y1 = pt.x;
	var y2 = pt.x;
	while (y1 > 0) {
		y1 = y1 -1;
	}
	while (y2 > 0) {
		y2 = y2 -ratio;
	}
	y1 = -1*y1;
	y2 = -1*y2;
	return Math.min(y1,y2);
}
function westDist(pt,ratio) {
	var y1 = pt.x;
	var y2 = pt.x;
	while (y1 > 1) {
		y1 = y1 -1;
	}
	while (y2 > ratio) {
		y2 = y2 -ratio;
	}
	return Math.min(y1,y2);
}
function computeRegion(pt) {
	var pts = calculatePath(pt,true);

	var numIter = (pts.length - 1)/4;

	var array;

	if (pts.length == 0) {

		var tile = ratio/computeZoom(ratio);
		array = [pt.x-westDist(pt,tile),
			pt.x+eastDist(pt,tile),
			pt.y-southDist(pt,tile),
			pt.y+northDist(pt,tile),0]

	}
	else {
		var north = 1;
		var south = 1;
		var east = 1;
		var west = 1;

		for (var i = 0; i < numIter;i++) {

			var idx = 4*i;

			north = Math.min(
				north,
				northDist(pts[idx],ratio),
				westDist(pts[idx+1],ratio),
				southDist(pts[idx+2],ratio),
				eastDist(pts[idx+3],ratio));

			west = Math.min(
				west,
				northDist(pts[idx+3],ratio),
				westDist(pts[idx],ratio),
				southDist(pts[idx+1],ratio),
				eastDist(pts[idx+2],ratio));
			south = Math.min(
				south,
				northDist(pts[idx+2],ratio),
				westDist(pts[idx+3],ratio),
				southDist(pts[idx],ratio),
				eastDist(pts[idx+1],ratio));
			east = Math.min(
				east,
				northDist(pts[idx+1],ratio),
				westDist(pts[idx+2],ratio),
				southDist(pts[idx+3],ratio),
				eastDist(pts[idx],ratio));


		}
		array = [pt.x-west,pt.x+east,pt.y-south,pt.y+north,numIter];
	}
	
	drawBox(array,"#FF0000");
	cache.push(array);
	return array;
	

}

function drawBox(arr,color) {
	drawLine(new Point(arr[0],arr[3]), 
			new Point (arr[1],arr[3]), color,ctx);
	drawLine(new Point(arr[0],arr[3]), 
			new Point (arr[0],arr[2]), color,ctx);
	drawLine(new Point(arr[1],arr[2]), 
			new Point (arr[1],arr[3]), color,ctx);
	drawLine(new Point(arr[0],arr[2]), 
			new Point (arr[1],arr[2]), color,ctx);
}

function drawCache() {
	for (idx in cache) {
		drawBox(cache[idx],"#FF0000");
	}
}