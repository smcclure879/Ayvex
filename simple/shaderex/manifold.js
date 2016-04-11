//convenience--do early so we can 
var BILLION=1000000000;
var pi=Math.PI;
var pihalf=pi/2;
var cos = Math.cos;
var sin = Math.sin;
var abs = Math.abs;
var pow = Math.pow;
var sqrt = Math.sqrt;
function sqr(x) {	return x*x;  }
function rad(degrees) { return degrees*pi/180; }
function deg(radians) { return radians/pi*180; }


//for clarity in indexing packed values
var fieldX=0;
var fieldY=1;
var fieldZ=2;






//settings (some should not be global TODO)
var farDist=1*BILLION;  //bugbug move to user
var nearDist=1;
var fovy=80;
var deltaTheta=2; //rad(canvas.height/canvas.width);  //bugbug dedup and math not quite right anyway
var deltaPhi=rad(fovy);

var user = {
	eye:{		x:2.20,y:0.95,z:20.25
				,theta:rad(120),phi:rad(180)  //theta defined as "radians below zenith" !!
		}   // initial Eye position
};

//here is how to make a wall...
var oldGroundTestFunction=function(x,y,z){ return clamp(noisefn(x,y,z)+z/100,0,1); };
var groundTestFunction=function(x,y,z){
		var retval=0;
		
		if (y<-200) 
			retval=10;
		else if (x<-100) 
			retval=10;
		//if (z>100) return 1;
		
		return clamp(retval,0,1);
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
	

var myColors={ 
	blueSky:colorObj('87CEEB'),  //	135,206,235
	dirt:colorObj('FF0033'),
	dirt2:colorObj('836539'),  //bugbug the real one
	red: colorObj('FF0000'),
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
var rotateSize = 0.02;
var moveSize = 0.5;


//new land consts
var groundDensity=0.2;  //bugbug need to determine the allowed density spectrum...maybe adjust noise to fit that?

//old land consts...the part you'd want to tweak on
var heightFunction = function(xx,zz){return dramaRatio*severalOctaveNoise(8787+xx, 4998.997, 8787+zz);}  ; //these constants get the entropy from somewhere far away in the hash
function severalOctaveNoise(x,y,z)
{
	return  (
				1/2 * noisefn(x / 13, y / 10, z)  
				- 2/3 * abs(noisefn((x+1000)/391,(y+1000)/290,z/10)) 
				- 1/12 * noisefn(x,y,z*10) 
			);
	;
}






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
						lx:e.x + s*cos(e.phi)*sin(e.theta),
						ly:e.y + s*cos(e.theta),
						lz:e.z + s*sin(e.phi)*sin(e.theta),
			};
		};
	
	user.getViewMatrix=function(){
		var viewMatrix = new Matrix4();
		var po = user.getPosOrient();
		viewMatrix.setLookAt(po.x, po.y, po.z, 
							po.lx, po.ly, po.lz,   
							0, 1, 0);  //up direction vector
		return viewMatrix;
	}
	
	user.spin=function(rotation) {
		user.eye.phi += rotation;	
	};
	
	user.tilt=function(rotation){
		user.eye.theta -= rotation;
	};
	user.rise=function(move){
		user.eye.y += move;
	};
	user.advance=function(move){
		var e=user.eye;
		e.x += move*cos(e.phi)*sin(e.theta);
		e.y += move*cos(e.theta);
		e.z += move*sin(e.phi)*sin(e.theta);
	};
	user.pan=function(move){
		var e=user.eye;
		e.x += move*cos(e.phi+pihalf)*sin(e.theta);
		e.z += move*sin(e.phi+pihalf)*sin(e.theta);  //bugbug I think there's a minus sign in there somewhere
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
	lineModel.colors=[];

	arrPointh.forEach(function(pointh){
		addItem(lineModel,pointh,buildVertexTree2,NNN);  //add item buildVertexTree2(count=NNN) @pointh  into lineModel
	});
	
	
	var red=0.7;
	var green=0.8;
	var blue=0.1;
	var alpha=0.5;
		
	
	//patch up colors since we don't have perVertex coloring yet for lines...should we?
	for( var ii=0,il=lineModel.preVertices.length/3*4 ; ii<il ; )  //4 colorFloats / 3 positionFloats
	{
		var uu=decimalPart(ii/192)
		lineModel.colors[ii++]=uu;
		lineModel.colors[ii++]=1-uu;
		lineModel.colors[ii++]=blue;
		lineModel.colors[ii++]=alpha;
	}
	
	
	return lineModel;
}


