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

var DemoUtils = (function() {

  function min(a, b) {
    if (a < b) return a;
    return b;
  }

  function max(a, b) {
    if (a > b) return a;
    return b;
  }

  // Keep c >= a && c <= b.
  function clamp(a, b, c) {
    return min(b, max(a, c));
  }

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
  
  
  // function registerKeyListener(canvas, listener)  { bugbug
	// window.AddEventListener('keydown',function(e){
		// debugSet("bugbug38");  //bugbug need keys working
		// switch(e.keyCode) {
			// case 38: 
				// break;
			// default:
				// break;
		// }
	
	// }
	// );
  
  // }
  
  
  

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

	  
	  //bugbug try to see if "which" is working...
	  if (e.which!=0) debugSet("which"+e.which);
	  
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
  function autoCamera(renderer, ix, iy, iz, tx, ty, tz, draw_callback, opts) {
    var camera_state = {
      rotate_x: tx,
      rotate_y: ty,
      rotate_z: tz,
      x: ix,
      y: iy,
      z: iz
    };

    opts = opts !== undefined ? opts : { };

    function set_camera() {
      var ct = renderer.camera.transform;
      ct.reset();
	  ct.translate(camera_state.x, camera_state.y, camera_state.z);
      ct.rotateZ(camera_state.rotate_z);
      ct.rotateY(camera_state.rotate_y);
      ct.rotateX(camera_state.rotate_x);      
    }

	cos=Math.cos;
	sin=Math.sin;
	
	//bugbug needed???
	// pi=3.14159265;
	// halfPi=pi/2;
	// twoPi=pi*2;
	
	timeStepAng=100;
	timeStepU=1;
	function pitch(ang) { camera_state.rotate_x += ang/timeStepAng; dirtyCam=true;}
	function yaw(ang) { camera_state.rotate_y += ang/timeStepAng; dirtyCam=true;}
	function panLeftRight(u)   { u/=timeStepU; a=camera_state.rotate_y; camera_state.x += u*cos(a); camera_state.z += u*sin(a); dirtyCam=true;}
	function panForwardBack(u) { u/=timeStepU; a=camera_state.rotate_y; camera_state.x -= u*sin(a); camera_state.z += u*cos(a); dirtyCam=true;}
	function panUpDown(u) { u/=timeStepU; camera_state.y += u; dirtyCam=true;}
	
	
	
	var dirtyCam=false;
	function myTick(frameNum)
	{
		debugSet("k=" + DemoUtils.KeyTracker.AsString())
		zstep=0.001;
		dirtyCam=false;
		if (isDown(40))  pitch(-1); //down arrow
		if (isDown(38))  pitch( 1); //up arrow
		if (isDown(37))  yaw(-1);  //left arrow
		if (isDown(39))  yaw( 1);  //right arrow
		if (isDown(81))  panLeftRight(1); //q
		if (isDown(69))  panLeftRight(-1); //e
		if (isDown(87))  panForwardBack( 1);   //w
		if (isDown(83))  panForwardBack(-1);   //s
		if (isDown(82))  panUpDown(-1);  //r
		if (isDown(70))  panUpDown( 1);  //f
		
		if (dirtyCam) {set_camera(); draw_callback();}  //bugbug too many places we call this?  one dirty bit for all?
	}
	
	fps=30;  //bugbug settings
	var ticker=new Ticker(fps,myTick);
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
        camera_state.x -= info.delta_x * 1;  //bugbug need to work with scaling consts mastered in cameraAndStuff 
        camera_state.y += info.delta_y * 1;
      } else if (info.isRightClick) { 
        camera_state.rotate_y -= info.delta_x * 0.01;
        camera_state.rotate_x -= info.delta_y * 0.01;  //right drag not working  bugbug you are here
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
	KeyTracker.shouldSkip=function(ev) {return (ev.which==116);}  //F5 ...bugbug others?
	
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



  return {
    Ticker: Ticker,
	KeyTracker: KeyTracker,
    registerMouseListener: registerMouseListener,
    autoCamera: autoCamera,
    ToggleToolbar: ToggleToolbar
  };
})();