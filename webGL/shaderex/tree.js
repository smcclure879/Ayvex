
var canvas,gl,n,update,viewMatrix,u_ViewMatrix,u_ProjMatrix;

var projMatrix;
var allType,lButton,rButton;

function main() {
  //alert('foo1');
  canvas = document.getElementById('webgl');

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
  
  if (!resultFromShader)
  {
    alert('Failed to intialize shaders.'+resultFromShader);
    return;
  }

  // Set the vertex coordinates etc
  n = initVertexBuffers(gl);
  if (typeof n != "number" || n <= 0) {
    alert('Failed to specify the vertex information'+n);
    return;
  }
  
  //alert('foo3');

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  
  //enable transparency
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);

  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix');
  if (!u_ViewMatrix || !u_ProjMatrix) { 
    alert('Failed to get u_ViewMatrix or u_ProjMatrix');
    return;
  }

  viewMatrix = new Matrix4();
  
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


  projMatrix = new Matrix4();
  //projMatrix.setOrtho(-1.0, 1.0, -1.0, 1.0, 0.0, 2.0);
  projMatrix.setPerspective(30,canvas.width/canvas.height,1,100);
  gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);
  


  update=function() {
    draw(gl, n, u_ViewMatrix, viewMatrix);   // Draw the triangles
  }

  update();  //the first time
}



//bugbug you are here make this work to init elements buffers, not single array buffer as before/below
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

function initVertexBuffers(gl)
{
	//return initVertexBuffers_threeTriangles(gl);
	return initVertexBuffers_trees(gl,
									[
										[-0.5,0.0,0.0,1.7834292],  //that's a pos+h,
										[ -0.6,0.02,-2.0,-8909.3424],
										[-1,-0.04,-0.8,-992267.83],
										[-1.1,0.03,-1.3,93485.002]
									]
		 
								);
}


// var verticesIndicesQuadSplit = new Uint16Array([0,1,  0,2,  0,3,  0,4,
												  // 1,5,  1,6,  1,7,  1,8,
												  // 2,9,  2,10, 2,11, 2,12,
												  // 3,13, 3,14, 3,15, 3,16]);  //always a*4+n  where 1<=n<=4;  should continue indefinitely


function addTree(lineModel,pointh)
{
	var indexOffset=lineModel.preVertices.length/3;  //in units of "points"
	lineModel.preVertices=lineModel.preVertices.concat(  buildVertexTree(pointh,NNN)  );
	lineModel.preVerticesIndices=lineModel.preVerticesIndices.concat(  buildBiSplitIndices(NNN,indexOffset)  );  //bugbug quad??
}

function initVertexBuffers_trees(gl,arrPointh)
{
	var lineModel = {  //cheap "object"
						preVertices:[],
						preVerticesIndices:[]
					};	

	arrPointh.forEach(function(pointh){
		addTree(lineModel,pointh);
	});
	
	//ugh hate this extra layer they make us go thru
	var vertices = new Float32Array(lineModel.preVertices);
	var verticesIndices = new Uint16Array(lineModel.preVerticesIndices);
	
	var n = vertices.length/3 * 2;
	//var n = verticesIndices.length;bugbug
	var FSIZE = vertices.BYTES_PER_ELEMENT;
  
	//   initBuffer(gl, description,    typedArray,       bufferType,            hint)
	if (!initBuffer(gl,"vertices",       vertices,       gl.ARRAY_BUFFER,        gl.STATIC_DRAW))
		return "vertices problem";
	if (!initBuffer(gl,"verticesIndices",verticesIndices,gl.ELEMENT_ARRAY_BUFFER,gl.STATIC_DRAW))
		return "verticesIndices problem";
  
	// Assign the buffer object to a_Position and enable the assignment
	var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
	if(a_Position < 0) {
		return 'Failed to get the storage location of a_Position';
	}
	gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 3, 0);
	gl.enableVertexAttribArray(a_Position);
	
	return n;
}  
  

