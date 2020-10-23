


String unquote(String x){
  if (x.length()==0) return "";
  if (x.charAt(0)=='\"') return unquote(x.substring(1));
  int L = x.length();
  if (x.charAt(L-1)=='\"') return unquote(x.substring(0,L-1));
  return x;
}

double parsed(String x){
  x=unquote(x);
  return Double.valueOf(x);
}

//bugbug use division and stuff
double mod(double x, double y){
  //crash if y<0
  while(x<0) {
    x+=y;
  }
  while(x>y) {
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
void setup() {
  
  //println(join(PFont.list(),"\n"));
  
  f=new PFont[2];
  String fontname="Ubuntu";
  f[1] = createFont(fontname,12,true);
  f[0] = createFont(fontname,36,true);
  frameRate(12);
  size(800,800); // = 2x  xctr,yctr   
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
    
    
    //String species = row.getString("species");
    //String name = row.getString("name");

    //println(name + " (" + species + ") has an ID of " + id);.
  }

  imax=ii;
}

float xof(double t, double r) { return (float)(xctr+Math.cos(t)*r); }
float yof(double t, double r) { return (float)(yctr+Math.sin(t)*r); }


int timeCount = 0;
void draw() {
  background(0);
  
  
  timeCount++;
  while (timeCount>36000) {
    timeCount-=36000;
  }
  stroke(255,100,0);
  noFill();
  if (imax>8000) imax=8000;  //bugbug !!
  
    
  for(int ii=0; ii<imax; ii++){
    
    //mercator
    //float x = ( lngs[ii]+200)*scale;
    //float y = (-lats[ii]+200)*scale;
    
    
    //polar warp
    double r = lats[ii] + 180.0;
    double seemingTzLng=Math.floor(24.0*lngs[ii]/360)*360/24;
    double actualTzLng=offs[ii]*360.0/24.0;
    double vlng=(10*lngs[ii] + 2*actualTzLng)/12;
    double phaseDeg = vlng + timeCount/10;
    //double phaseDegC=Math.floor(24*phaseDeg/360)*360/24;
    double t = phaseDeg /360 * TAU;
    
    
    r=Math.pow(r,5)*4e-10;
    
    //polar projection
    
    double x=xof(t,r); 
    double y=yctr+Math.sin(t)*r;
    
    float xx=(float)x;
    float yy=(float)y;
    colorMode(HSB,60);
    //point(xx,yy); //lngs[ii],lats[ii]);
    stroke((int)((offs[ii]*29+112029) %60), 100,100);
           //(int)(Math.cos(offs[ii]*PI/6)*120+120),
           //(int)(Math.cos(offs[ii]*PI/7)*30+220));
    //circle(xx,yy,1);
    point(xx,yy);
  }
  //circle((float)xmag,(float)ymag,20.0); 
  //stroke(0,250,0);
  //float seattle=(58.0+timeCount)/360*TAU ;
  //line(mag, mag, mag+(float)Math.cos(seattle)*mag*0.9, mag+(float)Math.sin(seattle)*mag*0.9);
  
  colorMode(RGB,256);
  fill(0,200,100);
  textAlign(CENTER,CENTER);
  for(int hr=0; hr<24; hr++) {
    double t=TAU*(hr+6)/24;
    double r=xmag*2/3;
   
    float x = xof(t,r);
    float y = yof(t,r);
    textFont(f[hr%2]);
    text(""+hr,x,y);
  }
  

}
