import java.awt.Font;
import java.io.File;
import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStream;
import java.nio.ByteBuffer;
import java.nio.FloatBuffer;
import java.util.Date;
import java.util.LinkedList;
import java.util.List;

import org.lwjgl.BufferUtils;
import org.lwjgl.LWJGLException;
import org.lwjgl.input.Keyboard;
import org.lwjgl.opengl.Display;
import org.lwjgl.opengl.DisplayMode;
import org.lwjgl.opengl.GL11;
import org.lwjgl.opengl.GL13;
import org.lwjgl.opengl.GL15;
import org.lwjgl.opengl.GL20;
import org.lwjgl.opengl.GL30;
import org.lwjgl.util.glu.GLU;
import org.lwjgl.util.vector.Matrix4f;
import org.lwjgl.util.vector.Vector3f;

import de.matthiasmann.twl.utils.PNGDecoder;
import de.matthiasmann.twl.utils.PNGDecoder.Format;


public class GameClient 
{
	// Entry point for the application
	public static void main(String[] args) 
	{
		try
		{
			new GameClient();
		}
		catch (LWJGLException ex)
		{
			// TODO Auto-generated catch block bugbug
			ex.printStackTrace();
		}
		catch (Exception ex)
		{
			ex.printStackTrace();
		}
	}
	
	
	// UserConfig variables
	private final int WIDTH = 800;
	private final int HEIGHT = 600;
	private String fontList = "Arial Unicode MS;Verdana;Arial";
	//float scaleDelta = 0.1f;
	float posDelta = 0.05f;
	float cameraRotDelta = 1.5f;
	
	//world variables
	private final String WINDOW_TITLE = "Ayvex"; 
	private String extraCharacterList="薰";  //keeping this to support notion we'll be fully unicode someday
	
	
	private Vector3f xHat = new Vector3f(1, 0, 0);
	private Vector3f yHat = new Vector3f(0, 1, 0);
	private Vector3f zHat = new Vector3f(0, 0, 1);
	
	private  List<Ritem> itemsToRender;

	// Shader variables
	private int pId = 0;
	
	// Moving variables
	private int projectionMatrixLocation = 0;
	private int viewMatrixLocation = 0;
	private int modelMatrixLocation = 0;
	private Matrix4f projectionMatrix = null;
	private Matrix4f viewMatrix = null;
	private Matrix4f modelMatrix = null;
	private Vector3f modelPos = null;
	private Vector3f modelAngle = null;
	private Vector3f modelScale = null;
	private Vector3f cameraPos = null;
	private Vector3f cameraAngle = null;
	private Vector3f cameraScale = null;
	private FloatBuffer matrix44Buffer = null;
	
	private String msg = "initVal";
	private TrueTypeFont ttf = null;
	private KeyManager km = null;
	private String positionAndHeading = "";
	private long currentLoopTimeStamp=0;
	
	public GameClient() throws LWJGLException,Exception //for now  (renderer below requires)  bugbug
	{
		this.setupOpenGL();		
		this.setupScene();
		this.setupModelAndCamera();
		this.setupShaders();
		//this.setupTextures();
		this.setupMatrices();
		this.setupFont();
		this.setupKeyManager();
		
		while (!Display.isCloseRequested()) 
		{
			loopCycle();
			Display.sync(60);  // Force a maximum FPS of about 60
			Display.update();  // Let the CPU synchronize with the GPU if GPU is tagging behind
		}
		
		ttf.destroy();
		destroyOpenGL();
		Display.destroy();
	}

	private void setupScene()
	{
		itemsToRender = new LinkedList<Ritem>();
		itemsToRender.add(new Billboard());	
		itemsToRender.add(new PointCloud());
		initAllItems();
	}
	
	private void initAllItems()
	{
		for(Ritem r : itemsToRender)
		{
			r.setup();		
		}

		for(Ritem r : itemsToRender)
		{
			r.init();		
		}

	}
	


	private void setupKeyManager()
	{
		km = new KeyManager();		
	}

	private void setupFont() throws Exception
	{
		for(String fontName : fontList.split(";"))
		{
			if (!TrueTypeFont.isSupported(fontName)) continue; 

			Font awtFont = new Font(fontName,java.awt.Font.PLAIN,18);  //bugbug const
			ttf = new TrueTypeFont(awtFont,true,extraCharacterList);
			msg="HUD using font: "+fontName;
			return;
		}
		
		throw new Exception("none of these fonts are supported:"+fontList);
	}

