import java.awt.Font;
import java.awt.GraphicsEnvironment;
import java.io.File;
import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStream;
import java.nio.ByteBuffer;
import java.nio.FloatBuffer;

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
	
	// Setup variables
	private final String WINDOW_TITLE = "GameClient1";  //bugbug
	private final int WIDTH = 600;
	private final int HEIGHT = 400;
	
	//true constants
	private final double PI = 3.14159265358979323846;
	private Vector3f xHat = new Vector3f(1, 0, 0);
	private Vector3f yHat = new Vector3f(0, 1, 0);
	private Vector3f zHat = new Vector3f(0, 0, 1);
	
	
	// Quad variables
	private int vaoId = 0;
	private int vboId = 0;
	private int vboiId = 0;
	private int indicesCount = 0;
	private VertexData[] vertices = null;
	private ByteBuffer verticesByteBuffer = null;
	// Shader variables
	private int pId = 0;
	// Texture variables
	private int[] texIds = new int[] {0, 0};
	private int textureSelector = 0;
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
	private float qbugbug = 1;
	
	public GameClient() throws LWJGLException,Exception //for now  (renderer below requires)  bugbug
	{
		this.setupOpenGL();		
		this.setupQuad();
		this.setupShaders();
		this.setupTextures();
		this.setupMatrices();
		
		String fontName = "Arial Unicode MS";
		if (!TrueTypeFont.isSupported(fontName)) 
		{  
		   throw new Exception("font not supported:"+fontName);
		}
		Font awtFont = new Font(fontName,java.awt.Font.PLAIN,18);
		ttf = new TrueTypeFont(awtFont,true,"薰".toCharArray());
	    
		
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

	private void setupMatrices() 
	{
		// Setup projection matrix
		projectionMatrix = new Matrix4f();
		float fieldOfView = 45f;
		float aspectRatio = (float)WIDTH / (float)HEIGHT;
		float near_plane = 0.1f;
		float far_plane = 100f;
		
		float y_scale = cotanD(fieldOfView / 2f);
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

	private void setupTextures() 
	{
		texIds[0] = this.loadPNGTexture("assets/images/stGrid1.png", GL13.GL_TEXTURE0);
		texIds[1] = this.loadPNGTexture("assets/images/stGrid2.png", GL13.GL_TEXTURE0);		
		this.exitOnGLError("setupTexture");
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
		
		this.exitOnGLError("setupOpenGL");
	}

	private void setupTransparency()
	{
		//do these or the HUD won't have transparency (even if the textures therein are set transparent)
		GL11.glEnable(GL11.GL_BLEND);
		GL11.glBlendFunc(GL11.GL_SRC_ALPHA, GL11.GL_ONE_MINUS_SRC_ALPHA);
	}
	
	private void setupQuad() 
	{
		VertexData v0 = new VertexData(); 
		v0.setXYZ(-0.5f, 0.5f, 0); v0.setRGB(1, 0, 0); v0.setST(0, 0);
		VertexData v1 = new VertexData(); 
		v1.setXYZ(-0.5f, -0.5f, 0); v1.setRGB(0, 1, 0); v1.setST(0, 1);
		VertexData v2 = new VertexData(); 
		v2.setXYZ(0.5f, -0.5f, 0); v2.setRGB(0, 0, 1); v2.setST(1, 1);
		VertexData v3 = new VertexData(); 
		v3.setXYZ(0.5f, 0.5f, 0); v3.setRGB(1, 1, 1); v3.setST(1, 0);
		
		vertices = new VertexData[] {v0, v1, v2, v3};
		
		// Put each 'Vertex' in one FloatBuffer
		verticesByteBuffer = BufferUtils.createByteBuffer(vertices.length * VertexData.stride);				
		FloatBuffer verticesFloatBuffer = verticesByteBuffer.asFloatBuffer();
		for (int i = 0; i < vertices.length; i++) 
		{
			// Add position, color and texture floats to the buffer
			verticesFloatBuffer.put(vertices[i].getElements());
		}
		verticesFloatBuffer.flip();
		
		
		// OpenGL expects to draw vertices in counter clockwise order by default
		byte[] indices = 
		{
				0, 1, 2,
				2, 3, 0
		};
		indicesCount = indices.length;
		ByteBuffer indicesBuffer = BufferUtils.createByteBuffer(indicesCount);
		indicesBuffer.put(indices);
		indicesBuffer.flip();
		
		// Create a new Vertex Array Object in memory and select it (bind)
		vaoId = GL30.glGenVertexArrays();
		GL30.glBindVertexArray(vaoId);
		
		// Create a new Vertex Buffer Object in memory and select it (bind)
		vboId = GL15.glGenBuffers();
		GL15.glBindBuffer(GL15.GL_ARRAY_BUFFER, vboId);
		GL15.glBufferData(GL15.GL_ARRAY_BUFFER, verticesFloatBuffer, GL15.GL_STREAM_DRAW);
		
		// Put the position coordinates in attribute list 0
		GL20.glVertexAttribPointer(0, VertexData.positionElementCount, GL11.GL_FLOAT, false, VertexData.stride, VertexData.positionByteOffset);
		// Put the color components in attribute list 1
		GL20.glVertexAttribPointer(1, VertexData.colorElementCount, GL11.GL_FLOAT, false, VertexData.stride, VertexData.colorByteOffset);
		// Put the texture coordinates in attribute list 2
		GL20.glVertexAttribPointer(2, VertexData.textureElementCount, GL11.GL_FLOAT, false, VertexData.stride, VertexData.textureByteOffset);
		
		GL15.glBindBuffer(GL15.GL_ARRAY_BUFFER, 0);
		
		// Deselect (bind to 0) the VAO
		GL30.glBindVertexArray(0);
		
		// Create a new VBO for the indices and select it (bind) - INDICES
		vboiId = GL15.glGenBuffers();
		GL15.glBindBuffer(GL15.GL_ELEMENT_ARRAY_BUFFER, vboiId);
		GL15.glBufferData(GL15.GL_ELEMENT_ARRAY_BUFFER, indicesBuffer, GL15.GL_STATIC_DRAW);
		GL15.glBindBuffer(GL15.GL_ELEMENT_ARRAY_BUFFER, 0);
		
		// Set the default quad rotation, scale and position values
		modelPos = new Vector3f(0, 0, 0);
		modelAngle = new Vector3f(0, 0, 0);
		modelScale = new Vector3f(1, 1, 1);
		
		//same for camera/user
		cameraPos = new Vector3f(0, 0, -10);
		cameraAngle = new Vector3f(0, 0, 0);
		cameraScale = new Vector3f(1, 1, 1);
		
		
		this.exitOnGLError("setupQuad");
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

		this.exitOnGLError("setupShaders");
	}
	
	private void logicCycle() 
	{
		handleInputs();  //keyboard actions and stuff
		
		//-- Update matrices
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
		
		this.exitOnGLError("logicCycle");
	}

	private void handleInputs()
	{
		//Vector3f scaleAddResolution = new Vector3f(scaleDelta, scaleDelta, scaleDelta);
		//Vector3f scaleMinusResolution = new Vector3f(-scaleDelta, -scaleDelta, -scaleDelta);		

		//float rotationDelta = 15f;
		//float scaleDelta = 0.1f;
		float posDelta = 0.5f;
		float cameraRotDelta = 1f;
		
		while(Keyboard.next()) 
		{			
			msg = "keyNum="+ Keyboard.getEventKey();			
			
			// Only listen to events where the key was pressed (down event)
			if (!Keyboard.getEventKeyState()) continue;
			
//			bugbug keyboard.iskeydown  isrepeateven
			
			// Switch textures depending on the key released
			switch (Keyboard.getEventKey()) 
			{
				case Keyboard.KEY_1:
					textureSelector = 0;
					break;
				case Keyboard.KEY_2:
					textureSelector = 1;
					break;	
	
				//users turns
				case Keyboard.KEY_LEFT: 
					cameraAngle.y -= cameraRotDelta;
					break;
				case Keyboard.KEY_RIGHT:
					cameraAngle.y += cameraRotDelta;
					break;
					
				//user steps
				case Keyboard.KEY_DOWN:  //back
					cameraPos.x += posDelta*sinD(cameraAngle.y);
					cameraPos.z -= posDelta*cosD(cameraAngle.y);
					break;
				case Keyboard.KEY_UP:  //forward
					cameraPos.x -= posDelta*sinD(cameraAngle.y);
					cameraPos.z += posDelta*cosD(cameraAngle.y);
					break;	
				
				case Keyboard.KEY_Q: 
					break;
				case Keyboard.KEY_W: //turn left
					cameraAngle.y += cameraRotDelta;
					break;
				
				case Keyboard.KEY_SPACE: //debugging for now
					qbugbug *= 1.10;
					break;
	
				// model scale, rotation and translation values
	
				// model Move
//				case Keyboard.KEY_UP:
//					modelPos.y += posDelta;
//					break;
//				case Keyboard.KEY_DOWN:
//					modelPos.y -= posDelta;
//					break;

				// model Rotation
//				case Keyboard.KEY_LEFT:
//					modelAngle.z += rotationDelta;
//					break;
//				case Keyboard.KEY_RIGHT:
//					modelAngle.z -= rotationDelta;
//					break;
					
			}
		}
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
		ttf.drawString(300+qbugbug, 200+qbugbug, "薰"+msg, 1f, 1f);  //bugbug why these numbers so small?    why no text shows??
		//ttf.drawString(0, ttf.getHeight()*10, "I wrote this song about you!\nIsn't that cliche of me, to do?", 1.5f,1.5f);
	}

	private void render3d() 
	{  		
		GL20.glUseProgram(pId);
		
		// Bind the texture
		GL13.glActiveTexture(GL13.GL_TEXTURE0);
		GL11.glBindTexture(GL11.GL_TEXTURE_2D, texIds[textureSelector]);
		
		// Bind to the VAO that has all the information about the vertices
		GL30.glBindVertexArray(vaoId);
		GL20.glEnableVertexAttribArray(0);
		GL20.glEnableVertexAttribArray(1);
		GL20.glEnableVertexAttribArray(2);
		
		// Bind to the index VBO that has all the information about the order of the vertices
		GL15.glBindBuffer(GL15.GL_ELEMENT_ARRAY_BUFFER, vboiId);
		
		// Draw the vertices
		GL11.glDrawElements(GL11.GL_TRIANGLES, indicesCount, GL11.GL_UNSIGNED_BYTE, 0);
				
		// Put everything back to default (deselect)
		GL15.glBindBuffer(GL15.GL_ELEMENT_ARRAY_BUFFER, 0);
		GL20.glDisableVertexAttribArray(0);
		GL20.glDisableVertexAttribArray(1);
		GL20.glDisableVertexAttribArray(2);
		GL30.glBindVertexArray(0);
		
		GL20.glUseProgram(0);
	
		this.exitOnGLError("renderCycle");
	}
	
	
	
	private void loopCycle() 
	{
		this.logicCycle();
		this.renderCycle();
		
		this.exitOnGLError("loopCycle");
	}
	
	private void destroyOpenGL() 
	{	
		GL11.glDeleteTextures(texIds[0]);
		GL11.glDeleteTextures(texIds[1]);
		
		// Delete the shaders
		GL20.glUseProgram(0);
		GL20.glDeleteProgram(pId);
		
		// Select the VAO
		GL30.glBindVertexArray(vaoId);
		
		// Disable the VBO index from the VAO attributes list
		GL20.glDisableVertexAttribArray(0);
		GL20.glDisableVertexAttribArray(1);
		
		// Delete the vertex VBO
		GL15.glBindBuffer(GL15.GL_ARRAY_BUFFER, 0);
		GL15.glDeleteBuffers(vboId);
		
		// Delete the index VBO
		GL15.glBindBuffer(GL15.GL_ELEMENT_ARRAY_BUFFER, 0);
		GL15.glDeleteBuffers(vboiId);
		
		// Delete the VAO
		GL30.glBindVertexArray(0);
		GL30.glDeleteVertexArrays(vaoId);
		
		this.exitOnGLError("destroyOpenGL");
		
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
		
		this.exitOnGLError("loadShader");
		
		return shaderID;
	}
	
	private int loadPNGTexture(String filename, int textureUnit) 
	{
		ByteBuffer buf = null;
		int tWidth = 0;
		int tHeight = 0;
		
		try 
		{
			// Open the PNG file as an InputStream
			InputStream in = new FileInputStream(filename);
			// Link the PNG decoder to this stream
			PNGDecoder decoder = new PNGDecoder(in);
			
			// Get the width and height of the texture
			tWidth = decoder.getWidth();
			tHeight = decoder.getHeight();			
			
			// Decode the PNG file in a ByteBuffer
			buf = ByteBuffer.allocateDirect( 4 * tWidth * tHeight );
			decoder.decode(buf, decoder.getWidth() * 4, Format.RGBA);
			buf.flip();
			
			in.close();
		}
		catch (IOException e) 
		{
			e.printStackTrace();
			System.exit(-1);
		}
		
		// Create a new texture object in memory and bind it
		int texId = GL11.glGenTextures();
		GL13.glActiveTexture(textureUnit);
		GL11.glBindTexture(GL11.GL_TEXTURE_2D, texId);
		
		// All RGB bytes are aligned to each other and each component is 1 byte
		GL11.glPixelStorei(GL11.GL_UNPACK_ALIGNMENT, 1);
		
		// Upload the texture data and generate mip maps (for scaling)
		GL11.glTexImage2D(GL11.GL_TEXTURE_2D, 0, GL11.GL_RGB, tWidth, tHeight, 0, GL11.GL_RGBA, GL11.GL_UNSIGNED_BYTE, buf);
		GL30.glGenerateMipmap(GL11.GL_TEXTURE_2D);
		
		// Setup the ST coordinate system
		GL11.glTexParameteri(GL11.GL_TEXTURE_2D, GL11.GL_TEXTURE_WRAP_S, GL11.GL_REPEAT);
		GL11.glTexParameteri(GL11.GL_TEXTURE_2D, GL11.GL_TEXTURE_WRAP_T, GL11.GL_REPEAT);
		
		// Setup what to do when the texture has to be scaled
		GL11.glTexParameteri(GL11.GL_TEXTURE_2D, GL11.GL_TEXTURE_MAG_FILTER, GL11.GL_LINEAR);
		GL11.glTexParameteri(GL11.GL_TEXTURE_2D, GL11.GL_TEXTURE_MIN_FILTER, GL11.GL_LINEAR_MIPMAP_LINEAR);
		
		this.exitOnGLError("loadPNGTexture");
		
		return texId;
	}
	
	private float cotanD(float angle)
	{
		return cotan(d2r(angle));  //already a float, no cast needed
	}
	private float cotan(float angle) 
	{
		return (float)(1f / Math.tan(angle));
	}
	
	private float d2r(float degrees) 
	{
		return degrees * (float)(PI / 180d);
	}
	
	private float sinD(float degrees)
	{
		return (float) Math.sin(d2r(degrees));		
	}
	private float cosD(float degrees)
	{
		return (float) Math.cos(d2r(degrees));		
	}
	
	private void exitOnGLError(String errorMessage) 
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