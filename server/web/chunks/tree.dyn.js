// see bottom for details including copyright




class Tree {

    constructor() {
	this.branches = [];
	this.leaves = [];

	for (var i = 0; i < 200; i++) { //bugbug 2000
	    leaves.add(new Leaf());
	}    

	//bugbug a whole lot of code to add back in!!!  this whole file!


	// var root = new Branch(new THREE.Vector(0,height/2,0), new THREE.Vector(0, -1,0));
	// branches.add(root);
	// var current = new Branch(root);
	
	// while (!closeEnough(current)) {
	//     var trunk = new Branch(current);
	//     branches.add(trunk);
	//     current = trunk;
	// }

    }




    // //boolean
    // closeEnough(b) { // b is a Branch
    // 	leaves.forEach(function(l) {
    // 	    d = PVector.dist(b.pos, l.pos);
    // 	    if (d < max_dist) {
    // 		return true;
    // 	    }
    // 	});
    // 	return false;
    // }
    


    grow() {
	// leaves.forEach(function(l) {
	//     closest = null;  //closest Branch
	//     closestDir = null;  //PVector
	//     var record = -1;
	    
	//     branches.forEach(function(b) {
	// 	PVector dir = PVector.sub(l.pos, b.pos);
	// 	float d = dir.mag();
	// 	if (d < min_dist) {
	// 	    l.reached();
	// 	    closest = null;
	// 	    break;
	// 	} else if (d > max_dist) {
	// 	} else if (closest == null || d < record) {
	// 	    closest = b;
	// 	    closestDir = dir;
	// 	    record = d;
	// 	}
	//     });
	//     if (closest != null) {
	// 	closestDir.normalize();
	// 	closest.dir.add(closestDir);
	// 	closest.count++;
	//     }
	// });
	
	// for (int i = leaves.size()-1; i >= 0; i--) {
	//     if (leaves.get(i).reached) {
	// 	leaves.remove(i);
	//     }
	// }
	
	// for (int i = branches.size()-1; i >= 0; i--) {
	//     Branch b = branches.get(i);
	//     if (b.count > 0) {
	// 	b.dir.div(b.count);
	// 	PVector rand = PVector.random2D();
	// 	rand.setMag(0.3);
	// 	b.dir.add(rand);
	// 	b.dir.normalize();
	// 	Branch newB = new Branch(b);
	// 	branches.add(newB);
	// 	b.reset();
	//     }
	// }
    }
  
//bugbug  
//    show() {
//	for (Leaf l : leaves) {
//	    l.show();
//	}    

	//for (Branch b : branches) {
	// for (int i = 0; i < branches.size(); i++) {
	//     Branch b = branches.get(i);
	//     if (b.parent != null) {
	// 	float sw = map(i, 0, branches.size(), 6, 0);
	// 	strokeWeight(sw);
	// 	stroke(255);
	// 	line(b.pos.x, b.pos.y, b.pos.z, b.parent.pos.x, b.parent.pos.y, b.parent.pos.z);
	//     }
	// }
//    }
}


myClasses["Tree"] = function(seed) { 
    return new Tree(seed); 
};

//function(seed) {
//    return new Tree(seed);  //'bugbug???
//}


// the js port and other changes to this code are copyright 2017 Ayvex Light Industries LLC
//  and licensed under the terms of the web site it is found within.  
// original code is written in Processing from youtube educational material.....
// Coding Rainbow
// Daniel Shiffman
// http://patreon.com/codingtrain
// Code for: https://youtu.be/JcopTKXt8L8