	private void setupMatrices() 
	{
		// Setup projection matrix
		projectionMatrix = new Matrix4f();
		float fieldOfView = 45f;
		float aspectRatio = (float)WIDTH / (float)HEIGHT;
		float near_plane = 0.1f;
		float far_plane = 100f;
		
		float y_scale = Helpers.cotanD(fieldOfView / 2f);
		float x_scale = y_scale / aspectRatio;
		float frustum_length = far_plane - near_plane;
		
		projectionMatrix.m00 = x_scale;
		projectionMatrix.m11 = y_scale;
		projectionMatrix.m22 = -((far_plane + near_plane) / frustum_length);
		projectionMatrix.m23 = -1;
		projectionMatrix.m32 = -((2 * near_plane * far_plane) / frustum_length);
        projectionMatrix.m33 = 0;
		
		// Setup view matrix
		viewMatrix = new Matrix4f();
		
		// Setup model matrix
		modelMatrix = new Matrix4f();
		
		// Create a FloatBuffer with the proper size to store our matrices later
		matrix44Buffer = BufferUtils.createFloatBuffer(16);
	}


	private void setupOpenGL() 
	{
		try 
		{			
			Display.setDisplayMode(new DisplayMode(WIDTH, HEIGHT));
			Display.setTitle(WINDOW_TITLE);
			Display.create();  
			GL11.glClearColor(0.2f, 0.2f, 0.2f, 0f); //XNA like background color
			GL11.glViewport(0, 0, WIDTH, HEIGHT);  // Map the internal OpenGL coordinate system to the screen			
			setupTransparency();
		}
		catch (LWJGLException e) 
		{
			e.printStackTrace();
			System.exit(-1);
		}
		
		ErrorUtil.exitOnGLError("setupOpenGL");
	}

	private void setupTransparency()
	{
		//do these or the HUD won't have transparency (even if the textures therein are set transparent)
		GL11.glEnable(GL11.GL_BLEND);
		GL11.glBlendFunc(GL11.GL_SRC_ALPHA, GL11.GL_ONE_MINUS_SRC_ALPHA);
	}
	
	

	private void setupModelAndCamera()
	{
		// Set the default quad rotation, scale and position values
		modelPos = new Vector3f(0, 0, 0);
		modelAngle = new Vector3f(0, 0, 0);
		modelScale = new Vector3f(1, 1, 1);
		
		//same for camera/user
		cameraPos = new Vector3f(0, 0, -10);
		cameraAngle = new Vector3f(0, 0, 0);
		cameraScale = new Vector3f(1, 1, 1);
	}
	
	private void setupShaders() 
	{		
		// Load the vertex shader
		int vsId = this.loadShader("assets/shaders/moving/vertex.glsl", GL20.GL_VERTEX_SHADER);
		// Load the fragment shader
		int fsId = this.loadShader("assets/shaders/moving/fragment.glsl", GL20.GL_FRAGMENT_SHADER);
		
		// Create a new shader program that links both shaders
		pId = GL20.glCreateProgram();
		GL20.glAttachShader(pId, vsId);
		GL20.glAttachShader(pId, fsId);

		// Position information will be attribute 0
		GL20.glBindAttribLocation(pId, 0, "in_Position");
		// Color information will be attribute 1
		GL20.glBindAttribLocation(pId, 1, "in_Color");
		// Texture information will be attribute 2
		GL20.glBindAttribLocation(pId, 2, "in_TextureCoord");

		GL20.glLinkProgram(pId);
		GL20.glValidateProgram(pId);

		// Get matrices uniform locations
		projectionMatrixLocation = GL20.glGetUniformLocation(pId,"projectionMatrix");
		viewMatrixLocation = GL20.glGetUniformLocation(pId, "viewMatrix");
		modelMatrixLocation = GL20.glGetUniformLocation(pId, "modelMatrix");

		ErrorUtil.exitOnGLError("setupShaders");
	}
	
	private void logicCycle() 
	{
		setTimeStamp();
		handleInputs();  //kbd,mouse,etc
		updateHudInfo();

		// Reset view and model matrices
		viewMatrix = new Matrix4f();
		modelMatrix = new Matrix4f();		
		
		// Transform camera and model
		scaleTransRotCam(viewMatrix, cameraScale, cameraPos, cameraAngle);
		scaleTransRotObj(modelMatrix, modelScale, modelPos, modelAngle);
		
		// Upload matrices to the uniform variables
		GL20.glUseProgram(pId);
		
		projectionMatrix.store(matrix44Buffer); matrix44Buffer.flip();
		GL20.glUniformMatrix4(projectionMatrixLocation, false, matrix44Buffer);
		viewMatrix.store(matrix44Buffer); matrix44Buffer.flip();
		GL20.glUniformMatrix4(viewMatrixLocation, false, matrix44Buffer);
		modelMatrix.store(matrix44Buffer); matrix44Buffer.flip();
		GL20.glUniformMatrix4(modelMatrixLocation, false, matrix44Buffer);
		
		GL20.glUseProgram(0);
		
		ErrorUtil.exitOnGLError("logicCycle");
	}

