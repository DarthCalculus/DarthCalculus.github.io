var perm = []
var original = []

function validCDRmoves(perm) {
	var res = []
	var i
	for (i = 1; i < perm.length; i++) 
		if (perm.includes(i) != perm.includes(i+1)) 
			res.push(i)
	return res
}
function validCDSmoves(perm) {
	var res = []
	var i
	for (i = 1; i < perm.length-1; i++) {
		if (perm.includes(i) != perm.includes(i+1)) 
	  		continue
	  	var j
		for (j = i+1; j < perm.length; j++) {
		  	if (perm.includes(j) != perm.includes(j+1)) 
		   		continue
		  	if (cross(perm,i,j))
		    	res.push([i,j])
		}
	}
	return res
}


// perm is an array, p > 0 is the lower number of the pointer
function cdr(perm, p) {
	
	var s1 = Math.min(indOf(perm, p),indOf(perm, p+1))
	var s2 = Math.max(indOf(perm, p),indOf(perm, p+1))
	var offset = perm.includes(p)

	var a = perm.slice(0,s1+offset)
	var b = perm.slice(s1+offset,s2+offset)
	var c = perm.slice(s2+offset)
	b = b.reverse().map(function(x){return -x})
	return a.concat(b,c)
}

function cds(perm, pq) {
	var p = pq[0]
	var q = pq[1]

	var i1 = 2*indOf(perm, p)
	var i2 = 2*indOf(perm, p+1)+1
	var i3 = 2*indOf(perm, q)
	var i4 = 2*indOf(perm, q+1)+1

	var s1 = Math.min(i1,i2,i3,i4)
	var s2 = Math.max(Math.min(i1,i2,i3),Math.min(i1,i2,i4),
					  Math.min(i1,i3,i4),Math.min(i2,i3,i4))
	var s3 = Math.min(Math.max(i1,i2,i3),Math.max(i1,i2,i4),
					  Math.max(i1,i3,i4),Math.max(i2,i3,i4))
	var s4 = Math.max(i1,i2,i3,i4)

	var t1 = [Math.floor(s1/2), s1%2]
	var t2 = [Math.floor(s2/2), s2%2]
	var t3 = [Math.floor(s3/2), s3%2]
	var t4 = [Math.floor(s4/2), s4%2]

	var u1 = t1[0] + ((perm[t1[0]] > 0) != t1[1])
	var u2 = t2[0] + ((perm[t2[0]] > 0) != t2[1])
	var u3 = t3[0] + ((perm[t3[0]] > 0) != t3[1])
	var u4 = t4[0] + ((perm[t4[0]] > 0) != t4[1])

	if (t1[0] == t2[0]) {
		u1 = t1[0]
		u2 = t1[0]+1
	}
	if (t2[0] == t3[0]) {
		u2 = t2[0]
		u3 = t2[0]+1
	}
	if (t3[0] == t4[0]) {
		u3 = t3[0]
		u4 = t3[0]+1
	}

	var c1 = perm.slice(0,u1)
	var c2 = perm.slice(u1,u2)
	var c3 = perm.slice(u2,u3)
	var c4 = perm.slice(u3,u4)
	var c5 = perm.slice(u4)

	var result = c1.concat(c4,c3,c2,c5)

	return result
}
//p and q are the lower numbers of the pointers
function cross(perm, p ,q) {
	if (p == q) return False
	if (p > q) {
		var temp = p
		p = q
		q = temp
	}
	var i1 = indOf(perm,p)
	var i2 = indOf(perm,p+1)
	var i3 = indOf(perm,q)
	var i4 = indOf(perm,q+1)

	if (p+1 == q) {
		var res;
		if (i1 < i2 && i2 < i4)
			res = false
		else if (i1 > i2 && i2 > i4)
			res = true
		else if (i1 < i4)
			res = true
		else if (i4 < i1)
			res = false

		if (perm.includes(q))
			return res
		else 
			return !res
	}
	
	if (Math.min(i3,i4) > Math.max(i1,i2))
		return false
	else if (Math.min(i1,i2) > Math.max(i3,i4))
	 	return false
	else if (i1 < Math.min(i3,i4) && i2 > Math.max(i3,i4))
	 	return false
	else if (i2 < Math.min(i3,i4) && i1 > Math.max(i3,i4))
	  	return false 
	else if (i3 < Math.min(i1,i2) && i4 > Math.max(i1,i2))
	  	return false
	else if (i4 < Math.min(i1,i2) && i3 > Math.max(i1,i2))
	  	return false
	else
	  	return true
	
}
function indOf(perm, p) {
	if (perm.includes(p))
		return perm.indexOf(p)
	else 
		return perm.indexOf(-p)
}


