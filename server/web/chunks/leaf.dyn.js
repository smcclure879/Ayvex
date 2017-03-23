//see notice in branch.js 
//(bugbug)


class Leaf {
    //PVector pos;
    //boolean reached = false;
    
    Leaf() {
	this.reached = false;
	this.pos = PVector.random3D();
	this.pos.mult(random(width/2));
	this.pos.y -= height/4;
    }
    
    reached() { 
	this.reached = true; 
    }
    
    //bugbug rename this in the interface to all things tree!!
    show(gather) {
	ja.a.sphere(0.03).red.pos(this.pos) //or maybe need to update that method pos to take this vector class??
	.into(gather);
    }
}