function sendAndDrawIfPossible(model,glElementType)  //bugbug elementType should be a property of the model, and this should be a method of the model
{	
	var n=sendElementsToGL(model);
	
	if (typeof n != "number" || n <= 0) {
		throw ('Failed to specify the vertex information'+n);
	}
	gl.drawElements(glElementType,n,gl.UNSIGNED_SHORT,0);  //assuming the unsigned short and start at index 0, for now.
	return n;
}

function sendElementsToGL(theModel)
{
	//ugh hate this extra layer they make us go thru
	var vertices = new Float32Array(theModel.preVertices);
	var verticesIndices = new Uint16Array(theModel.preVerticesIndices);
	var colors = new Float32Array(theModel.colors);  //bugbug need to insure this is always created!
	
	var floatsPerVertex = theModel.floatsPerVertex;
	var floatsPerPrimitive = floatsPerVertex * theModel.verticesPerPrimitive; 
	var bytesPerFloat = vertices.BYTES_PER_ELEMENT;
	var n = vertices.length/theModel.verticesPerPrimitive;
	//var bytesPerVertex = bytesPerFloat * floatsPerVertex;
	var bytesPerVertex = bytesPerFloat * floatsPerVertex;  
	var bytesPerPrimitive = bytesPerVertex * theModel.verticesPerPrimitive;  //bugbug needed???
	
	//   initBuffer(gl, description,    typedArray,       bufferType,            hint)
	if (!initBuffer(gl,"vertices",       vertices,       gl.ARRAY_BUFFER,        gl.DYNAMIC_DRAW))
		return "vertices buffer problem";
	if (!initBuffer(gl,"verticesIndices",verticesIndices,gl.ELEMENT_ARRAY_BUFFER,gl.DYNAMIC_DRAW))
		return "verticesIndices buffer problem";	
	
	//maybe the above bound the buffer so do the vars here
	// Assign the buffer object to a_Position and enable the assignment
	var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
	if(a_Position < 0)
		return 'Failed to get the storage location of a_Position';
	
	gl.vertexAttribPointer(a_Position, floatsPerVertex, gl.FLOAT, gl.FALSE, stride, 0);   //false for "normalized"
	gl.enableVertexAttribArray(a_Position);
			
		
		
	if (!initBuffer(gl,"colors",          colors,        gl.ARRAY_BUFFER,     	gl.DYNAMIC_DRAW))
		return "colors buffer problem";
	
	var a_Color= gl.getAttribLocation(gl.program, 'a_Color');
	if(a_Color < 0)
		return 'Failed to get the storage lcoation of a_Color';
	//bugbug if handColoring...
	gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, gl.FALSE, 16, 0);  //16=stride 4 floats, 4 bytes each.  bugbug??
	gl.enableVertexAttribArray(a_Color);
	
	
	
	
	var stride = bytesPerVertex;
	
	
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
	
	//bugbug probably this should be outside the callback, so can be shared across 1 whole tree
	var rnd=new RNG(h0);
	//var theta0=rad(rnd.normal()+1)/2; //bugbug why the /2  .....  'twas only obvious when switched to standard rad() fn !
	var theta0=rad(rnd.normal()+1)/pi;
	
	for (var ii=numBranches; ii>=(numBranches>>1); ii--)
	{
		var wild = rnd.uniform()*0.08; //*0.05+0.08;  
		var theta = theta0 + 4*pi/numBranches*ii + wild*pi*1.5;
		var radius = (numBranches-ii)/numBranches*0.01 + 0.1*sin(2*theta);  //or sqrt(theta)??
		//radius *= 100;  //bugbugSOON should not be here
		var height=y0+ ii/numBranches* ii * ii/numBranches/numBranches/3 + wild*1.5;
		
		arr[(ii-1)*3 + 0] = x0 + radius*sin(theta); //x
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
		arr[(ii-1)*3 + 0]=arr[(parentId-1)*3 + 0] - 0.6* childBit * sizeScale * pow(varyingScale,8-gen) * (cos(theta*2.5)+0.5)*(ii+20)/340;  //x
		arr[(ii-1)*3 + 1]=arr[(parentId-1)*3 + 1] + 1             * sizeScale * pow(varyingScale,gen  );  //y
		arr[(ii-1)*3 + 2]=arr[(parentId-1)*3 + 2] + 0.7*(hashBit-0.5)   * sizeScale * pow(varyingScale,gen  ) * (sin(theta*2.5)+0.5)*(ii+20)/240;  //z
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
	var mult=(window.event.shiftKey)? 1 : 20;  //shift key to go slow

	switch(ev.keyCode)
	{
		case key.right: user.spin( rotateSize*mult); break;
		case key.left: 	user.spin(-rotateSize*mult); break;
		case key.up: 	user.tilt( rotateSize*mult); break; 
		case key.down: 	user.tilt(-rotateSize*mult); break;
		
		
		case key.r: 	user.rise( moveSize*mult); break;
		case key.f: 	user.rise(-moveSize*mult); break;
		case key.w: 	user.advance( moveSize*mult); break; 
		case key.s: 	user.advance(-moveSize*mult); break;
		case key.a: 	user.pan(-moveSize*mult); break;
		case key.d: 	user.pan( moveSize*mult); break;
		
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
	//                        (fovy, aspect, near, far)
	projMatrix.setPerspective(fovy,canvas.width/canvas.height,1,farDist);
	gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);

	var viewMatrix=user.getViewMatrix();	
						
	gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	sendAndDrawIfPossible(triModel,gl.TRIANGLES); 
	//sendAndDrawIfPossible(lineModel,gl.LINES);   //bugbugSOON add the lines back
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
	//var meshModel=getMeshForLand(baseCube);  //bugbug
	var meshModel=getMeshAroundMe(user); //bugbug is the below still true if we've skipped notion of baseCube entirely
	meshModel.baseCube=baseCube;  //send it along for good measure?  land owns trees by this decision!
	return meshModel;
}


