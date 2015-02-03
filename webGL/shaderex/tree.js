

//settings (some should not be global TODO)
var g_EyeX = 0.20, g_EyeY = 0.95, g_EyeZ = 2.25; // initial Eye position
var numTrees=500;
var NNN=1 << 8;
var sizeScale=0.3;
var varyingScale=7.0/9.0;
var timeFactor = 1.0/10.0;


//consts
var PI=Math.PI;



var canvas,gl,n,update,viewMatrix,u_ViewMatrix,u_ProjMatrix;
var lineModel,triModel;

var projMatrix;
var allType,lButton,rButton;

function main() 
{
	canvas = document.getElementById('webgl');

	gl = getWebGLContext(canvas);
	if (!gl) 
	{
		alert('Failed to get the rendering context for WebGL');
		return;
	}

	var VSHADER_SOURCE=document.getElementById('treeVert').innerText;
	var FSHADER_SOURCE=document.getElementById('treeFrag').innerText;

	allType=document.getElementById('alltype');
	lButton=document.getElementById('lbutton');
	rButton=document.getElementById('rbutton');


	//alert('start'+VSHADER_SOURCE+"_____\n"+FSHADER_SOURCE);
	var resultFromShader = initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE); 
	if (!resultFromShader){
		alert('Failed to intialize shaders.'+resultFromShader);
		return;
	}

	// Set the vertex coordinates etc
	var randForLocations=new RNG("fifty-seven");
	var arrPointh=generateRandomPointsNearby(randForLocations,numTrees);  
		
	//globals, later we'll need to update these based on "not repainting the whole world at 60fps"
	lineModel = initVertexBuffers_trees(gl,arrPointh);
	triModel = initVertexBuffers_land(gl,arrPointh);


	update=function() {
		draw(gl);   // Draw the triangles
	}

	update();  //the first time


	document.onkeydown = allType.onkeydown  =  function(ev){ 
		keydown(ev, gl, n, u_ViewMatrix, viewMatrix); 
		return false;
	};

	lButton.onmousedown=function(ev) {
		clickLeft(10);
		ev.cancelBubble=true;
	}

	rButton.onmousedown=function(ev) {
		clickRight(10);
		ev.cancelBubble=true;
	}

	//bugbug wanted??? setInterval(update,1000/50);
}



function initBuffer(gl,description,typedArray,bufferType,hint)
{
	var buffer=gl.createBuffer();
	if (!buffer)
	{
		console.log('Failed to create buffer object:'+description);
		return null;
	}
	gl.bindBuffer(bufferType,buffer);
	gl.bufferData(bufferType,typedArray,hint);
	return buffer;
}




// var verticesIndicesQuadSplit = new Uint16Array([0,1,  0,2,  0,3,  0,4,
												  // 1,5,  1,6,  1,7,  1,8,
												  // 2,9,  2,10, 2,11, 2,12,
												  // 3,13, 3,14, 3,15, 3,16]);  //always a*4+n  where 1<=n<=4;  should continue indefinitely


function addTree(lineModel,pointh,vertexTreeCallback,numBranches)
{
	var indexOffset=lineModel.preVertices.length/lineModel.floatsPerVertex;  //in units of "points"
	lineModel.preVertices=lineModel.preVertices.concat(  vertexTreeCallback(pointh,numBranches)  );  
	lineModel.preVerticesIndices=lineModel.preVerticesIndices.concat(  buildBiSplitIndices(numBranches,indexOffset)  );  //bugbug quad??
}

//bugbug combine with the above when making more OO
function addLandFan(triModel,pointh,triFanCallback,numTriangles)
{
	var indexOffset=triModel.preVertices.length/triModel.floatsPerVertex;  //in units of "vertices"...length of perVertices is in floats, natively
	triModel.preVertices=triModel.preVertices.concat( triFanCallback(pointh, numTriangles) );
	triModel.preVerticesIndices=triModel.preVerticesIndices.concat( buildTriFanIndices(numTriangles,indexOffset) );
}


