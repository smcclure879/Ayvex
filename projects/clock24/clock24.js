


function unquote(x) {
    if (typeof x == 'undefined') return "";
    if (x.length==0) return "";
    if (x.charAt(0)=='\"') return unquote(x.substring(1));
    let L = x.length;
    if (x.charAt(L-1)=='\"') return unquote(x.substring(0, L-1));
    return x;
}

function parsed(x) {
    x=unquote(x);
    return parseFloat(x);
    //return Double.valueOf(x);
}

//bugbug use division and stuff
function mod( x, y) {
    //crash if y<0
    while (x<0) {
	x+=y;
    }
    while (x>y) {
	x-=y;
    }
    return x;
}
let lats=[];
let lngs=[];
let offs=[];
let imax;
let scale = 2.0;

//mag is wrong word...
let xctr=400;
let yctr=400;
let xmag=400;
let ymag=400;
let f=[];
let coastPolyLats = [];
let coastPolyLngs = [];
let items;
let coastLines;

function preload() {
    items = loadStrings("citySpots2.txt");
    coastLines=loadStrings("world2-cil.txt");
}


function setup() {
    //alert(items.length);
    //alert(coastLines.length);//bugbug you are here why is this zero???

    //prletln(join(PFont.list(),"\n"));

    //f=[];
    let fontname="Ubuntu";
    //move to later? bugbug
    f[1] = [fontname, 12];
    f[0] = [fontname, 36];
    //bugbug urgent frameRate(12);
    createCanvas(1000, 800); // = 2x  xctr,yctr   
 



    
    //prletln(table.getRowCount() + " total rows in table");
    //double scale=2;
    let ii=0;
    for (let jj in items) {
	let x= items[jj];
	//alert(x);
	if (ii == 0) {
	    //south pole
	    lats[0]=-180;
	    lngs[0]=0;
	    offs[0]=1; //bugbug
	    ii++;
	    continue;
	}
	if (x.charAt(0)=='#') 
	    continue;

	let fields = x.split(",");
	let lng = parsed(fields[1]);
	let lat = parsed(fields[2]);  
	let offsec = parsed(fields[3]);

	lats[ii]=lat;  //-lat+200)*scale;
	lngs[ii]=lng;  //( lng+200)*scale;
	offs[ii]=offsec;
	ii++;
	
    }
    imax=ii;
    //alert(lats);
    

    let clat=[];
    let clng=[];
    
    if (coastLines) { //bugbug turn this off for now!
	//bugbug pathing 2x

	for (let jj in coastLines) {
	    let line2=coastLines[jj];
	    
	    if (line2.startsWith("skipping")) {
		continue;
	    }
	    if (line2.startsWith("segment")) {
		if (clat!=null && clat.length>0) {
		    coastPolyLats.push(clat);
		    coastPolyLngs.push(clng);
		}
		clat=[]; 
		clng=[];
		continue;
	    }
	    let coords=line2.split(" ");
	    clat.push(coords[0]);
	    clng.push(coords[1]);
	}

	coastPolyLats.push(clat);
	coastPolyLngs.push(clng);
    }

}

function xof( t, r) { 
    return xctr+Math.cos(t)*r;
}
function yof( t, r) { 
    return yctr+Math.sin(t)*r;
}



function polarWarp(r) { 
    return Math.pow(r, 5)*3.8e-10;
}


let rTick=xmag*0.9;