	private void setTimeStamp()
	{
		currentLoopTimeStamp=(new Date()).getTime();		
	}

	private void updateHudInfo()
	{
		double ticks2 = ((double)currentLoopTimeStamp)/1000.0;
		positionAndHeading = String.format(" t=%,.2f pos=%.2f,%.2f,%.2f head=%.1f",ticks2,cameraPos.x,cameraPos.y,cameraPos.z,cameraAngle.y);
	}

	private void handleInputs()
	{
		//Vector3f scaleAddResolution = new Vector3f(scaleDelta, scaleDelta, scaleDelta);
		//Vector3f scaleMinusResolution = new Vector3f(-scaleDelta, -scaleDelta, -scaleDelta);		

		handleKeys();
		handleMouse();
	}
		
	private void handleMouse()
	{
		// TODO Auto-generated method stub
		
	}

	private void handleKeys()
	{		
		km.bump(currentLoopTimeStamp);  //have it check for keyboard updates

		if (km.isKeyDown(Keyboard.KEY_LEFT))  	actionCamRotLeft();
		if (km.isKeyDown(Keyboard.KEY_RIGHT)) 	actionCamRotRight();
		if (km.isKeyDown(Keyboard.KEY_UP)) 		actionCamForward();
		if (km.isKeyDown(Keyboard.KEY_DOWN))  	actionCamBackward();
		if (km.isKeyDown(Keyboard.KEY_Q))		actionCamLeft();
		if (km.isKeyDown(Keyboard.KEY_E)) 		actionCamRight();
	}




	private void actionCamLeft()		{		moveCamSide(-0.75f);		} //can't run sideways fast either
	private void actionCamRight() 		{		moveCamSide(+0.75f);		}
	private void actionCamBackward()	{		moveCamFront(-0.75f);		}  //can't run backwards fast (const)
	private void actionCamForward()     {		moveCamFront(1f);        	}
	
	private void moveCamSide(float directionSign)
	{
		moveCam(directionSign,cameraAngle.y+90);
	}
	private void moveCamFront(float directionSign)
	{
		moveCam(directionSign,cameraAngle.y);
	}
	
	private void moveCam(float directionSign, float angle)
	{
		cameraPos.x -= directionSign*posDelta*Helpers.sinD(angle);
		cameraPos.z += directionSign*posDelta*Helpers.cosD(angle);
	}

	
	private void actionCamRotRight()
	{
		cameraAngle.y = Helpers.AngleAdd(cameraAngle.y,cameraRotDelta);
	}

	private void actionCamRotLeft()
	{
		cameraAngle.y = Helpers.AngleAdd(cameraAngle.y,-cameraRotDelta);
	}

	private void actionJump()
	{
		// TODO Auto-generated method stub  bugbug
		
	}

	private void scaleTransRotObj(Matrix4f matrix, Vector3f scale, Vector3f pos, Vector3f angle)
	{
		Matrix4f.scale(scale, matrix, matrix);		
		Matrix4f.translate(pos, matrix, matrix);
		Matrix4f.rotate(d2r(angle.z), zHat, matrix, matrix);
		Matrix4f.rotate(d2r(angle.y), yHat, matrix, matrix);
		Matrix4f.rotate(d2r(angle.x), xHat, matrix, matrix);
	}
	
	private void scaleTransRotCam(Matrix4f matrix, Vector3f scale, Vector3f pos, Vector3f angle)
	{
		Matrix4f.rotate(d2r(angle.x), xHat, matrix, matrix);
		Matrix4f.rotate(d2r(angle.y), yHat, matrix, matrix);
		Matrix4f.rotate(d2r(angle.z), zHat, matrix, matrix);
		Matrix4f.translate(pos, matrix, matrix);
		Matrix4f.scale(scale, matrix, matrix);	
	}
	
	
	private void renderCycle()
	{
		GL11.glClear(GL11.GL_COLOR_BUFFER_BIT | GL11.GL_DEPTH_BUFFER_BIT);     // Clear Screen And Depth Buffer
		render3d();			

		GL11.glBindTexture(GL11.GL_TEXTURE_2D, 0);
		set2dMode(0f, 0f, 600f, 400f);		
		render2d();	
		
		set3dMode();
	}
	


