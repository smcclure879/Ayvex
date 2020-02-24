// Daniel Shiffman
// http://codingtra.in
// http://patreon.com/codingtrain
// Code for: https://youtu.be/ikwNrFvnL3g

var inc = 0.01;


//always lowercase, always singular, unless a really good reason to do otherwise.
let topics={
    'dog':'red',
    'cat':'green',
    'rat':'blue'
};
//bugbug you are here make the topics feature work.

function preload() {

}

let canvas;
function setup() {
    canvas = createCanvas(680, 380);
    pixelDensity(1);
    canvas.parent('foo');
    canvas.style('z-index:-1');
}

var toff=0;  //in hours
var tbase=Date.parse('20:00  Jan 20, 2020   PST');
function draw() {

    var yoff = 0;
    toff += 1/60;  // of an hour, so a minute
    
    loadPixels();

    for (var y = 0; y < height; y++) {
	var xoff = 0;
	for (var x = 0; x < width; x++) {
	    var index = (x + y * width) * 4;
	    let rt=0;
	    for (var t = 0; t< 3; t++) {
		var r = noise(xoff+t*400, yoff+t*800, toff+t*777) * 255;
		var rm= (r<180)?r:1024;
		pixels[index + t] = rm/4;
		//pixels[index + 1] = 0;
		//pixels[index + 2] = 0;
		rt+=rm;
	    }
	    pixels[index + 3] = rt/16;   //255-rt/4;
	    xoff += inc;
	}
	yoff += inc;
    }
    updatePixels();


    
    let ddd=new Date(tbase+toff*3600000);
    fill(0,255,0);
    textSize(20);
    text(ddd.toISOString().slice(0,17),10,10,400,20);

}
