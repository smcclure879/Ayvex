import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.ByteBuffer;
import java.nio.FloatBuffer;

import org.lwjgl.BufferUtils;
import org.lwjgl.opengl.GL11;
import org.lwjgl.opengl.GL13;
import org.lwjgl.opengl.GL15;
import org.lwjgl.opengl.GL20;
import org.lwjgl.opengl.GL30;

import de.matthiasmann.twl.utils.PNGDecoder;
import de.matthiasmann.twl.utils.PNGDecoder.Format;


public abstract class Ritem
{
	//public abstract void setup();  //probably want some other one that takes args and  stuff in your implementation class for this abstract base method
	
	//these are the things that we force the child to define...we just don't know...
	public abstract void setupTextures();
	public abstract void setupVertices();	
	public abstract void setupIndices();

	
	
	protected VertexData[] vertices = null;  //used in all subclasses (to my knowledge)
	protected ByteBuffer verticesByteBuffer = null;
	protected int vaoId = 0;
	protected int vboId = 0;
	protected int vboiId = 0;
	protected byte[] indices=null;
	protected int indicesCount = 0;
	protected int[] texIds = null;
	public int drawType=GL11.GL_TRIANGLES;
	protected FloatBuffer verticesFloatBuffer;	
	private ByteBuffer indicesBuffer;
	
	
	public void setup()
	{
		//level 1
		setupTextures();
		setupVertices();		
		setupIndices();
		
		//level 2
		refresh();	
		
	}
	
	public void refresh()
	{					
		//level2
		setupVertexBuffers();
		setupIndexBuffer();		

		//level pi
		packIntoGpu();  //into vao's vbo's etc	

	}
	
	public void init()
	{
		//nothing in base class for now
	}
	
	
	public void tick(long timestamp)
	{
		//do nothing here in base class...immutable object
	}
	
	public void destroy()
	{
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
		
		for(int x : texIds)
		{
			GL11.glDeleteTextures(texIds[x]);				
		}
		
	}
	

	
	
	
	public void render()
	{
		if (vertices==null) return;  //uninitialized
		
		// Bind the texture
		GL13.glActiveTexture(GL13.GL_TEXTURE0);
		GL11.glBindTexture(GL11.GL_TEXTURE_2D, texIds[0]);  //this is double indirection.  my index 0 maps to texture X, which is a pointer to where the actual texture's been stuffed
		
		// Bind to the VAO that has all the information about the vertices
		GL30.glBindVertexArray(vaoId);
		GL20.glEnableVertexAttribArray(0);
		GL20.glEnableVertexAttribArray(1);
		GL20.glEnableVertexAttribArray(2);
		// Bind to the index VBO that has all the information about the order of the vertices
		GL15.glBindBuffer(GL15.GL_ELEMENT_ARRAY_BUFFER, vboiId);
		//System.err.println("vboId:"+vboId); //bugbug
		
		// Draw the vertices
		GL11.glDrawElements(drawType, indicesCount, GL11.GL_UNSIGNED_BYTE, 0);
				
		// Put everything back to default (deselect)
		GL15.glBindBuffer(GL15.GL_ELEMENT_ARRAY_BUFFER, 0);
		GL20.glDisableVertexAttribArray(0);
		GL20.glDisableVertexAttribArray(1);
		GL20.glDisableVertexAttribArray(2);
		GL30.glBindVertexArray(0);
	}
	
	
	protected void destroyAllTextures()
	{
		for(int x : texIds)
		{
			GL11.glDeleteTextures(texIds[x]);				
		}
	}
	

	
	public void setupVertexBuffers()
	{
		// Put each 'Vertex' in one FloatBuffer
		verticesByteBuffer = BufferUtils.createByteBuffer(vertices.length * VertexData.stride);				
		verticesFloatBuffer = verticesByteBuffer.asFloatBuffer();
		for (int i = 0; i < vertices.length; i++) 
		{
			// Add position, color and texture floats to the buffer
			verticesFloatBuffer.put(vertices[i].getElements());
		}
		verticesFloatBuffer.flip();  //is now in the setup state
	}


	public void packIntoGpu()  
	{
		// Create a new Vertex Array Object in memory and select it (bind)
		if (vaoId==0) vaoId = GL30.glGenVertexArrays();
		GL30.glBindVertexArray(vaoId);
		
		// Create a new Vertex Buffer Object in memory and select it (bind)
		if (vboId==0) vboId = GL15.glGenBuffers();
		GL15.glBindBuffer(GL15.GL_ARRAY_BUFFER, vboId);
		GL15.glBufferData(GL15.GL_ARRAY_BUFFER, verticesFloatBuffer, GL15.GL_STREAM_DRAW);
		
		// Put the position coordinates in attribute list 0
		GL20.glVertexAttribPointer(0, VertexData.positionElementCount, GL11.GL_FLOAT, false, VertexData.stride, VertexData.positionByteOffset);
		// Put the color components in attribute list 1
		GL20.glVertexAttribPointer(1, VertexData.colorElementCount, GL11.GL_FLOAT, false, VertexData.stride, VertexData.colorByteOffset);
		// Put the texture coordinates in attribute list 2
		GL20.glVertexAttribPointer(2, VertexData.textureElementCount, GL11.GL_FLOAT, false, VertexData.stride, VertexData.textureByteOffset);
		
		
		//all the backing out....
		GL15.glBindBuffer(GL15.GL_ARRAY_BUFFER, 0);
		
		// Deselect (bind to 0) the VAO
		GL30.glBindVertexArray(0);
		
		// Create a new VBO for the indices and select it (bind) - INDICES
		vboiId = GL15.glGenBuffers();
		GL15.glBindBuffer(GL15.GL_ELEMENT_ARRAY_BUFFER, vboiId);
		GL15.glBufferData(GL15.GL_ELEMENT_ARRAY_BUFFER, indicesBuffer, GL15.GL_STATIC_DRAW);
		GL15.glBindBuffer(GL15.GL_ELEMENT_ARRAY_BUFFER, 0);
	}


	protected void setupIndexBuffer()
	{
		indicesCount = indices.length;
		indicesBuffer = BufferUtils.createByteBuffer(indicesCount);
		indicesBuffer.put(indices);
		indicesBuffer.flip();
	}
	

}