	public static void set2dMode(float x, float y, float x2, float y2) 
	{
    	GL11.glDisable(GL11.GL_DEPTH_TEST);
    	GL11.glDisable(GL11.GL_CULL_FACE);
    	
    	//temporary stash all the matrices...
    	GL11.glMatrixMode(GL11.GL_PROJECTION);                   // Select The Projection Matrix
        GL11.glPushMatrix();                                     // Store The Projection Matrix
        GL11.glLoadIdentity();     

        GL11.glMatrixMode(GL11.GL_MODELVIEW);                    // Select The Modelview Matrix
        GL11.glPushMatrix();                                     // Store The Modelview Matrix
        GL11.glLoadIdentity();                                   // Reset The Modelview Matrix

    	GL11.glMatrixMode(GL11.GL_PROJECTION); 
        //GL11.glOrtho(x, x+width, y, y-height, -1, 100);                          // Set Up An Ortho Screen
        GL11.glOrtho(x, x2, y, y2, -1, 100);  
        GL11.glMatrixMode(GL11.GL_MODELVIEW);
	}
	
	
    public static void set3dMode() 
    {
    	GL11.glMatrixMode(GL11.GL_PROJECTION);                        // Select The Projection Matrix
        GL11.glPopMatrix();                                      // Restore The Old Projection Matrix
        
        GL11.glMatrixMode(GL11.GL_MODELVIEW);                         // Select The Modelview Matrix
        GL11.glPopMatrix();                                      // Restore The Old Projection Matrix
        
        GL11.glEnable(GL11.GL_DEPTH_TEST);
    }
    
	private void render2d()
	{
		this.tinyHud(0, 1, positionAndHeading);
		this.tinyHud(0,2,msg);
	}

	private void render3d() 
	{  		
		GL20.glUseProgram(pId);
		for(Ritem r: itemsToRender)
		{
			r.render();			
		}
		GL20.glUseProgram(0);
		ErrorUtil.exitOnGLError("renderCycle");
	}

	
	private void loopCycle() 
	{
		this.logicCycle();
		this.renderCycle();
		
		ErrorUtil.exitOnGLError("loopCycle");
	}
	
	private void destroyOpenGL() 
	{		
		// Delete the shaders
		GL20.glUseProgram(0);
		GL20.glDeleteProgram(pId);
		
		ErrorUtil.exitOnGLError("destroyOpenGL");
		
		Display.destroy();
	}
	


	private int loadShader(String filename, int type) 
	{
		StringBuilder shaderSource = new StringBuilder();
		int shaderID = 0;
		
		try 
		{
			BufferedReader reader = new BufferedReader(new FileReader(filename));
			String line;
			while ((line = reader.readLine()) != null) 
			{
				shaderSource.append(line).append("\n");
			}
			reader.close();
		}
		catch (IOException e) 
		{
			File f = new File(filename);
			System.err.println("Could not read file."+f.getAbsolutePath());
			e.printStackTrace();
			System.exit(-1);
		}
		
		shaderID = GL20.glCreateShader(type);
		GL20.glShaderSource(shaderID, shaderSource);
		GL20.glCompileShader(shaderID);
		
		if (GL20.glGetShaderi(shaderID, GL20.GL_COMPILE_STATUS) == GL11.GL_FALSE) 
		{
			System.err.println("Could not compile shader.");
			System.err.println("debug info="+GL20.glGetShaderInfoLog(shaderID, 4000));
			System.exit(-1);
		}
		
		ErrorUtil.exitOnGLError("loadShader");
		
		return shaderID;
	}
	
	
	//bugbug absorb into the TTF class??
	private void tinyHud(float col, float row, String txt)
	{
		float scale=0.5f;  //for writing HUD tiny info
		
		int ttfScaleFactor = 8; //bugbug to fontSize?
		ttf.drawString(col*ttfScaleFactor, HEIGHT-ttf.getHeight()*(ttfScaleFactor+scale*row), txt, scale, scale);
		
		//bugbug the old caller lines
		//ttf.drawString(0, HEIGHT-8*ttf.getHeight(), positionAndHeading, scale, scale);
		//ttf.drawString(0, HEIGHT-8.5f*ttf.getHeight(), msg, 0.5f,0.5f);
	}
	
	//WIDTH/2+qbugbug, HEIGHT/2+qbugbug, "薰"+msg, 1f, 1f);
	
	private float d2r(float x) { return Helpers.d2r(x); }

}