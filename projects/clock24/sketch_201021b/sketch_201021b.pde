


String unquote(String x) {
  if (x.length()==0) return "";
  if (x.charAt(0)=='\"') return unquote(x.substring(1));
  int L = x.length();
  if (x.charAt(L-1)=='\"') return unquote(x.substring(0, L-1));
  return x;
}

double parsed(String x) {
  x=unquote(x);
  return Double.valueOf(x);
}

//bugbug use division and stuff
double mod(double x, double y) {
  //crash if y<0
  while (x<0) {
    x+=y;
  }
  while (x>y) {
    x-=y;
  }
  return x;
}
double[] lats=new double[29000];
double[] lngs=new double[29000];
double[] offs=new double[29000];
int imax;
double scale = 2.0;

//mag is wrong word...
float xctr=400;
float yctr=400;
float xmag=400;
float ymag=400;
PFont[] f;
ArrayList<Double[]> coastPolyLats = new ArrayList<Double[]>();
ArrayList<Double[]> coastPolyLngs = new ArrayList<Double[]>();

void setup() {

  //println(join(PFont.list(),"\n"));

  f=new PFont[2];
  String fontname="Ubuntu";
  f[1] = createFont(fontname, 12, true);
  f[0] = createFont(fontname, 36, true);
  frameRate(12);
  size(800, 800); // = 2x  xctr,yctr   
  String[] items = loadStrings("../citySpots2.txt");
  //println(table.getRowCount() + " total rows in table");
  //double scale=2;
  int ii=0;
  for (String x : items) {
    if (ii++ == 0) {
      //south pole
      lats[ii]=-180;
      lngs[ii]=0;
      continue;
    }
    if (x.charAt(0)=='#') 
      continue;

    String[] fields = x.split(",");
    double lng = parsed(fields[1]);
    double lat = parsed(fields[2]);  
    double offsec = parsed(fields[3]);

    lats[ii]=lat;  //-lat+200)*scale;
    lngs[ii]=lng;  //( lng+200)*scale;
    offs[ii]=offsec;
  }
  imax=ii;

  Double[] likeThis=new Double[3];
  ArrayList<Double> clat=null;
  ArrayList<Double> clng=null;
  
  if (true) { //bugbug turn this off for now!
    //bugbug pathing 2x
    String[] coastLines=loadStrings("../world2-cil.txt");

    for (String line2 : coastLines) {
      if (line2.startsWith("skipping")) {
        continue;
      }
      if (line2.startsWith("segment")) {
        if (clat!=null && clat.size()>0) {
          coastPolyLats.add(clat.toArray(likeThis));
          coastPolyLngs.add(clng.toArray(likeThis));
        }
        clat=new ArrayList<Double>(); 
        clng=new ArrayList<Double>();
        continue;
      }
      String[] coords=line2.split(" ");
      clat.add(Double.parseDouble(coords[0]));
      clng.add(Double.parseDouble(coords[1]));
    }

    coastPolyLats.add(clat.toArray(likeThis));
    coastPolyLngs.add(clng.toArray(likeThis));
  }
}

float xof(double t, double r) { 
  return (float)(xctr+Math.cos(t)*r);
}
float yof(double t, double r) { 
  return (float)(yctr+Math.sin(t)*r);
}



double polarWarp(double r) { 
  return Math.pow(r, 5)*4e-10;
}


double rTick=xmag*0.9;


int timeCount = 0;
void draw() {
  background(0);


  timeCount++;
  while (timeCount>36000) {
    timeCount-=36000;
  }

  double timeC=timeCount/4.0;

  //first draw teh oceans and or the land. 
  noFill(); //(50, 100, 255);
  stroke(150,120,0);

  for (int shapeNum=0; shapeNum<coastPolyLats.size(); shapeNum++) {
    Double[] shapeLat=coastPolyLats.get(shapeNum);
    Double[] shapeLng=coastPolyLngs.get(shapeNum);

    if (shapeLat==null || shapeLng==null) continue;
    beginShape();
    for (int pointNum=0; pointNum<shapeLat.length; pointNum++) {
      if (pointNum>100) break; //bugbug
      double lat=shapeLat[pointNum];  //bugbug find other place in cities we do this and const
      double lng=shapeLng[pointNum];  //bugbug you are here these need mapping to radians, time etc etc
 
      double r=lat+180.0;
      //print("\n"+lat+","+lng);
      double phaseDeg = lng + timeC;
      double t = phaseDeg * TAU / 360.0;
    
    
      r=polarWarp(r);

      float xx=(float)(xof(t,r));
      float yy=(float)(yof(t,r));
      vertex(xx, yy);
         
    }
    endShape();
  }





  stroke(255, 100, 0);
  noFill();
  if (imax>14000) imax=14000;  //bugbug !!

  //bugbug much of draw could be in setup...whatever we won't put on a slider!
  HashMap<Double, Integer> seen = new HashMap<Double, Integer>();

  for (int ii=0; ii<imax; ii++) {

    //mercator
    //float x = ( lngs[ii]+200)*scale;
    //float y = (-lats[ii]+200)*scale;

    double r = lats[ii] + 180.0;
    //double seemingTzLng=Math.floor(24.0*lngs[ii]/360)*360/24;
    double actualTzLng=offs[ii]*360.0/24.0;
    double vlng=(119*lngs[ii] + 1*actualTzLng)/120;
    double phaseDeg = vlng + timeC;
    //double phaseDegC=Math.floor(24*phaseDeg/360)*360/24;
    double t = phaseDeg * TAU / 360;


    //polar warp
    r=polarWarp(r);


    //polar projection

    double x=xof(t, r); 
    double y=yof(t, r);

    float xx=(float)x;
    float yy=(float)y;

    //weird color (hue) generation
    colorMode(HSB, 60);
    //point(xx,yy); //lngs[ii],lats[ii]);
    stroke((int)((offs[ii]*29+112029) %60), 100, 100);
    //(int)(Math.cos(offs[ii]*PI/6)*120+120),
    //(int)(Math.cos(offs[ii]*PI/7)*30+220));




    //bugbug use actualTzLng to draw tick lines for each time zone offset that exists. (integral at least)
    double tickOffsetDeg =  - 360.0/48.0;
    double tt=(actualTzLng + timeC+tickOffsetDeg)*TAU/360.0;  //360/48 = half hour to center it better ??bugbug
    double x1=xof(tt, rTick);
    double y1=yof(tt, rTick);
    if (!seen.containsKey(actualTzLng)) {

      //circle((float)x1,(float)y1,8);
      seen.put(actualTzLng, 1);
    } else {
      int tot=seen.get(actualTzLng)+1;
      seen.put(actualTzLng, tot); 
      circle((float)x1, (float)y1, int(sqrt(tot)/2));//bugbug need to only draw one and fill!
    }

    circle(xx, yy, 1);
    //point(xx,yy);
  }



  //numbers
  colorMode(RGB, 256);
  fill(0, 200, 200, 200);
  textAlign(CENTER, CENTER);
  for (int hr=0; hr<24; hr++) {
    double t=TAU*(hr+6)/24;
    double r=xmag*7/8;

    float x = xof(t, r);
    float y = yof(t, r);
    textFont(f[hr%2]);
    text(""+hr, x, y);
  }
}