var NNN=1 << 9;
var sizeScale=0.3;
var varyingScale=7.0/9.0;
var timeFactor = 1.0/10.0;
function buildVertexTree(pointh,NNN)  //Or, OH HOW I WISH they'd let me write a geometry shader in javascript. 
{
	var arr = new Array();  //bugbug needed? NNN*3);
	
	//fill in ID=1;
	arr[0]=pointh[0];
	arr[1]=pointh[1];
	arr[2]=pointh[2];
	var hashBits=DoubleToIEEE(pointh[3])[0];
	
	for (var ii=2; ii<=NNN; ii++)
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
function buildBiSplitIndices(NNN,indexOffset)
{
	var arr=new Array(2*NNN);  // 2 indices per line
	
	for (var ii=NNN-1; ii>=0; ii--)
	{
		arr[ii*2+1]= ii+indexOffset;
		arr[ii*2+0]=(ii>>1)+indexOffset;
	}
	return arr;
}







function initVertexBuffers_threeTriangles(gl) {
  var verticesColors = new Float32Array([
    // Vertex coordinates and color
     0.0,  0.5,  -0.4, // 0.4,  1.0,  0.4, // The back green one
    -0.5, -0.5,  -0.4, // 0.4,  1.0,  0.4,
     0.5, -0.5,  -0.4, // 1.0,  0.4,  0.4, 
   
     0.5,  0.4,  -0.2, // 1.0,  0.4,  0.4, // The middle yellow one
    -0.5,  0.4,  -0.2, // 1.0,  1.0,  0.4,
     0.0, -0.6,  -0.2, // 1.0,  1.0,  0.4, 

     0.0,  0.5,   0.0, // 0.4,  0.4,  1.0,  // The front blue one 
    -0.5, -0.5,   0.0, // 0.4,  0.4,  1.0,
     0.5, -0.5,   0.0, // 1.0,  0.4,  0.4, 
  ]);
  
  
  var verticesIndices=new Uint8Array([
    0,1,2,
	0,3,4,
	0,5,6,
	0,7,8,0
  ]);
  
  
  // // Create a vertex buffer object
  // var vertexColorbuffer = gl.createBuffer();  
  // if (!vertexColorbuffer) {
    // console.log('Failed to create the buffer object');
    // return -1;
  // }

  // // Write vertex information to buffer object
  // gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorbuffer);
  // gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

  var n = 13;
  var FSIZE = verticesColors.BYTES_PER_ELEMENT;
  

  //   initBuffer(gl, description,    typedArray,    bufferType,         hint)
  if (!initBuffer(gl,"verticesColors",verticesColors,gl.ARRAY_BUFFER,gl.STATIC_DRAW))
	return;
  
  if (!initBuffer(gl,"verticesIndices",verticesIndices,gl.ELEMENT_ARRAY_BUFFER,gl.STATIC_DRAW))
	return;
  
  
  
  // Assign the buffer object to a_Position and enable the assignment
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if(a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 3, 0);
  gl.enableVertexAttribArray(a_Position);
  
  
  // Assign the buffer object to a_Color and enable the assignment
  //var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  //if(a_Color < 0) {
  //  console.log('Failed to get the storage location of a_Color');
  //  return -1;
  //}
  //gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
  //gl.enableVertexAttribArray(a_Color);

  return n;
}

var g_EyeX = 0.20, g_EyeY = 0.25, g_EyeZ = 2.25; // Eye position



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



function draw(gl, n, u_ViewMatrix, viewMatrix) {
  // Set the matrix to be used for to set the camera view
  viewMatrix.setLookAt(g_EyeX, g_EyeY, g_EyeZ, -0.5, 0.5, 0, 0, 1, 0);

  // Pass the view projection matrix
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Draw the rectangle
  //gl.drawArrays(gl.TRIANGLES, 0, n);
  //gl.drawArrays(gl.LINE_STRIP, 0, n);
  gl.drawElements(gl.LINES,n,gl.UNSIGNED_SHORT,0);
  //gl.drawElements(gl.LINE_STRIP,n,gl.UNSIGNED_BYTE,0);
}


//from stackExchange  http://stackoverflow.com/questions/2003493/javascript-float-from-to-bits
function DoubleToIEEE(f)
{
    var buf = new ArrayBuffer(8);
    (new Float64Array(buf))[0] = f;
    return [ (new Uint32Array(buf))[0] ,(new Uint32Array(buf))[1] ];
}


function getHashBit(hashBits,ii)
{
	return (hashBits>>(ii%31)) & 1;

}