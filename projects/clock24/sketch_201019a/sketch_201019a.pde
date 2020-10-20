


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
int imax;
double scale = 2.0;

//mag is wrong word...
float xctr=800;
float yctr=400;
float xmag=400;
float ymag=400;

void setup() {
  frameRate(12);
  size(1600,800); // = 2x  xctr,yctr   
  String[] items = loadStrings("../worldcities.csv");
  //println(table.getRowCount() + " total rows in table");
  //double scale=2;
  int ii=0;
  for (String x : items) {
    if (ii++ == 0) {
      lats[ii]=-180;
      lngs[ii]=0;
      continue;
    }
    String[] fields = x.split(",");
    double lat = parsed(fields[2]);
    double lng = parsed(fields[3]);  

    lats[ii]=lat;  //-lat+200)*scale;
    lngs[ii]=lng;  //( lng+200)*scale;
    
    
    
    //String species = row.getString("species");
    //String name = row.getString("name");

    //println(name + " (" + species + ") has an ID of " + id);.
  }

  imax=ii;
}

int timeCount = 0;
void draw() {
  timeCount++;
  while (timeCount>36000) {
    timeCount-=36000;
  }
  background(0);
  stroke(200,0,0);
  
  if (imax>8000) imax=8000;  //bugbug !!
  
  for(int ii=0; ii<imax; ii++){
    
    //mercator
    //float x = ( lngs[ii]+200)*scale;
    //float y = (-lats[ii]+200)*scale;
    
    
    //polar warp
    double r = lats[ii] + 180.0;
    double phaseDeg = 2*lngs[ii] + timeCount;
    double t = phaseDeg/360*TAU;
    
    double pd2=mod(270+phaseDeg,720);
    double xo,yo;
    if (pd2<360) {
      stroke(255,255,50);
      xo=xctr*0.50;
      yo=yctr;
    } else {
      xo=xctr*1.50;
      yo=yctr;
      stroke(200,10,10);
    };
    
    r=Math.pow(r,4)/1e+7;
    
    //polar projection
    
    double x=xo+Math.cos(t)*r;
    double y=yo+Math.sin(t)*r;
    
    float xx=(float)x;
    float yy=(float)y;
    point(xx,yy); //lngs[ii],lats[ii]); 
 
  }
  //circle((float)xmag,(float)ymag,20.0); 
  //stroke(0,250,0);
  //float seattle=(58.0+timeCount)/360*TAU ;
  //line(mag, mag, mag+(float)Math.cos(seattle)*mag*0.9, mag+(float)Math.sin(seattle)*mag*0.9);
}
