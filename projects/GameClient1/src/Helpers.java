import java.util.Random;


public class Helpers
{

	//true constants
	public static final double PI = 3.14159265358979323846;
	
	
	
	public static float cotanD(float angle)
	{
		return cotan(d2r(angle));  //already a float, no cast needed
	}
	
	public static float cotan(float angle) 
	{
		return (float)(1f / Math.tan(angle));
	}
	
	public static float d2r(float degrees) 
	{
		return degrees * (float)(PI / 180d);
	}
	
	public static float sinD(float degrees)
	{
		return (float) Math.sin(d2r(degrees));		
	}
	
	public static float cosD(float degrees)
	{
		return (float) Math.cos(d2r(degrees));		
	}
	
	
	
	
	
	public static float ConstrainAdd(int moduloThis, float a, float b)
	{
		float retval = a+b;
		
		//if (retval>0 && retval<moduloThis) return retval;
		//retval -= ((int)(retval/moduloThis)+)*moduloThis;
		
		//dumb but provably correct way  revisit bugbug
		while(retval<0) retval+=moduloThis;
		while(retval>=moduloThis) retval-=moduloThis;
		return retval;
	}

	public static float AngleAdd(float a, float b)
	{
		return ConstrainAdd(360,a,b);
	}


	
	
	
	private static Random rng=null;
	private static synchronized void initRnd()
	{
		if (rng!=null) return;
		rng=new Random();		
	}

	public static float rnd(int n)
	{
		initRnd();
		return rng.nextFloat()*n;
	}

	public static float rndSym(float radius)
	{
		initRnd();
		return rng.nextFloat()*2*radius-radius;
	}
	
	public static float rnd(float radius)
	{
		initRnd();
		return rng.nextFloat()*radius;
	}

	
}
