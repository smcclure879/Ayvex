// frak4.js

//move to utils??? bugbug
function snag(idOfScript)
{
	return document.getElementById(idOfScript).textContent;
}

var canvas,gl;

function start()
{
	// Retrieve <canvas> element
	canvas = document.getElementById('webgl');
	canvas.width=document.body.clientWidth;
	canvas.height=document.body.clientHeight;

	gl = getWebGLContext(canvas);

	var VSHADER_SOURCE = snag('vert');
	var FSHADER_SOURCE = snag('frag');

	if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) 
	{
		console.log('Failed to intialize shaders.');
		return;
	}

	var n = initVertexBuffers(gl);
	if (n < 0) 
	{
		console.log('Failed to set the vertex information');
		return;
	}

	// Specify the color for clearing <canvas>
	gl.clearColor(0.0, 0.0, 0.0, 1.0);

	// Clear <canvas>
	gl.clear(gl.COLOR_BUFFER_BIT);

	// Draw the rectangle
	gl.drawArrays(gl.TRIANGLES, 0, n);
}
  

function initVertexBuffers(gl) 
{
	var verticesColors = new Float32Array([
		// Vertex coordinates and color
		 0.0,  0.5,  1.0,  0.0,  0.0, 
		-0.5, -0.5,  0.0,  1.0,  0.0, 
		 0.5, -0.5,  0.0,  0.0,  1.0, 
	]);
	var n = 3;

	var vertexColorBuffer = gl.createBuffer();  
	if (!vertexColorBuffer)
	{
		console.log('Failed to create the buffer object');
		return false;
	}
	
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

	var FSIZE = verticesColors.BYTES_PER_ELEMENT;
	//Get the storage location of aVertex, assign and enable buffer
	var aVertex = gl.getAttribLocation(gl.program, 'aVertex');
	if (aVertex < 0) 
	{
		console.log('Failed to get the storage location of aVertex');
		return -1;
	}

	gl.vertexAttribPointer(aVertex, 2, gl.FLOAT, false, FSIZE * 5, 0);
	gl.enableVertexAttribArray(aVertex);  // Enable the assignment of the buffer object
	
	// Get the storage location of a_Color, assign buffer and enable
	// var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
	// if(a_Color < 0) 
	// {
		// console.log('Failed to get the storage location of a_Color');
		// return -1;
	// }
	// gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 5, FSIZE * 2);
	// gl.enableVertexAttribArray(a_Color);  // Enable the assignment of the buffer object

	
	var uModelMatrix = new Matrix4();  // Model matrix
		
	// Calculate the model matrix
	uModelMatrix.setTranslate(0, 0.9, 0); // Translate to the y-axis direction
	uModelMatrix.rotate(90, 0, 0, 1);     // Rotate 90 degree around the z-axis

	var uMvpMatrix = new Matrix4();    // Model view projection matrix
	uMvpMatrix.setPerspective(30, canvas.width/canvas.height, 1, 100);  //proj
	uMvpMatrix.lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0);  //view
	uMvpMatrix.multiply(uModelMatrix);  //model
	
	var uMvpMatrixLoc = gl.getUniformLocation(gl.program, "uMvpMatrix");
	//wrong:     g.mvpMatrix.setUniform(gl, g.u_modelViewProjMatrixLoc, false);
	gl.uniformMatrix4fv(uMvpMatrixLoc,false,uMvpMatrix.elements);
	
	
	
	
	
	
	
	return n;
}
 

