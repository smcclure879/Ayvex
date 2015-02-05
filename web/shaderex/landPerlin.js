//landPerlin.js


var canvas = document.getElementsByTagName('canvas')[0];
//canvas.width = 400;
//canvas.height = 768;

var ctx = canvas.getContext('2d');

var image = ctx.createImageData(canvas.width, canvas.height);
var data = image.data;

var height = 0;

var fn = 'simplex';



var noisefn = fn === 'simplex' ? noise.simplex3 : noise.perlin3;


function drawFrame() {
  var start = Date.now();
  // Cache width and height values for the canvas.
  var cWidth = canvas.width;
  var cHeight = canvas.height;

  var max = -Infinity, min = Infinity;

  for (var x = 0; x < cWidth; x++) {
    for (var y = 0; y < cHeight; y++) {
      var floatNoise = octaveNoise(x,y,height);   

	  //tracking  (bugbug remove?)
      if (max < floatNoise) max = floatNoise;
      if (min > floatNoise) min = floatNoise;
	  
	  
      var byteNoise = clamp( (floatNoise+1)*1.1*128, 0, 255 );

	  
	  //got "value" (which should be (bugbug) "entropyValue"?)
	  //intermediate variables
	  var altitude=Math.abs(byteNoise)-128*Math.sin(byteNoise%70)/byteNoise*6;
	  var vegitude=byteNoise;

      var cell = (x + y * cWidth) * 4;
      data[cell] = altitude*1/4 + vegitude*3/4 ; 
	  data[cell + 1] = altitude/2 + vegitude/2;
	  data[cell + 2] = 0;
      //data[cell] += Math.max(0, (25 - value) * 8);
      data[cell + 3] = 255; // alpha.
    }
  }

  var end = Date.now();

  //ctx.fillStyle = 'pink';
  //ctx.fillRect(0, 0, 100, 100);
  
  
  // how to map to triangles-to-draw-in-3d space?  voxelsystems like minecraft know the granularity to look at. 
  //we need to be clever here based on distance or something.  need to find local maxima and stuff, decompose into joined_tetrahedra or ____?
  // (the simplexes in simplex optimization could be these??)
  // 
  
  
  
  ctx.putImageData(image, 0, 0);

  ctx.font = '10px verdana';
  ctx.fillStyle = 'blue';
  ctx.textAlign = 'center';
  ctx.fillText(fn + '  ms:'+(end-start)+'  fps:' + Math.floor(1000/(end - start)) , cWidth / 2, cHeight - 20);

  if(console) {
    console.log(fn + ' rendered in ' + (end - start) + ' ms', 'range: ' + min + ' to ' + max);
  }

  //height += 0.05;
  //requestAnimationFrame(drawFrame);
}

function clamp(x,min,max)
{
	if (x<min) 
		return min;
	if (x>max) 
		return max;
	
	return x;
}

function octaveNoise(x,y,z)
{
	return    1/2 * noisefn(x / 13, y / 10, z)  
			- 2/3 * Math.abs(noisefn((x+1000)/391,(y+1000)/290,z/10)) 
			- 1/12 * noisefn(x,y,z*10) 
			- 0.4
	;
}


document.onclick = function() {
  // Swap noise function on click.
  fn = fn === 'simplex' ? 'perlin' : 'simplex';
};

requestAnimationFrame(drawFrame);
