  
// (c) Dean McNamee <dean@gmail.com>.  All rights reserved.
function start3d(theDrawings,opts) 
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

	renderer.ctx.setStrokeColor(0x52 / 255, 0xbb / 255, 0x5c / 255, 1);
	renderer.ctx.lineWidth = 1;

	function draw() 
	{		
		if (!theDrawings) 
		{
			debugSet("no drawings");
			return;
		}
		renderer.transform.reset();
		//here, we could be translating model, but don't
		//renderer.transform.translate(0, 0, 0);  // Center over the origin.  

		renderer.transform.scale(1, 1, 1);  //todo consider if need stretch in Z  //bugbug needed?

		renderer.ctx.setFillColor(mainBgColor);  //bugbug settings
		renderer.drawBackground();

		for(var ii=0,lim=theDrawings.length; ii<lim; ii++)
		{
			var drawing = theDrawings[ii];			
			drawIt(drawing);
		}
		
		for(var key in theDrawings.dynamic)
		{
			var drawing = theDrawings.dynamic[key];
			drawIt(drawing);
		}
		
		//todo renderer.drawReticle();  //in screen coords
	}
	
	function drawIt(drawing)
	{
		renderer.camera.transform.check();  //bugbug assert  //bugbug needed???
		if (drawing instanceof iDrawable) 
		{
			var log2Size=1;  //a 2m object (bugbug)
			drawing.draw(renderer,log2Size);
		}
		else  //have the renderer do it
		{
			renderer.drawPath(drawing);
		}
	}
	  
	//bugbug move this function into the renderer (pre3d.js function getnearest )
	function findNearest(x,y,selectIt) //callback from demoUtils.js function handleCameraMouse
	{
		var best={closestDrawingIndex:-1,closestPointIndex:-1,bestQuadranceSoFar:40000};  //quadrance=dist*dist //bugbug const
		var lim=theDrawings.length;
		var ii=0;
		for(; ii<lim; ii++)  //ii=drawingNumber
		{
			var drawing = theDrawings[ii];
			if (drawing instanceof iDrawable)
			{
				best = drawing.getNearest(x,y,renderer,best,ii);  //ii passed only for selection
			}
			else  //have the renderer do it
			{
				//pass the best thru, and insist it hand the old or new best back out  (end up with path#, point #, point serialNum, distance between click and selectPoint
				best = renderer.getNearest(drawing,x,y,best,ii);  
			}

		}
		if (selectIt) select(best);
		return best;
	}
  

	var selectedItem=null;
	//best == newly selected item (best match to mouseclick)
	function select(bestItem)  
	{
		if (bestItem==null || bestItem.closestPointIndex<0) return;
		
		//debugSet(bestItem.closestDrawingIndex+","+bestItem.closestPointIndex);
		
		//clear out the old selection
		if (selectedItem!=null && selectedItem.closestDrawingIndex>=0) 
		{
			theDrawings[selectedItem.closestDrawingIndex].isSelected=false;
		}
		
		//actually perform new selection
		selectedItem=bestItem;
		theDrawings[bestItem.closestDrawingIndex].isSelected=true;
		theDrawings[bestItem.closestDrawingIndex].closestPointIndex=bestItem.closestPointIndex;
	};
	

	renderer.camera.focal_length = 3;  //bugbug settings originally 1/2

	//"this looks like a good spot"--found by flying around the model
	camX=165;
	camY=-656;
	camZ=-683;
	camRotX=rad(52);
	camRotY=rad(351);
	camRotZ=0;

	//bugbug move some of this into structures (camPos&Orient) and into opts (e.g. draw and findNearest)
	//bugbug are there more opts???  the callee supports more!
	DemoUtils.autoCamera(renderer, camX, camY, camZ, camRotX, camRotY, camRotZ, draw, findNearest, opts);

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


	//too early to draw() here, wait for tick()

}