import org.lwjgl.opengl.Display;
import org.lwjgl.opengl.GL11;
import org.lwjgl.util.glu.GLU;


public final class ErrorUtil
{	
	public static void exitOnGLError(String errorMessage) 
	{
		int errorValue = GL11.glGetError();
		
		if (errorValue == GL11.GL_NO_ERROR) return;
		//else handle the error...
		
		String errorString = GLU.gluErrorString(errorValue);
		System.err.println("ERROR - " + errorMessage + ": " + errorString);
		
		if (Display.isCreated()) Display.destroy();
		System.exit(-1);		
	}
}