var triSize=11;
function getOffsetsRotated(user)
{
	var retval = [];
	var ii = 0;
	var viewMatrix = user.getViewMatrix();
	for (var ii=0; ii<3; ii++)
	{
		var offsetAngle=rad(120*ii + 90);
		var vec=facePlanePolar(triSize,offsetAngle);  //bugbug vec could be array of consts set before now.  this could just be a map operation.
		retval[ii] = viewMatrix.multiplyVector3(vec);
	}
	return retval;
}

var distanceMetric=function(a,b){
	return sqrt(sqr(a.x)+sqr(a.y)+sqr(a.z));
};
var recentPoints = new kdTree([],distanceMetric,['x','y','z']);  //bugbug add fourth dimension here soon!

function getMeshAroundMe(user)
{
	if (!recentPoints) 
		throw 'no recentPoints';
	
	var triModel = newModel();
	triModel.floatsPerVertex = 3;  //todo to lineModel constructor
	triModel.verticesPerPrimitive = 3; 
	triModel.colors=[];  //add colors to it
	triModel.start=Date.now();
	
	var offsets = getOffsetsRotated(user);

	
	//cast some rays around user.  user has lookAt (and later a lookAtObject, selectedObject, etc) that can serve as base points to render from
	var density=groundTestFunction;
	
	var po = user.getPosOrient();
	var phi0 = user.eye.phi;
	var theta0 = user.eye.theta; 
	
	
	var visualAcuity=5000;
	var visualAcuityShown=visualAcuity;
	
	//pick a buncha points in direction user is looking. 
	for(var ii=0; ii<visualAcuity; ii++)
	{
		//pick random offset theta phi from lookAt direction (so need user.getThetaPhi??)
		var theta=randCtrOffExponential(theta0,deltaTheta); //those are the one-sigma values from offset theta  
		var phi=randCtrOffExponential(phi0,deltaPhi);
		
		
		var startDist=1.1;  //note can't be zero or less!  1.01 is low error, 1.1 is high error
		var loopDelta = 50 * startDist; //bugbug what is this 50?
		
		
		
		
		var testDensity=null;  //used in the loop
		var vx=cos(phi)*sin(theta);
		var vy=cos(theta);
		var vz=sin(phi)*sin(theta);
		
		//now find a surface in that direction....
		
		for(var dist = startDist; dist< 1e+32 && dist>=startDist && loopDelta>startDist; dist*=loopDelta) 
		{
			//var offset = polar to xyz (dist,theta,phi);
			var testX = po.x + dist*vx; 
			var testY = po.y + dist*vy;
			var testZ = po.z + dist*vz; 
			var testDensity=density(testX,testY,testZ);
			if (testDensity>=groundDensity)
			{
				dist /= loopDelta;
				loopDelta = sqrt(loopDelta);
			}
		}
		
		var color=colorForDensity(testDensity);
		//drop Vertex with color into an octree (for now a tiny triangle normal to user -- 60,60,60) 
		var normalX=0;  //bugbug should actually compute one, treat distance in normals like distance in pos!!!  todo
		var normalY=1;
		var normalZ=0;
		
		//remember the point...we'll make a triangle later.
		recentPoints.insert({	x:testX, y:testY, z:testZ,
								red:color.red,	green:color.green,	blue:color.blue, alpha:color.alpha,
								normalX:normalX, normalY:normalY, normalZ:normalZ
							});
	}
	
	
	//TODO this is the algo for later.  don't use marching cubes. something like relaxation?
	//now that octree is filled, build a triangulation by finding closest points to each other 
	//where the vertices are different in some aspect (color, normVec), we would mark that for candidate to split on subsequent rounds.
	//note we can keep filling the octree with points if we keep pruning it to size.  these are absolute xyz points!  with color&normVec?  
	
	//for now to demo the octree and spot estimation working....
	
	//bugbug todo
	//recentPoints.simplify();
	//recentPoints.triangleIfy();
	
	//fill the triangles into the buffers....
	//recentPoints.beginRead();
	//alert("recentPoitns"+recentPoints.toJSON(""));
	
	var maxNodes = visualAcuityShown;  //bugbug
	var maxDistance = null;      //Number.MAX_VALUE;
	var pointsToMakeIntoTriangles = recentPoints.nearest(po, maxNodes, maxDistance);
	
	var ii=0; //index into model.preVertices
	var jj=0; //index into model.preVerticesIndices
	var mm=0; //index into model.colors
	for( var originalPointCount=0, size=pointsToMakeIntoTriangles.length  ;  originalPointCount<size  ;  originalPointCount++ )
	{
		var pointObject = pointsToMakeIntoTriangles[originalPointCount++][0];
		var point = Vector3.CreateFromXyz(pointObject);
				
		//copy a tiny triangle around that point into the vertices and verticesIndices buffer!
		for(var kk=0; kk<3; kk++)
		{
			var p = Vector3.Add( point , offsets[kk] ).elements;
			
			//one point-of-a-triangle (not original points)
			triModel.preVertices[ii++] = p[0];
			triModel.preVertices[ii++] = p[1];
			triModel.preVertices[ii++] = p[2];
			
			
			if (triModel.colors) 
			{
				triModel.colors[mm++] = pointObject.red;
				triModel.colors[mm++] = pointObject.green;
				triModel.colors[mm++] = pointObject.blue;
				triModel.colors[mm++] = pointObject.alpha;
			}
			
			//one index to that point
			triModel.preVerticesIndices[jj] = jj;
			jj++;
		}
		
	}
	
	triModel.end=Date.now();
	
	//alert("got trimodel");
	return triModel;
	
}