function buildTriFanIndices(numTriangles,indexOffset)
{
	//return [0,1,2,  0,2,3  0,3,4];
	var arr=[];
	for(var ii=0; ii<numTriangles; ii++)
	{
		arr[ii*3+0]=0 + indexOffset;
		arr[ii*3+1]=ii+1 + indexOffset;
		arr[ii*3+2]=ii+2 + indexOffset;
	}
	return arr;
}
function buildLandFan(pointh, numTriangles)
{
	var arr = [];
	
	var h0=pointh.h;  //the hash
	var rnd=new RNG("foo"+(h0/47));  //so it's not like the tree, exactly (still entropically constrained tho)
	
	
	//fill in ID=1;
	var x0=arr[0]=pointh.x+rnd.random(-3,3)/100;
	var y0=arr[1]=pointh.y-rnd.random(-1,3)/1000;
	var z0=arr[2]=pointh.z+rnd.random(-3,3)/100;
	var t0=pointh.t;
	var numVertices=2+numTriangles;  //general rule for fan
	
	
	var theta0=(rnd.normal()+1)*PI/90; //so it's in radians
	
	for(var ii=3; ii<numVertices*3; ii+=3)
	{
		var theta = theta0 + ii/numVertices/2.84536785342*PI*2; //small number, only go around once.
		var radius =rnd.gamma(3)/4+0.8;
		arr[ii+0]=x0+Math.sin(theta)*radius;
		arr[ii+1]=y0-ii/numVertices/3; //-rnd.uniform()*0.1-0.01;
		arr[ii+2]=z0+Math.cos(theta)*radius;
	}
	return arr;
}


function newModel()
{
	return {
				preVertices:[],
				preVerticesIndices:[]
			};	
}


function initVertexBuffers_land(gl,arrPointh)
{
	var triModel = newModel();
	triModel.floatsPerVertex = 3;  //todo to lineModel constructor
	triModel.verticesPerPrimitive = 3; 

	arrPointh.forEach(function(pointh){
		addLandFan(triModel,pointh,buildLandFan,50);  
	});
	return triModel;
}
//bugbug dedup above and below in the OO pass
function initVertexBuffers_trees(gl,arrPointh)
{
	var lineModel = newModel();	
	lineModel.floatsPerVertex = 3;  //todo to lineModel constructor
	lineModel.verticesPerPrimitive=2; 

	arrPointh.forEach(function(pointh){
		addTree(lineModel,pointh,buildVertexTree2,NNN);
	});
	return lineModel;
}


function sendElementsToGL(theModel)
{
	//ugh hate this extra layer they make us go thru
	var vertices = new Float32Array(theModel.preVertices);
	var verticesIndices = new Uint16Array(theModel.preVerticesIndices);
	
	var floatsPerVertex = theModel.floatsPerVertex;
	var floatsPerPrimitive = floatsPerVertex * theModel.verticesPerPrimitive; 
	var bytesPerFloat = vertices.BYTES_PER_ELEMENT;
	var n = vertices.length/theModel.verticesPerPrimitive;
	//var bytesPerVertex = bytesPerFloat * floatsPerVertex;
	var bytesPerVertex = bytesPerFloat * floatsPerVertex;  //3 floats, 4 bytes each means 12 bytes per vertex
	
	//   initBuffer(gl, description,    typedArray,       bufferType,            hint)
	if (!initBuffer(gl,"vertices",       vertices,       gl.ARRAY_BUFFER,        gl.DYNAMIC_DRAW))
		return "vertices problem";
	if (!initBuffer(gl,"verticesIndices",verticesIndices,gl.ELEMENT_ARRAY_BUFFER,gl.DYNAMIC_DRAW))
		return "verticesIndices problem";
  
	// Assign the buffer object to a_Position and enable the assignment
	var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
	if(a_Position < 0) {
		return 'Failed to get the storage location of a_Position';
	}
	gl.vertexAttribPointer(a_Position, floatsPerVertex, gl.FLOAT, gl.FALSE, 12, 0);   //false for "normalized"
	gl.enableVertexAttribArray(a_Position);
	
	return n;
}  
  

