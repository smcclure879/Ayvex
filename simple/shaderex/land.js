

//settings (some should not be global TODO)

var user = {
	eye:{		x:2.20,y:0.95,z:20.25
				,theta:0,phi:180
		}   // initial Eye position
};


var baseCube={
		x: -40.0,
		y: -4.7,
		z:-80.0,
		dx:200.0,
		dy:200.0,
		dz:200.0,
		granularity:100
	};
	


//tree consts
var randForLocations=new RNG("fifty-seven"); //seeding for tree locations
var numTrees=500;
var NNN=1 << 8;
var sizeScale=0.3;
var varyingScale=7.0/9.0;
var timeFactor = 1.0/10.0;
var dramaRatio=2.5;

//movement consts
var rotateSize = 0.05;
var moveSize = 0.5;

//land consts...the part you'd want to tweak on
var heightFunction = function(xx,zz){return dramaRatio*severalOctaveNoise(8787+xx, 4998.997, 8787+zz);}  ; //these constants get the entropy from somewhere far away in the hash
function severalOctaveNoise(x,y,z)
{
	return  (
				1/2 * noisefn(x / 13, y / 10, z)  
				- 2/3 * Math.abs(noisefn((x+1000)/391,(y+1000)/290,z/10)) 
				- 1/12 * noisefn(x,y,z*10) 
			);
	;
}




//convenience
var cos = Math.cos;
var sin = Math.sin;
var pi=Math.PI;
var pihalf=pi/2;
var fieldX=0;
var fieldY=1;
var fieldZ=2;


var canvas,gl,n,update,viewMatrix,u_ViewMatrix,u_ProjMatrix;
var projMatrix;
var lineModel,triModel;
var allType,lButton,rButton;










