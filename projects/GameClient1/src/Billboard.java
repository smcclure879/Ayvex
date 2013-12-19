import org.lwjgl.opengl.GL13;


public class Billboard extends Ritem
{

	public Billboard()
	{
		
	}

	public void setupTextures()
	{
		this.texIds=new int[2];
		texIds[0] = loadPNGTexture("assets/images/stGrid1.png", GL13.GL_TEXTURE0);
		texIds[1] = loadPNGTexture("assets/images/stGrid2.png", GL13.GL_TEXTURE0);		
		ErrorUtil.exitOnGLError("setupTexture");
	}

	public void setupVertices()
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
	}


	public void setupIndices()
	{		
		indices = new byte[] 
							{
								0, 1, 2,
								2, 3, 0
							};
	}

}
