


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

//so can I then have a bunch of planes, and I'm drifting in space around them?  can see 100 of them at once?  (once again, planes should be smart enough to deal..."oh I'm being looked at from over 1 plane radius away?  I'll just show a static model, plus list of players there if allowed by my rules). 

//ah, so part of the base class logic is logic to dynamically load parts of my JS later?  oops...we need a protocol for giving different sizes of the same file, and only load up to the level of that file that we need.  scottPlane_01.js  scottPlane_02.js etc?  each bigger and more details of script?

//or a persistent database on backend to store the changes to the land?  well we have to have one of those.  at least one per plane. for those planes that track that

//can teh persistent store be some DHT, ride on top bittorrent or something?

//we want...
//easy to make an easy plane (a bunch of figures, import some aframe, whatever....so yes we need HTML
//easy to make a code plane (there is a sample code you can mod)
//best stuff from a plane can be brought into plane0.  (can pull in code and objects, e.g. this cool tree code and params)
//an experimental plane can go into the main tree, but only users who ask for it get in (yes I know its experiment, but I'll follow you in there)
//a plane should be checkable in to a branch/folder/whatever in git, not some settings etc.

//implications:
//planes need to be listed in the user object.  each user has a currentPlane (possibly other planes they are connected to? viewing? feel at home in?)
//each plane should only have a finite number of planes visible from there, or a way to dynamically just see some of them
//they need a way to unload themselves.




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