function add_one(perm,a) {
	var n = perm.length
	if (a == (n+1))
		return -1*(n+1)
	else
		return a+1
}
function comes_before(perm,a){
	var n = perm.length
	
	if (a == -(n+1))
		return n+1
	else if (a == 0)
		return -perm[0]
	else if (a == n+1)
		return perm[n-1]

	var i = perm.indexOf(a)
	var j = perm.indexOf(-a)

	if (i == 0)
		return 0
	else if (i > 0) 
		return perm[i-1]
	else if (j < n-1)
	 	return -perm[j+1]
	else 
	 	return -(n+1)
}
function strategic_cycle(perm){
	var n = perm.length
	var cycle = [n]
	var v = n
	while (true) {
		v = comes_before(perm,add_one(perm,v))
		if (v == n)
	  		break
		cycle.push(v)
	}
	return cycle
}
function terminal_point(i,n){
	var res = []
	var x
	if (i > 0) {
		for (x = i+1; x < n+1; x++)
			res.push(x)
		for (x = 1; x < i+1; x++)
			res.push(x)
	}
	else {
		for (x = i+1; x < 0; x++)
			res.push(x)
		for (x = -n; x < i+1; x++)
			res.push(x)
	}
	return res
}

function setup_perm() {
	var x
	var HTML  = "["
	for (x = 0; x < perm.length; x++) {
		HTML += "<span id = \"s"+(2*x)+"\" class = \"num\">"+perm[x]+"</span><span id = \"s"+
								(2*x+1)+"\" class = \"num\">"
		if (x != perm.length -1) 
			HTML += ", </span>"
		else 
			HTML += "</span>]"
	}
	document.getElementById("perm").innerHTML = HTML
}

function cdr_hover(p){
	var offset = perm.includes(p)
	var s1 = Math.min(indOf(perm, p),indOf(perm, p+1)) + offset
	var s2 = Math.max(indOf(perm, p),indOf(perm, p+1)) + offset

	var i
	for (i = 2*s1; i <= 2*(s2-1); i++) {
		document.getElementById("s"+i).style.background = "lime"
	}
	
}

function cds_hover(pq){
	var p = pq[0]
	var q = pq[1]

	var i1 = 2*indOf(perm, p)
	var i2 = 2*indOf(perm, p+1)+1
	var i3 = 2*indOf(perm, q)
	var i4 = 2*indOf(perm, q+1)+1

	var s1 = Math.min(i1,i2,i3,i4)
	var s2 = Math.max(Math.min(i1,i2,i3),Math.min(i1,i2,i4),
					  Math.min(i1,i3,i4),Math.min(i2,i3,i4))
	var s3 = Math.min(Math.max(i1,i2,i3),Math.max(i1,i2,i4),
					  Math.max(i1,i3,i4),Math.max(i2,i3,i4))
	var s4 = Math.max(i1,i2,i3,i4)

	var t1 = [Math.floor(s1/2), s1%2]
	var t2 = [Math.floor(s2/2), s2%2]
	var t3 = [Math.floor(s3/2), s3%2]
	var t4 = [Math.floor(s4/2), s4%2]

	var u1 = t1[0] + ((perm[t1[0]] > 0) != t1[1])
	var u2 = t2[0] + ((perm[t2[0]] > 0) != t2[1])
	var u3 = t3[0] + ((perm[t3[0]] > 0) != t3[1])
	var u4 = t4[0] + ((perm[t4[0]] > 0) != t4[1])

	if (t1[0] == t2[0]) {
		u1 = t1[0]
		u2 = t1[0]+1
	}
	if (t2[0] == t3[0]) {
		u2 = t2[0]
		u3 = t2[0]+1
	}
	if (t3[0] == t4[0]) {
		u3 = t3[0]
		u4 = t3[0]+1
	}



	var i
	for (i = 2*u1 - (u1 == u2); i < 2*u2; i++) {
		document.getElementById("s"+i).style.background = "lime"
	}
	for (i = 2*u3 - (u3 == u4); i < 2*u4; i++) {
		document.getElementById("s"+i).style.background = "cyan"
	}

}