function main() 
{
	initUserMethods();
	canvas = document.getElementById('canvas');

	gl = getWebGLContext(canvas);
	if (!gl) {
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
		
	//globals, later we'll need to update these based on "not repainting the whole world at 60fps"
	triModel = initVertexBuffers_land(baseCube);
	lineModel = initVertexBuffers_trees(baseCube);
	


	update=function() {
		draw(gl);   // Draw the triangles
	}

	update();  //the first time


	document.onkeydown = allType.onkeydown  =  function(ev){ 
		// if (key.shouldSkip(ev)) 
		// {
			// ev.returnValue = true;
			// return true;
		// }
		
		ev.returnValue = keydown(ev, gl, n, u_ViewMatrix, viewMatrix); 
		return ev.returnValue;
	};

	lButton.onmousedown=function(ev) {
		clickLeft(10);
	}

	rButton.onmousedown=function(ev) {
		clickRight(10);
	}

	//bugbug wanted??? setInterval(update,1000/50);
}

//bugbug just make this a class already
function initUserMethods()
{
	user.getPosOrient=function(){
			var e=user.eye;
			var s=1;  //bugbug needed??
			return 	{
						x:e.x,
						y:e.y,
						z:e.z,
						lx:e.x + s*cos(e.phi)*cos(e.theta),
						ly:e.y + s*sin(e.theta),
						lz:e.z + s*sin(e.phi)*cos(e.theta),
			};
		};
	
	
	user.spin=function(rotation) {
		user.eye.phi += rotation;	
	};
	
	user.tilt=function(rotation){
		user.eye.theta += rotation;
	};
	user.rise=function(move){
		user.eye.y += move;
	};
	user.advance=function(move){
		var e=user.eye;
		e.x += move*cos(e.phi)*cos(e.theta);
		e.y += move*sin(e.theta);
		e.z += move*sin(e.phi)*cos(e.theta);
	};
	user.pan=function(move){
		var e=user.eye;
		e.x += move*cos(e.phi+pihalf)*cos(e.theta);
		e.z += move*sin(e.phi+pihalf)*cos(e.theta);  //bugbug I think there's a minus sign in there somewhere
		//e.y += move*0; //panning is altitude-locked
	};
	
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



function addItem(lineModel,pointh,vertexTreeCallback,numBranches)
{
	var indexOffset=lineModel.preVertices.length/lineModel.floatsPerVertex;  //in units of "points"
	lineModel.preVertices=lineModel.preVertices.concat(  vertexTreeCallback(pointh,numBranches)  );  
	lineModel.preVerticesIndices=lineModel.preVerticesIndices.concat(  buildBiSplitIndices(numBranches,indexOffset)  );  //bugbug quad??
}

//bugbug combine with the above when making more OO
// function addLandFan(triModel,pointh,triFanCallback,numTriangles)
// {
	// var indexOffset=triModel.preVertices.length/triModel.floatsPerVertex;  //in units of "vertices"...length of perVertices is in floats, natively
	// triModel.preVertices=triModel.preVertices.concat( triFanCallback(pointh, numTriangles) );
	// triModel.preVerticesIndices=triModel.preVerticesIndices.concat( buildTriFanIndices(numTriangles,indexOffset) );
// }


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


function newModel()
{
	return {
				preVertices:[],
				preVerticesIndices:[]
			};	
}





//bugbug dedup vs. same for land --- in the OO pass
function initVertexBuffers_trees(baseCube)  
{
	var arrPointh=generateRandomGroundPointsNearby(baseCube,randForLocations,numTrees);  
	
	var lineModel = newModel();	
	lineModel.floatsPerVertex = 3;  //todo to lineModel constructor
	lineModel.verticesPerPrimitive=2; 

	arrPointh.forEach(function(pointh){
		addItem(lineModel,pointh,buildVertexTree2,NNN);
	});
	return lineModel;
}


function sendAndDrawIfPossible(triModel,glElementType)
{	
	var n=sendElementsToGL(triModel);
	if (typeof n != "number" || n <= 0) {
		alert('Failed to specify the vertex information'+n);
	}
	gl.drawElements(glElementType,n,gl.UNSIGNED_SHORT,0);  //assuming the unsigned short and start at index 0, for now.
	return n;
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
	var theta0=(rnd.normal()+1)*90/pi; //so it's in radians
	
	for (var ii=numBranches; ii>=(numBranches>>1); ii--)
	{
		var wild = rnd.uniform()*0.08; //*0.05+0.08;  
		var theta = theta0 + 4*pi/numBranches*ii + wild*pi*1.5;
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






function keydown(ev, gl, n, u_ViewMatrix, viewMatrix)   //bugbug all these args needed???
{	
	switch(ev.keyCode)
	{
		case key.right: user.spin( rotateSize); break;
		case key.left: 	user.spin(-rotateSize); break;
		case key.up: 	user.tilt( rotateSize); break; 
		case key.down: 	user.tilt(-rotateSize); break;
		
		
		case key.r: 	user.rise( moveSize); break;
		case key.f: 	user.rise(-moveSize); break;
		case key.w: 	user.advance( moveSize); break; 
		case key.s: 	user.advance(-moveSize); break;
		case key.a: 	user.pan(-moveSize); break;
		case key.d: 	user.pan( moveSize); break;
		
		default: 		return true;        break;    //"not handled"
	}
	
	update();
	return false;  //"handled"
}


function draw(gl) 
{
	gl.clearColor(0.0, 0.0, 0.0, 1.0);

	gl.enable(gl.BLEND);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LESS);
	gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);

	u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
	u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix');
	if (!u_ViewMatrix || !u_ProjMatrix) { 
		alert('Failed to get u_ViewMatrix or u_ProjMatrix');
		return;
	}


	projMatrix = new Matrix4();
	//projMatrix.setOrtho(-1.0, 1.0, -1.0, 1.0, 0.0, 2.0);
	projMatrix.setPerspective(30,canvas.width/canvas.height,1,1000);
	gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);

	viewMatrix = new Matrix4();
	var po = user.getPosOrient();
	viewMatrix.setLookAt(po.x, po.y, po.z, 
						po.lx, po.ly, po.lz,   
						//-0.5, 0.5, 0,   //old, other look
						0, 1, 0);  //up direction vector
	gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	sendAndDrawIfPossible(triModel,gl.TRIANGLES);
	sendAndDrawIfPossible(lineModel,gl.LINES);
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



function generateRandomGroundPointsNearby(baseCube,rand,count)
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
		arr[ii]=randomPointh(baseCube,rand);
	}
	return arr; 
}