function colorForDensity(dens)
{

	if (dens<groundDensity) //we ran out of stuff so 
		return myColors.blueSky;
		
	return myColors.dirt;  //bugbug
	
	
	
	var h=dens-groundDensity/groundDensity;
	var s=0.8;
	var l=0.5;
	return hslToRgb(h,s,l);		
}





function clamp(x,min,max)
{
	if (x<min) 
		return min;
	if (x>max) 
		return max;
	
	return x;
}


/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  l       The lightness
 * @return  Array           The RGB representation
 */
function hslToRgb(h, s, l){
    var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        var hue2rgb = function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
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


//given a center and one sided sigma, generate a bell curve point randomly
function randCtrOffExponential(ctr,sigma)
{
	return ctr + randForLocations.normal()*sigma ;

}

function facePlanePolar(radius,offsetAngle)
{
	return new Vector3([
				radius*cos(offsetAngle),  
				radius*sin(offsetAngle),   
				0 
			]);
}

function decimalPart(x)
{
	return x-Math.floor(x);
}



function colorObj(hexString)
{
	return { red:red(hexString), green:grn(hexString), blue:blu(hexString), alpha:alf(hexString) };
}

//functions for converting string colors to 
function red(s)
{
	return decodeByteToFloat(s,0);
}
function grn(s)
{
	return decodeByteToFloat(s,2);
}
function blu(s)
{
	return decodeByteToFloat(s,4);
}
function alf(s)
{
	return decodeByteToFloat(s,6);
}

function decodeByteToFloat(s,pos)
{
	if (s.length<2+pos)
	{
		return (pos==6) ? 1.0 : 0.0;
	}
	return clamp(  hexToFloat(s.substr(pos,2)),  0.0,  1.0  );
}


function hexToFloat(ss)  //assumes! two-chars only string 00-FF inclusive
{
	return parseInt(ss,16)/256.0;
}

