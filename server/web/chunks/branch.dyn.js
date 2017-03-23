//copyright and other notices at the bottom

class Branch {
    //Branch parent;
    //PVector pos;
    //PVector dir;
    //int count = 0;
    //PVector saveDir;
    //float len = 5;
    
    constructor(v, d) {  //given a vector and direction (i assume they intend), both 3-d vectors
	this.parent=null;;
	this.pos = v.copy();
	this.dir = d.copy();
	this.saveDir = this.dir.copy();
	this.count = 0;
	this.len = 5;
    }
    
    //bugbug whenever see     x=new Branch(q),   replace with    x=q.spawn()
    spawn() {  //given a parent branch
	var retval = this.copy();
	retval.parent = this;
	retval.pos = this.parent.next();
	retval.dir = this.parent.dir.copy();
	retval.saveDir = this.dir.copy();
	retval.count = 0;
	retval.len = 5;
	return retval;
    }
    
    reset() {
	this.count = 0;
	this.dir = this.saveDir.copy();
    }
    
    next() {  //returns 3-vector
	var v=dir.multiplyScalar(this.len);
	var next = v.add(this.pos);
	return next;
    }
}




//changes are copyright 2017 ayvex light industries LLC
//code originally by ...
// Coding Rainbow
// Daniel Shiffman
// http://patreon.com/codingtrain
// Code for: https://youtu.be/JcopTKXt8L8