function buildVertexTree2(pointh,numBranches)  //Or, OH HOW I WISH they'd let me write a geometry shader in webGL
{
	var arr = new Array();
	
	//fill in ID=1;
	var x0=arr[0]=pointh.x;
	var y0=arr[1]=pointh.y;
	var z0=arr[2]=pointh.z;
	var h0=pointh.h;  //the hash
	var t0=pointh.t;
	
	
	var rnd=new RNG(h0);
	var theta0=(rnd.normal()+1)*90/PI; //so it's in radians
	
	for (var ii=numBranches; ii>=(numBranches>>1); ii--)
	{
		var wild = rnd.uniform()*0.08; //*0.05+0.08;  
		var theta = theta0 + 4*PI/numBranches*ii + wild*PI*1.5;
		var radius = (numBranches-ii)/numBranches*0.01 + 0.1*Math.sin(2*theta);  //or sqrt(theta)??
		var height=y0+ ii/numBranches* ii * ii/numBranches/numBranches/3 + wild*1.5;
		
		arr[(ii-1)*3 + 0] = x0 + radius*Math.sin(theta); //x
		arr[(ii-1)*3 + 1] = height ;//y 
		arr[(ii-1)*3 + 2] = z0 + radius*Math.cos(theta); //z
	}
	
	for (var ii=(numBranches>>1)-1 ; ii>=2; ii--)
	{
		var kid1=ii<<1;
		var kid2=kid1+1;
		
		arr[(ii-1)*3 + 0] = avg3( arr[(kid1-1)*3 + 0] , arr[(kid2-1)*3 + 0] , arr[(kid2-1)*3 + 0]  );  //x
		arr[(ii-1)*3 + 1] = avg3( arr[(kid1-1)*3 + 1] , arr[(kid2-1)*3 + 1] , y0  );  //x
		arr[(ii-1)*3 + 2] = avg3( arr[(kid1-1)*3 + 2] , arr[(kid2-1)*3 + 2] , arr[(kid2-1)*3 + 2]  );               		//z
	}
		
	return arr;
}

function avg3(a,b,c) { return (a+b+c)/3; }  

function buildVertexTree(pointh,numBranches)  //todo make these into geometry shader if/when supported in webGL 
{
	var arr = new Array();
	
	//fill in ID=1;
	arr[0]=pointh[0];
	arr[1]=pointh[1];
	arr[2]=pointh[2];
	var hashBits=DoubleToIEEE(pointh[3])[0];
	
	for (var ii=2; ii<=numBranches; ii++)
	{
		var hashBit=getHashBit(hashBits,ii);
		var childBit=ii%2;
		var parentId=ii>>1;
		var gen = Math.log2(ii);
		
		var theta = ii*timeFactor;
		
		//ii-1 to make up for 1-based priorityQ-like ID's.  *3 to deal with xyz ordering.
		arr[(ii-1)*3 + 0]=arr[(parentId-1)*3 + 0] - 0.6* childBit * sizeScale * Math.pow(varyingScale,8-gen) * (Math.cos(theta*2.5)+0.5)*(ii+20)/340;  //x
		arr[(ii-1)*3 + 1]=arr[(parentId-1)*3 + 1] + 1             * sizeScale * Math.pow(varyingScale,gen  );  //y
		arr[(ii-1)*3 + 2]=arr[(parentId-1)*3 + 2] + 0.7*(hashBit-0.5)   * sizeScale * Math.pow(varyingScale,gen  ) * (Math.sin(theta*2.5)+0.5)*(ii+20)/240;  //z
	}
	
	return arr;
}