function randomPointh(baseCube,rand)
{
	//bugbug these need to be near the user!

	var x = rand.uniform()*baseCube.dx+baseCube.x;
	var z = rand.uniform()*baseCube.dz+baseCube.z;  //3-rand.exponential()*20;
	
	
	return {
		x: x,
		y: heightFunction(x,z),  //(rand.normal()+4)/16,
		z: z,
		h: rand.uniform(),
		t: rand.uniform()
	};

}








//------------------------------------------------------------------------------------------------------------------------



var height = 0;
var fn = 'simplex';
var noisefn = fn === 'simplex' ? noise.simplex3 : noise.perlin3;


function initVertexBuffers_land(baseCube)
{
	var meshModel=getMeshForLand(baseCube);  //bugbug
	//var meshModel=getMeshAroundMe(user); //bugbug is the below still true if we've skipped notion of baseCube entirely
	meshModel.baseCube=baseCube;  //send it along for good measure?  land owns trees by this decision!
	return meshModel;
}

function getMeshForLand(baseCube)
{  


	var triModel = newModel();
	triModel.floatsPerVertex = 3;  //todo to lineModel constructor
	triModel.verticesPerPrimitive = 3; 
	triModel.start=Date.now();
	
	var arrWidth=baseCube.granularity;
	
	var stepX = baseCube.dx/baseCube.granularity;
	var stepZ = baseCube.dz/baseCube.granularity;
	var nextIndex=0;

	var xl = baseCube.x + baseCube.dx;
	var zl = baseCube.z + baseCube.dz;
	
	//for tracking max and min values seen
	var max = -Infinity, min = Infinity;

	//part of loop
	var vertNum=0;
	var primNum=0;
	for(var xx=baseCube.x; xx<xl; xx+=stepX)  //combined with...
	for(var zz=baseCube.z; zz<zl; zz+=stepZ)
	{
		var ii = vertNum * triModel.floatsPerVertex;
		//bugbugvar primNum = vertNum * triModel.verticesPerPrimitive * 2;  //2 triangles per square
		
		var height = heightFunction(xx,zz); 

		//tracking
		if (max < height) max = height;
		if (min > height) min = height;
		
		//actual positions
		triModel.preVertices[ii+fieldX] = xx;
		triModel.preVertices[ii+fieldY] = height;   //should really be the d/dz  deriv of height  bugbug
		triModel.preVertices[ii+fieldZ] = zz;
		
		if ((-vertNum)%arrWidth!=1 && zz+stepZ < zl)  //not on last column AND not on last row
		{	
			//tri1 indices
			jj=primNum*triModel.verticesPerPrimitive;
			triModel.preVerticesIndices[jj+0] = vertNum;
			triModel.preVerticesIndices[jj+1] = vertNum+arrWidth+1;
			triModel.preVerticesIndices[jj+2] = vertNum+1;
			primNum++;
			
			//tri2 indices
			jj=primNum*triModel.verticesPerPrimitive;
			triModel.preVerticesIndices[jj+0] = vertNum;
			triModel.preVerticesIndices[jj+1] = vertNum+arrWidth;
			triModel.preVerticesIndices[jj+2] = vertNum+arrWidth+1;
			primNum++;
		}
		vertNum++;
	}
	
	triModel.end=Date.now();
	
	return triModel;
}



function clamp(x,min,max)
{
	if (x<min) 
		return min;
	if (x>max) 
		return max;
	
	return x;
}

function sqr(x)
{
	return x*x;
}

// document.onclick = function() {
  // // Swap noise function on click.
  // fn = fn === 'simplex' ? 'perlin' : 'simplex';
// };


// function animationFrameDraw(timeStamp)
// {
	// draw(gl);
// }

// requestAnimationFrame(animationFrameDraw);






