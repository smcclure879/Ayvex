


//thoughts on implementing new "planes"

//scott should be able to build a bunch of stuff and I host it. just 2 files. myWorld.aframe.html and myWorld.js (the latter can be empty)


//<a-plane color="#CCC" height="20" width="20"></a-plane>
//<a-dodecahedron color="#FF926B" radius="5"></a-dodecahedron>


//need the above but in JS...why should it be JS?  we want all HTML, these objects we want as "objects"...JSON would be the best representation??
// JS because then we want to "do" things with them, because then we can have JS objects (the DOMness of the underlying AFRame is not to be ignored)



//load on demand

//what if one user is on plane A, another on plane B, and they are  in a call together???
//  ...loadOutside, ...loadInside()  nope...smart enough base class to see where the current local user is looking at it from, and
// only instantiate what we need to!

//so can I then have a bunch of planes, and I'm drifting in space around them?  can see 100 of them at once?  (once again, planes should be smart enough to deal..."oh I'm being looked at from over 1 plane radius away?  I'll just show a static model, plus list of players there if allowed by my rules)



//public interface
function init(something,cb) {
    //called to instantiate this plane on a server
    
}

    





function init(something,cb) {

    var thePlane = new plane(blah blah)
    something.scene.add(thePlane);

    var theDodec = new dodecahedron(blah blah);
    something.scene.add(theDodec);

    
    cb() unless something bad already happened;
}