function update(){
	setup_perm()
	var cdr_moves = validCDRmoves(perm)
	var cds_moves = validCDSmoves(perm)
	var cdr_buttons = document.getElementById("cdr_buttons")
	var cds_buttons = document.getElementById("cds_buttons")

	cdr_buttons.innerHTML = ""
	cds_buttons.innerHTML = ""

	cdr_moves.forEach(function(x){
		var button = document.createElement("button")
		button.innerHTML = "("+x+", "+(x+1)+")"
		button.onclick = function(){
			perm = cdr(perm,x)
			update()
		}
		button.onmouseover = function(){
			cdr_hover(x)
		}
		button.onmouseout = function(){
			var elements = document.getElementsByClassName("num");
    		for (var i = 0; i < elements.length; i++) {
        		elements[i].style.background = "";
    		}
		}
		cdr_buttons.appendChild(button)
	})
	cds_moves.forEach(function(x){
		var button = document.createElement("button")
		button.innerHTML = "("+x[0]+", "+(x[0]+1)+"), ("+x[1]+", "+(x[1]+1)+")"
		button.onclick = function(){
			perm = cds(perm,x)
			update()
		}
		button.onmouseover = function(){
			cds_hover(x)
		}
		button.onmouseout = function(){
			var elements = document.getElementsByClassName("num");
    		for (var i = 0; i < elements.length; i++) {
        		elements[i].style.background = "";
    		}
		}
		cds_buttons.appendChild(button)
	})

	

}

function randomPerm(){
	perm = []
	var i
	for (i = 1; i <= document.getElementById("length").value; i++) 
		perm.push(i)

	perm.sort(function(a, b){return 0.5 - Math.random()})

	perm = perm.map(function(x){
		return x*(Math.floor(Math.random()*2)*2-1)
	})
}
function generatePerm() {
	original = perm.slice()

	var cycle = strategic_cycle(perm)
	var n = perm.length
	var message
	if (cycle.includes(-1)) {
		message = "This permutation is reverse sortable. When there are no more moves left,"+
					" you will get ["+terminal_point(-1,n).join(", ") + "]"
	}
	else if (cycle.includes(0)) {
		message = "This permutation is not sortable. When there are no more moves left,"+
					" you will get one of the following possibilities:<br>" 
		var x
		for (x = 1; cycle[x] != 0; x++) {
			message += "<span id = \"t"+x+"\">["+ terminal_point(cycle[x],n).join(", ") + 
							"]</span><br>"
		}
	}
	else {
		message = "This permutation is sortable. When there are no more moves left,"+
					" you will get ["+terminal_point(n,n).join(", ") + "]"
	}
	document.getElementById("info").innerHTML = message
	if (cycle.includes(0)) {
		var x
		for (x = 1; cycle[x] != 0; x++) {
			
			document.getElementById("t"+x).onclick = (function() {
    			var j = x; 
    			return function() {
    				var term = document.getElementById("t"+j)
    				if (term.style.background != "red")
      					term.style.background = "red"
      				else 
      					term.style.background = "orange"
   				 }
  			})() 
		}
	}
}





function init() {
	randomPerm()
	generatePerm()
	update()
	document.getElementById("new").onclick = function(){
		randomPerm()
		generatePerm()
		update()
	}
	document.getElementById("reset").onclick = function(){
		perm = original
		update()
	}
	document.getElementById("set").onclick = function(){
		perm = document.getElementById("input_perm").value.split(" ").map(function(x){
			return Number(x)
		})
		generatePerm()
		update()
	}
}

init()