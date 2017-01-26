//thoughts on implementing new "planes"

//scott should be able to build a bunch of stuff and I host it. just 2 files. myWorld.aframe.html and myWorld.js (the latter can be empty)


//<a-plane color="#CCC" height="20" width="20"></a-plane>
//<a-dodecahedron color="#FF926B" radius="5"></a-dodecahedron>


//need the above but in JS

//public
function init(something,cb) {

    var thePlane = new plane(blah blah)
    something.scene.add(thePlane);

    var theDodec = new dodecahedron(blah blah);
    something.scene.add(theDodec);

    
    cb() unless something bad already happened;
}
