
//many changes by smcclure 2013 & 2014 (c)



//bugbug need to break this up into separate camera etc classes




// (c) Dean McNamee <dean@gmail.com>, Dec 2008.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
// IN THE SOFTWARE.
//
// This file implements helpers you might want to use when making a demo.  It
// mostly consists of UI helpers, like a toolbar for toggling modes, mouse
// and camera handling, etc.


//bugbug move to a helpers class?



cos=Math.cos;
sin=Math.sin;
pi=3.14159265;
halfPi=pi/2;
twoPi=pi*2;

function deg(rd) { return rd/pi*180.0; }
function rad(dg) { return dg*pi/180.0; }

function rnd(n)
{
	return Math.floor((Math.random()*n)+1);
}

function min(a, b) {
	if (a < b) return a;
	return b;
}

function max(a, b) {
	if (a > b) return a;
	return b;
}

// Keep c >= a && c <= b.   enforce  a <= c <= b
function clamp(a, b, c) {
	return min(b, max(a, c));
}

//there are only 360 degrees in a circle
function loop(a, b, c) {  //enforce a<=c<=b by "looping around"
	while(c<a) { c+=b; }  //only optimum if not ever exceeding one of these by much
	while(c>b) { c-=b; }
	return c;
}





var DemoUtils = (function() {


  // A Ticker helps you keep a beat, calling a callback based on a target
  // frames-per-second.  You can stop and start the ticker, change the step
  // size, etc.  Your callback will be passed the frame number.
  function Ticker(fps, callback) {
    this.interval_ms_ = 1000 / fps;
    this.callback_ = callback;
    this.t_ = 0;
    this.step_ = 1;
    this.interval_handle_ = null;
  }

  Ticker.prototype.isRunning = function() {
    return this.interval_handle_ !== null;
  };

  Ticker.prototype.start = function(fps, callback) {
    if (this.isRunning())
      return;

    var self = this;
    this.interval_handle_ = setInterval(function() {
      var callback = self.callback_;
      callback(self.t_);
      self.t_ += self.step_;
    }, this.interval_ms_);
  };

  Ticker.prototype.stop = function() {
    if (!this.isRunning())
      return;

    clearInterval(this.interval_handle_);
    this.interval_handle_ = null;
  };

  Ticker.prototype.set_t = function(t) {
    this.t_ = t;
  };

  Ticker.prototype.set_step = function(step) {
    this.step_ = step;
  };

  Ticker.prototype.reverse_step_direction = function() {
    this.step_ = -this.step_;
  };

  function registerTouchListener(canvas, listener) {
    var state = {
      first_event: true,
      is_clicking: false,
      last_x: 0,
      last_y: 0
    };

    canvas.addEventListener('touchstart', function(e) {
      state.is_clicking = true;
      state.last_x = e.touches[0].clientX;
      state.last_y = e.touches[0].clientY;
      // Event was handled, don't take default action.
      e.preventDefault();
      return false;
    }, false);

    canvas.addEventListener('touchend', function(e) {
      state.is_clicking = false;
      // Event was handled, don't take default action.
      e.preventDefault();
      return false;
    }, false);

    canvas.addEventListener('touchmove', function(e) {
      var delta_x = state.last_x - e.touches[0].clientX;
      var delta_y = state.last_y - e.touches[0].clientY;

      state.last_x = e.touches[0].clientX;
      state.last_y = e.touches[0].clientY;

      // We need one event to get calibrated.
      if (state.first_event) {
        state.first_event = false;
      } else {  //this is where main "info" is constructed
		debugSet
        var info = {
          is_clicking: state.is_clicking,
          canvas_x: state.last_x,
          canvas_y: state.last_y,
          delta_x: delta_x,
          delta_y: delta_y,
          touch: true,
          shift: false,
          ctrl: false,
		  isRightClick: (e.which!=0)
        };

        listener(info);
      }

      // Event was handled, don't take default action.
      e.preventDefault();
      return false;
    }, false);
  }



  // Registers some mouse listeners on a <canvas> element, to help you with
  // things like dragging, clicking, etc.  Your callback will get called on
  // any mouse movement, with info / state about the mouse.
  function registerMouseListener(canvas, listener) {
    var state = {
      first_event: true,
      is_clicking: false,
      last_x: 0,
      last_y: 0
    };

    function relXY(e) {
      if (typeof e.offsetX == 'number')
        return {x: e.offsetX, y: e.offsetY};

      // TODO this is my offsetX/Y emulation for Firefox.  I'm not sure it is
      // exactly right, but it seems to work ok, including scroll, etc.
      var off = {x: 0, y: 0};
      var node = e.target;
      var pops = node.offsetParent;
      if (pops) {
        off.x += node.offsetLeft - pops.offsetLeft;
        off.y += node.offsetTop - pops.offsetTop;
      }

      return {x: e.layerX - off.x, y: e.layerY - off.y};
    }

    canvas.addEventListener('mousedown', function(e) {
      var rel = relXY(e);
      state.is_clicking = true;
      state.last_x = rel.x;
      state.last_y = rel.y
      // Event was handled, don't take default action.
      e.preventDefault();
      return false;
    }, false);

    canvas.addEventListener('mouseup', function(e) {
      state.is_clicking = false;
      // Event was handled, don't take default action.
      e.preventDefault();
      return false;
    }, false);

    canvas.addEventListener('mouseout', function(e) {
      state.is_clicking = false;
      // Event was handled, don't take default action.
      e.preventDefault();
      return false;
    }, false);

    canvas.addEventListener('mousemove', function(e) {
      var rel = relXY(e);
      var delta_x = state.last_x - rel.x;
      var delta_y = state.last_y - rel.y;

      // TODO: I'd like to use offsetX here, but it doesn't exist in Firefox.
      // I should make a shim, but you have to do some DOM walking...
      state.last_x = rel.x;
      state.last_y = rel.y;

      // We need one event to get calibrated.
      if (state.first_event) {
        state.first_event = false;
      } else {
        var info = {
          is_clicking: state.is_clicking,
          canvas_x: state.last_x,
          canvas_y: state.last_y,
          delta_x: delta_x,
          delta_y: delta_y,
          shift: e.shiftKey,
          ctrl: e.ctrlKey,
		  isRightClick: (e.button!=0)
        };

        listener(info);
      }

      // Event was handled, don't take default action.
      e.preventDefault();
      return false;
    }, false);
  }

  // Register and translate mouse wheel messages across browsers.
  function registerMouseWheelListener(canvas, listener) {
    function handler(e) {
      // http://www.switchonthecode.com/tutorials/javascript-tutorial-the-scroll-wheel
      listener(e.detail ? -e.detail : e.wheelDelta/40);
      e.stopPropagation();
      e.preventDefault();
      return false;
    }
    // Register on both mousewheel and DOMMouseScroll.  Hopefully a browser
    // only fires on one and not both.
    canvas.addEventListener('DOMMouseScroll', handler, false);
    canvas.addEventListener('mousewheel', handler, false);
  }

  // Register mouse handlers to automatically handle camera:
  //   Mouse -> rotate around origin x and y axis.
  //   Mouse + ctrl -> pan x / y.
  //   Mouse + shift -> pan z.
  //   Mouse + ctrl + shift -> adjust focal length.
  var animate = false;
  function autoCamera(renderer, ix, iy, iz, tx, ty, tz, draw_callback, opts) {
    var camera_state = {
      rotate_x: tx,
      rotate_y: ty,
      rotate_z: tz,
      x: ix,
      y: iy,
      z: iz
    };

	var dirtyCam=true;

    opts = opts !== undefined ? opts : { };

	var dx,dy,dz=0.0;  //to support animation
    function set_camera() {
      var ct = renderer.camera.transform;
      ct.reset();
	  ct.translate(camera_state.x+dx, camera_state.y+dy, camera_state.z+dz);
      ct.rotateZ(camera_state.rotate_z);
      ct.rotateY(camera_state.rotate_y);
      ct.rotateX(camera_state.rotate_x);
    }

	timeStepAng=50;
	timeStepU=1/4;
	function pitch(ang) { camera_state.rotate_x = clamp(-halfPi,+halfPi,camera_state.rotate_x+ang/timeStepAng); dirtyCam=true;}
	function yaw(ang) { camera_state.rotate_y = loop(0,twoPi,camera_state.rotate_y+ang/timeStepAng); dirtyCam=true;}
	function panLeftRight(u)   { u/=timeStepU; a=camera_state.rotate_y; camera_state.x += u*cos(a); camera_state.z += u*sin(a); dirtyCam=true;}
	function panForwardBack(u) { u/=timeStepU; a=camera_state.rotate_y; camera_state.x -= u*sin(a); camera_state.z += u*cos(a); dirtyCam=true;}
	function panUpDown(u) { u/=timeStepU; camera_state.y += u; dirtyCam=true;}




	function myTick(frameNum)
	{
		//debugSet("k=" + DemoUtils.KeyTracker.AsString())
		zstep=0.001;
		dirtyCam=(frameNum<20 || frameNum%fps==0);  //start out false (most of the time)
		if (isDown(40))  pitch(1); //down arrow
		if (isDown(38))  pitch(-1); //up arrow
		if (isDown(37))  yaw(-1);  //left arrow
		if (isDown(39))  yaw( 1);  //right arrow
		if (isDown(81))  panLeftRight(1); //q
		if (isDown(69))  panLeftRight(-1); //e
		if (isDown(87))  panForwardBack( 1);   //w
		if (isDown(83))  panForwardBack(-1);   //s
		if (isDown(82))  panUpDown(-1);  //r
		if (isDown(70))  panUpDown( 1);  //f

		if (animate) animateIt(frameNum);


		redoTheCam(frameNum);
	}

	function redoTheCam(frameNum)
	{
		if (!dirtyCam) return; //no point

		//update control panel
		$("#frameNum").val(frameNum);
		$("#camX").val(camera_state.x);
		$("#camY").val(camera_state.y);
		$("#camZ").val(camera_state.z);
		$("#camRotX").val(deg(camera_state.rotate_x));  //degrees for display only
		$("#camRotY").val(deg(camera_state.rotate_y));
		$("#camRotZ").val(deg(camera_state.rotate_z));

		set_camera();
		draw_callback();
		dirtyCam=false;
	}


	function animateIt(frameNum)
	{
		oscSize=2.0;  //bugbug these and many other speeds depend on the fps.  separate that!
		var ang=frameNum/0.5;
		dx=2.3*oscSize*cos(ang/17);
		dy=2.0*oscSize*sin(ang/13);
		dz=1.2*oscSize*sin(ang/7);

		dirtyCam=true;
	}

	fps=60;  //bugbug settings
	var ticker=new Ticker(fps,myTick);
	dirtyCam=true;
	ticker.start();





    // We debounce fast mouse movements so we don't paint a million times.
    var cur_pending = null;

    function handleCameraMouse(info) {

      if (!info.is_clicking)
        return;

      if (info.shift && info.ctrl) {
        renderer.camera.focal_length = clamp(0.05, 10, renderer.camera.focal_length + (info.delta_y * 0.1) );
      } else if (info.shift) {
        camera_state.z += info.delta_y * 0.1;
        if (opts.zAxisLimit !== undefined && camera_state.z > opts.zAxisLimit) {
          camera_state.z = opts.zAxisLimit;
          // TODO(deanm): This still does a redraw even though maybe the camera
          // didn't actually move (camera_state.z was the same before/after).
          // Since this is user interaction I'm not going to worry about it now.
          // TODO(deanm): This only limits in one direction.
        }
      } else if (info.ctrl) {
        camera_state.x -= info.delta_x;
        camera_state.y += info.delta_y;
      } else if (info.isRightClick) {
        camera_state.rotate_y -= info.delta_x * 0.01;  //bugbug const
        camera_state.rotate_x -= info.delta_y * 0.01;  
      } else {
		//plain bugbug nothing for now
	  }


      if (cur_pending != null)
        clearTimeout(cur_pending);

      cur_pending = setTimeout(function() {
        cur_pending = null;
        set_camera();
        if (info.touch === true) {
          opts.touchDrawCallback(false);
        } else {
          draw_callback();
        }
      }, 0);
    }

    registerMouseListener(renderer.canvas, handleCameraMouse);

    if (opts.touchDrawCallback !== undefined)
      registerTouchListener(renderer.canvas, handleCameraMouse);

    if (opts.panZOnMouseWheel === true) {
      var wheel_scale = opts.panZOnMouseWheelScale !== undefined ?
                          opts.panZOnMouseWheelScale : 30;
      registerMouseWheelListener(renderer.canvas, function(delta_wheel) {
        // Create a fake info to act as if shift + drag happened.
        var fake_info = {
          is_clicking: true,
          canvas_x: null,
          canvas_y: null,
          delta_x: 0,
          delta_y: delta_wheel * wheel_scale,
          shift: true,
          ctrl: false
        };
        handleCameraMouse(fake_info);
      });
    }

    // Set up the initial camera.
    set_camera();
	dirtyCam=true;
  }

  function ToggleToolbar() {
    this.options_ = [ ];
  }

  ToggleToolbar.prototype.addEntry = function(text, initial, callback) {
    this.options_.push([text, !!initial, callback]);
  };

  ToggleToolbar.prototype.populateDiv = function(div) {
    var options = this.options_;
    for (var i = 0, il = options.length; i < il; ++i) {
      var option = options[i];
      var name = option[0];
      var checked = option[1];
      var handler = option[2];
      var span = document.createElement('span');
      span.style.marginRight = '20px';
      var cb = document.createElement('input');
      cb.type = 'checkbox';
      if (checked)
        cb.checked = true;
      cb.addEventListener('change', handler, false);
      span.appendChild(cb);
      span.appendChild(document.createTextNode(' ' + name));
      div.appendChild(span);
    }
  };

  ToggleToolbar.prototype.createBefore = function(element) {
    var div = document.createElement('div');
    this.populateDiv(div);
    var pops = element.parentNode;
    pops.insertBefore(div, pops.firstChild);
  };


	//bugbug move to separate file
	function KeyTracker()
	{
	}

	KeyTracker._daKeys={};
	KeyTracker.isDown=function(c) {return (c in KeyTracker._daKeys);}
	KeyTracker.shouldSkip=function(ev) 
	{
		switch(ev.which)
		{
			case 116: return true; // F5
			case 74: return true;  // J  ...  the "j-hook" (mainly we want shift-ctrl-J to work)
			default: return false;
		}
	};


	KeyTracker.onKeyDown=function(ev)
	{
		if (KeyTracker.shouldSkip(ev)) return;
		KeyTracker._daKeys[ev.which]=1;
		ev.preventDefault();
	}


	KeyTracker.onKeyUp=function(ev)
	{
		if (KeyTracker.shouldSkip(ev)) return;
		delete KeyTracker._daKeys[ev.which];
		ev.preventDefault();
	}

	KeyTracker.AsString = function()
	{
		retval = "";
		for(c=0; c<400; c++)
		{
			retval += (  (KeyTracker.isDown(c))  ?  c+","  :  ""  );
		}
		return retval;
	}


	$(document)
		.keydown(KeyTracker.onKeyDown)
		.keyup(  KeyTracker.onKeyUp);


	function Notify(item,state)
	{
		if (item=="animate")
		{
			animate=state;
		}
	}



  return {
    Ticker: Ticker,
	KeyTracker: KeyTracker,
    registerMouseListener: registerMouseListener,
    autoCamera: autoCamera,
    ToggleToolbar: ToggleToolbar,
	Notify: Notify
  };
})();


