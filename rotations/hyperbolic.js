var xmin = 0.;
var xmax = 3.;
var ymin = 0.;
var ymax = 3.;

var grid2 = [1/3,2/3,3,2];

var offset = 0.4;

function applyFLT(x,y,m) { //m is 4 long array representing 2x2 matrix

	var denom = Math.pow((m[2]*x+m[3]),2) + m[2]*m[2]*y*y;

	return [ ((m[0]*x+m[1])*(m[2]*x+m[3]) + m[0]*m[2]*y*y) / denom,
				(m[0]*m[3]*y - m[1]*m[2]*y) / denom     ];

}

function rotate(x,y) {
	return applyFLT(x,y,[0,-1,1,-1]);
}

function dist(x1,y1,x2,y2) {
	return Math.pow((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1),.5);
}

function invX(x) {
	return x/width*(xmax-xmin) + xmin;
}
function invY(y) {
	return (height- y)/height*(ymax-ymin) + ymin;
}

function getX(x) {
	return (x - xmin)/(xmax - xmin)*width;
}
function getY(y) {
	return height - (y - ymin)/(ymax - ymin)*height;
}

function point(x,y,color) {
	ctx.beginPath();
	ctx.arc(getX(x),getY(y),5,0,2*Math.PI);
	ctx.fillStyle = color;
	ctx.fill();
}

function line(x1,y1,x2,y2,color,ctx) {
	ctx.beginPath();
	ctx.moveTo((x1-xmin)/(xmax-xmin)*width, height- (y1-ymin)/(ymax-ymin)*height);
	ctx.lineTo((x2-xmin)/(xmax-xmin)*width, height- (y2-ymin)/(ymax-ymin)*height);
	ctx.strokeStyle = color;
	ctx.stroke();
}
function arc(x1,x2,color,ctx) {
	ctx.beginPath();
	ctx.arc(getX(x1/2.+x2/2.),getY(0),(x2-x1)/2./(xmax-xmin)*width,Math.PI,2*Math.PI);
	ctx.strokeStyle = color;
	ctx.stroke();
}

function rotPoint(x,y,offset) {
	x = x - offset;
	var p0 = [x,y];
	var p1;

	var k = Math.floor(p0[0]);

	p0[0] = p0[0] - k;

	if (dist(p0[0],p0[1],.5,0) > 0.5) {
		p1 = rotate(p0[0],p0[1]);		
	}
	else {

		var v1 = 0.0;
		var v2 = 0.5;
		var v3 = 1.0;

		var n = 3;

		while (true) {

			var d1 = (v2 - v1)/2.0;
			var d2 = (v3 - v2)/2.0;
			var left = (dist(p0[0],p0[1],v1+d1,0) < d1);
			var right = (dist(p0[0],p0[1],v2+d2,0) < d2);
			if (!(left || right)) break;

			if (left) {
				v3 = v2;
			}
			else if (right) {
				v1 = v2;
			}

			var flag = false;
			while (true) {
				for (var a = 1; a < n; a++) {
					if (a/n > v1 && a/n < v3) {
						v2 = a/n;
						flag = true;
						break;
					}
				}
				n++;
				if (flag) break;
			}
		
		}

		var trans = applyFLT(p0[0],p0[1],
			[v3-v1, -v2*(v3-v1), v3-v2, -v1*(v3-v2)]);
		var transrot = rotate(trans[0],trans[1]);
		p1 = applyFLT(transrot[0],transrot[1],
			[-v1/(v3-v1)/(v2-v1), v2/(v3-v2)/(v2-v1), -1/(v3-v1)/(v2-v1), 1/(v3-v2)/(v2-v1)]);


	}



	p1[0] = p1[0] + k + offset;
	//point(p1[0],p1[1],"#FF0000");
	return p1;
}

function drawHyperbolicTiling() {
	
	for (var i = -1; i < 5; i++) {
		line(i,ymin,i,ymax,"#000000",ctx);
		line(i+offset,ymin,i+offset,ymax,"#0000FF",ctx);

		var list = [0,1];
		for (var n = 1; n < 25; n++) {
			for (var a = 1; a < n; a++) {
				list.push(a/n);
			}
			list.sort();
			for (var idx = 0; idx < list.length-1; idx++) {
				arc(i+list[idx],i+list[idx+1],"#000000",ctx);
				arc(i+offset+list[idx],i+offset+list[idx+1],"#0000FF",ctx);

				/*var p1 = applyFLT(i+list[idx],0,grid2);
				var p2 = applyFLT(i+list[idx+1],0,grid2);
				var cen = applyFLT(i+list[idx]/2+list[idx+1]/2,0,grid2);

				var theta1 = Math.atan((p2[1]-cen[1])/(p2[0]-cen[0]));
				var theta2 = Math.atan((p2[1]-cen[1])/(p2[0]-cen[0]));
				var rad = dist(cen[0],cen[1],p1[0],p1[1]);
				ctx.beginPath();
				ctx.arc(cen[0],cen[1],rad,theta1,theta1);
				ctx.strokeStyle = "#0000FF";
				ctx.stroke(); */


			}
			
			
		}
	}
	
	if (invX(mousex) > 0) createPath();

		
}

function createPath() {
	var p0 = [invX(mousex),invY(mousey)];
	var cur = [p0[0],p0[1]];
	var next;
	var i = 0;

	
	while (true) {
		i++;
		point(cur[0],cur[1],"#FF0000");
		next = rotPoint(cur[0],cur[1],0);
		line(cur[0],cur[1],next[0],next[1],"#000000",ctx);
		cur = [next[0],next[1]];
		point(cur[0],cur[1],"#FF0000");

		next = rotPoint(cur[0],cur[1],offset)
		line(cur[0],cur[1],next[0],next[1],"#000000",ctx);
		cur = [next[0],next[1]];

		if ((cur[0].toFixed(5) == p0[0].toFixed(5)) && (cur[1].toFixed(5) == p0[1].toFixed(5))) break;
		if (i > 10) break;
	}
}