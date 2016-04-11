
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

  var VSHADER_SOURCE=document.getElementById('vert').innerText;
  var FSHADER_SOURCE=document.getElementById('frag').innerText;

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

  // Set the vertex coordinates and color (the blue triangle is in the front)
  n = initVertexBuffers(gl);
  if (n < 0) {
    alert('Failed to specify the vertex infromation');
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

function initVertexBuffers(gl) {
  var verticesColors = new Float32Array([
    // Vertex coordinates and color
     0.0,  0.5,  -0.4,  0.4,  1.0,  0.4, // The back green one
    -0.5, -0.5,  -0.4,  0.4,  1.0,  0.4,
     0.5, -0.5,  -0.4,  1.0,  0.4,  0.4, 
   
     0.5,  0.4,  -0.2,  1.0,  0.4,  0.4, // The middle yellow one
    -0.5,  0.4,  -0.2,  1.0,  1.0,  0.4,
     0.0, -0.6,  -0.2,  1.0,  1.0,  0.4, 

     0.0,  0.5,   0.0,  0.4,  0.4,  1.0,  // The front blue one 
    -0.5, -0.5,   0.0,  0.4,  0.4,  1.0,
     0.5, -0.5,   0.0,  1.0,  0.4,  0.4, 
  ]);
  var n = 9;

  // Create a buffer object
  var vertexColorbuffer = gl.createBuffer();  
  if (!vertexColorbuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Write vertex information to buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorbuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

  var FSIZE = verticesColors.BYTES_PER_ELEMENT;
  // Assign the buffer object to a_Position and enable the assignment
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if(a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
  gl.enableVertexAttribArray(a_Position);
  // Assign the buffer object to a_Color and enable the assignment
  var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if(a_Color < 0) {
    console.log('Failed to get the storage location of a_Color');
    return -1;
  }
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
  gl.enableVertexAttribArray(a_Color);

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
  viewMatrix.setLookAt(g_EyeX, g_EyeY, g_EyeZ, 0, 0, 0, 0, 1, 0);

  // Pass the view projection matrix
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Draw the rectangle
  gl.drawArrays(gl.TRIANGLES, 0, n);
  //gl.drawArrays(gl.LINES, 0, n);
}

