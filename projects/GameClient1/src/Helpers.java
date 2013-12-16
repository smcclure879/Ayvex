
public class Helpers
{

	public static float ConstrainAdd(int moduloThis, float a, float b)
	{
		float retval = a+b;
		
		//if (retval>0 && retval<moduloThis) return retval;
		//retval -= (int)(retval/moduloThis)*moduloThis;
		
		//dumb but provably correct way  revisit bugbug
		while(retval<0) retval+=moduloThis;
		while(retval>=moduloThis) retval-=moduloThis;
		return retval;
	}

	public static float AngleAdd(float a, float b)
	{
		return ConstrainAdd(360,a,b);
	}

	
}