let timeCount = 0;
function draw() {
    background(0);


    timeCount++;
    while(timeCount>36000){
	timeCount -= 36000;
    }

    let timeC=timeCount/4.0;

    //first draw teh oceans and or the land. 
    noFill(); //(50, 100, 255);
    stroke(80,80,240);

    for (let shapeNum=0; shapeNum<coastPolyLats.length; shapeNum++) {
	let shapeLat=coastPolyLats[shapeNum];
	let shapeLng=coastPolyLngs[shapeNum];
	//alert(shapeLng);
	if (shapeLat==null || shapeLng==null) continue;
	beginShape();
	for (let pointNum=0; pointNum<shapeLat.length; pointNum++) {
	    if (pointNum>100) break; //bugbug
	    let lat=shapeLat[pointNum];  //bugbug find other place in cities we do this and const
	    let lng=shapeLng[pointNum];  //bugbug you are here these need mapping to radians, time etc etc
	    
	    let r=parseFloat(lat)+180.0;
	    //print("\n"+lat+","+lng);
	    let phaseDeg = parseFloat(lng) + timeC;
	    //alert(0.0+parseFloat(lng));
	    const TAU=3.14159265*2;
	    let t = phaseDeg * TAU / 360.0;
	    
	    
	    r=polarWarp(r);
	    //alert(r);
	    let xx=(xof(t,r));
	    let yy=(yof(t,r));
	    vertex(xx, yy);
	    //alert(xx);
	}
	endShape();
    }





    stroke(255, 100, 0);
    noFill();
    if (imax>14000) imax=14000;  //bugbug !!

    //bugbug much of draw could be in setup...whatever we won't put on a slider!
    let seen = {};
    //alert(lats);
    for (let ii=0; ii<imax; ii++) {
	//mercator
	//let x = ( lngs[ii]+200)*scale;
	//let y = (-lats[ii]+200)*scale;
	let r = parseFloat(lats[ii]) + 180.0;
	//double seemingTzLng=Math.floor(24.0*lngs[ii]/360)*360/24;
	let actualTzLng=parseFloat(offs[ii])*360.0/24.0;
	let vlng=(115*parseFloat(lngs[ii]) + 5*actualTzLng)/120;
	let phaseDeg = vlng + timeC;
	//double phaseDegC=Math.floor(24*phaseDeg/360)*360/24;

	const TAU=3.14159265*2;
	let t = phaseDeg * TAU / 360.0;

	//polar warp
	r=polarWarp(r);
	//alert("vlng="+vlng + lngs[ii]);
	//alert(r);
	
	//polar projection

	let x=xof(t, r); 
	let y=yof(t, r);

	let xx=x;
	let yy=y;

	//alert(offs[ii]);

	//weird color (hue) generation
	colorMode(HSB, 60);
	stroke(((parseFloat(offs[ii])*29+112029) %60), 100, 100);
	point(xx,yy); //lngs[ii],lats[ii]);
	
	//(let)(Math.cos(offs[ii]*PI/6)*120+120),
	//(let)(Math.cos(offs[ii]*PI/7)*30+220));




	//bugbug use actualTzLng to draw tick lines for each time zone offset that exists. (letegral at least)
	let tickOffsetDeg =  -2.0 * 360.0/48.0;
	let tt=(actualTzLng + timeC+tickOffsetDeg)*TAU/360.0;  //360/48 = half hour to center it better ??bugbug
	
	if (actualTzLng in seen) {
	    ++seen[actualTzLng];
	} else {
	    seen[actualTzLng]=1;
	}
	tot=seen[actualTzLng];

	let circleSize=Math.sqrt(tot)/3;
	    
	let x1=xof(tt, rTick+circleSize*3-10);
	let y1=yof(tt, rTick+circleSize*3-10);
	circle(x1, y1, circleSize);//bugbug need to only draw one and fill!
	
	
	//bugbug move where city is drawn.. cut brightness? 
	//the actual city
	//circle(xx, yy, 1);...or...  
	//point(xx,yy);
	
    }



    //numbers
    colorMode(RGB, 256);
    fill(0, 250, 200, 200);
    textAlign(CENTER, CENTER);
    for (let hr=0; hr<24; hr+=0.166666667) {
	let hr1=Math.floor(hr);
	let t=TAU*(hr+6)/24;
	let r=xmag*7/8;

	let x = xof(t, r);
	let y = yof(t, r);

	if (hr-hr1<0.03) {
	    textFont(f[hr1%2][0]);
	    text(""+hr1, x, y);
	} else{
	    let rr=1;
	    if (hr-hr1<0.53 && hr-hr1>0.47)
		rr=3;
	    circle(x,y,rr);
	}
	    
    }
}
