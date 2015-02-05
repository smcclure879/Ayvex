//landPerlin.js


var canvas = document.getElementsByTagName('canvas')[0];
//canvas.width = 400;
//canvas.height = 768;

var ctx = canvas.getContext('2d');

var image = ctx.createImageData(canvas.width, canvas.height);
var data = image.data;

var height = 0;

var fn = 'simplex';

function drawFrame() {
  var start = Date.now();
  // Cache width and height values for the canvas.
  var cWidth = canvas.width;
  var cHeight = canvas.height;

  var max = -Infinity, min = Infinity;
  var noisefn = fn === 'simplex' ? noise.simplex3 : noise.perlin3;

  for (var x = 0; x < cWidth; x++) {
    for (var y = 0; y < cHeight; y++) {
      var value = noisefn(x / 100, y / 10, height);

      if (max < value) max = value;
      if (min > value) min = value;

      value = (1 + value) * 1.1 * 128;

      var cell = (x + y * cWidth) * 4;
      data[cell] = data[cell + 1] = data[cell + 2] = value;
      //data[cell] += Math.max(0, (25 - value) * 8);
      data[cell + 3] = 255; // alpha.
    }
  }

  var end = Date.now();

  ctx.fillColor = 'black';
  ctx.fillRect(0, 0, 100, 100);
  ctx.putImageData(image, 0, 0);

  ctx.font = '10px verdana';
  ctx.fillStyle = 'red';
  ctx.textAlign = 'center';
  ctx.fillText(fn + ' rendered in ' + (end - start) + ' ms', cWidth / 2, cHeight - 20);

  if(console) {
    console.log(fn + ' rendered in ' + (end - start) + ' ms', 'range: ' + min + ' to ' + max);
  }

  height += 0.05;
  requestAnimationFrame(drawFrame);
}

document.onclick = function() {
  // Swap noise function on click.
  fn = fn === 'simplex' ? 'perlin' : 'simplex';
};

requestAnimationFrame(drawFrame);