// var verticesIndicesBiSplit = new Uint16Array([1,2,  1,3,  2,4,  2,5,
											  // 3,6,  3,7,  4,8,  4,9,
											  // 5,10, 5,11, 6,12, 7,13,
											  // 3,13, 3,14, 3,15, 3,16]);  //always a*4+n  where 1<=n<=4;  should continue indefinitely
function buildBiSplitIndices(numBranches,indexOffset)
{
	var arr=new Array(2*numBranches);  // 2 indices per line
	
	for (var ii=numBranches-1; ii>=0; ii--)
	{
		arr[ii*2+1]= ii+indexOffset;
		arr[ii*2+0]=(ii>>1)+indexOffset;
	}
	return arr;
}










function keyfix(ev) {
    keydown(ev,gl,n,u_ViewMatrix, viewMatrix);
}

function keydown(ev, gl, n, u_ViewMatrix, viewMatrix) {
    if(ev.keyCode == 39) { // The right arrow key was pressed
        clickLeft(1); 
	} else 
    if (ev.keyCode == 37) { // The left arrow key was pressed
        clickRight(1);
    } else { return; } // Prevent the unnecessary drawing
	//update();
	ev.cancelBubble=true;
}


function clickLeft(size)  { g_EyeX += size*0.01;update(); }
function clickRight(size) { g_EyeX -= size*0.01;update(); }



function draw(gl) 
{
	
	gl.clearColor(0.0, 0.0, 0.0, 1.0);

	//enable transparency
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LESS);
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);

	u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
	u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix');
	if (!u_ViewMatrix || !u_ProjMatrix) { 
		alert('Failed to get u_ViewMatrix or u_ProjMatrix');
		return;
	}


	projMatrix = new Matrix4();
	//projMatrix.setOrtho(-1.0, 1.0, -1.0, 1.0, 0.0, 2.0);
	projMatrix.setPerspective(30,canvas.width/canvas.height,1,100);
	gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);

	viewMatrix = new Matrix4();
	viewMatrix.setLookAt(g_EyeX, g_EyeY, g_EyeZ, -0.5, 0.5, 0, 0, 1, 0);
	gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);


	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	var n=sendElementsToGL(triModel);
	if (typeof n != "number" || n <= 0) {
		alert('Failed to specify the vertex information'+n);
		return;
	}
	gl.drawElements(gl.TRIANGLES,n,gl.UNSIGNED_SHORT,0);
	//bugbug dedup above and below???
	var n=sendElementsToGL(lineModel);
	if (typeof n != "number" || n <= 0) {
		alert('Failed to specify the vertex information'+n);
		return;
	}
	gl.drawElements(gl.LINES,n,gl.UNSIGNED_SHORT,0);
	
	
	

	//gl.drawElements(gl.LINE_STRIP,n,gl.UNSIGNED_BYTE,0);
}


//this fn (only) from stackExchange  http://stackoverflow.com/questions/2003493/javascript-float-from-to-bits
// function DoubleToIEEE(f)
// {
    // var buf = new ArrayBuffer(8);
    // (new Float64Array(buf))[0] = f;
    // return [ (new Uint32Array(buf))[0] ,(new Uint32Array(buf))[1] ];
// }


// function getHashBit(hashBits,ii)
// {
	// return (hashBits>>(ii%31)) & 1;
// }


function generateRandomPointsNearby(rand,count)
{   // e.g.
	// [
		// [-0.5,0.0,0.0,1.7834292],  //that's a pos+h,
		// [ -0.6,0.02,-2.0,-8909.3424],
		// [-1,-0.04,-0.8,-992267.83],
		// [-1.1,0.03,-1.3,93485.002]
	// ];
	var arr=[];
	for(var ii=0; ii<count; ii++)
	{
		arr[ii]=randomPointh(rand);
	}
	return arr; 
}

function randomPointh(rand)
{
	return {
		x: rand.uniform()*20-15,
		y: (rand.normal()+4)/16,
		z: 3-rand.exponential()*20,
		h: rand.uniform(),
		t: rand.uniform()
	};

}