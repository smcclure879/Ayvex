  
// (c) Dean McNamee <dean@gmail.com>.  All rights reserved.
function start3d() 
{
  var screen_canvas = document.getElementById('c');
  var renderer = new Pre3d.Renderer(screen_canvas);

  // Hook into the canvas for draw debugging.
  //   - bezier cubic curve
  //     - red: control point 0
  //     - green: control point 1
  //     - blue: end point
  var orig_bezierCurveTo = renderer.ctx.bezierCurveTo;
  function debug_bezierCurveTo(c0x, c0y, c1x, c1y, epx, epy) 
  {
    this.save();
    this.setFillColor(1, 0, 0, 1);
    this.fillRect(c0x, c0y, 3, 3);
    this.setFillColor(0, 1, 0, 1);
    this.fillRect(c1x, c1y, 3, 3);
    this.setFillColor(0, 0, 1, 1);
    this.fillRect(epx, epy, 3, 3);
    this.restore();
    orig_bezierCurveTo.call(this, c0x, c0y, c1x, c1y, epx, epy);
  } 

  var theDrawings = getMap();

  
  renderer.ctx.setStrokeColor(0x52 / 255, 0xbb / 255, 0x5c / 255, 1);
  renderer.ctx.lineWidth = 1;

  function draw() 
  {
    renderer.transform.reset();
    //don't translate model at all (bugbug) renderer.transform.translate(0, 0, 0);  // Center over the origin.  //bugbug this is actually the "center of rotation point" for model rotation
    // Elongate our spiral a bit (stretch in the z direction).
    renderer.transform.scale(1, 1, 1);  //bugbug stretch warranted??
	//renderer.transform.translate(0, 0, -10);  //bugbug attempt to 
    
	// White background.
    renderer.ctx.setFillColor(1, 1, 1, 1);
    renderer.drawBackground();

	for(var ii=0,lim=theDrawings.length; ii<lim; ii++)
	{
		var drawing = theDrawings[ii];
		renderer.drawPath(drawing);
	}
  }

  
  renderer.camera.focal_length = 3;  //bugbug originally 1/2
  
  //"this looks like a good spot"--found by flying around the model
  // camX=-157;
  // camY=-176;
  // camZ=-39;
  // camRotX=0.42;
  // camRotY=rad(250);
  // camRotZ=0;
  camX=165;
  camY=-656;
  camZ=-683;
  camRotX=rad(52);
  camRotY=rad(351);
  camRotZ=0;
  
  
  DemoUtils.autoCamera(renderer, camX, camY, camZ, camRotX, camRotY, camRotZ, draw);

  var toolbar = new DemoUtils.ToggleToolbar();
  toolbar.addEntry('Debug points', false, function(e) {
    if (this.checked) {
      renderer.ctx.bezierCurveTo = debug_bezierCurveTo;
    } else {
      renderer.ctx.bezierCurveTo = orig_bezierCurveTo;
    }
    draw();
  });
   toolbar.populateDiv(document.getElementById('toolbar'));


  draw();

}