import org.lwjgl.opengl.GL11;
import org.lwjgl.opengl.GL13;


public class PointCloud extends Ritem
{
	private int numPoints;
	private float movementRadius = 0.03f;
	private float nudgeSize = 0.005f;



	public void init()
	{
		this.drawType=GL11.GL_POINTS;		
	}

	public void setupTextures()  //bugbug what is the texture for points supposed to be???
	{
		this.texIds=new int[2];
		texIds[0] = loadPNGTexture("assets/images/stGrid1.png", GL13.GL_TEXTURE0);
		texIds[1] = loadPNGTexture("assets/images/stGrid2.png", GL13.GL_TEXTURE0);		
		ErrorUtil.exitOnGLError("setupTexture");		
	}

	public void setupVertices()
	{		
		numPoints = 100;
		vertices = new VertexData[numPoints]; 
		for(int ii=0; ii<numPoints; ii++)
		{
			vertices[ii] = VertexData.CreateRand(0.5f);  //radius
		}
	}
	
	
	long oldTimeStamp=0;
	@Override
	public void tick(long timeStamp)
	{
		if (timeStamp-oldTimeStamp>50)
		{			
			float r=this.movementRadius;
			
			for(int ii=0; ii<numPoints; ii++)
			{
				vertices[ii].addXYZ(Helpers.rndSym(r), Helpers.rndSym(r), Helpers.rndSym(r));  //mutates  
				vertices[ii].nudge(0f,0f,0f,nudgeSize);
			}
			refresh();
			oldTimeStamp=timeStamp;
		}
		
		
	}



//	public void setupIndices()
//	{
//		indices = new byte[0];	
//	}
//	
	public void setupIndices()  //what is thsi supposed to be for points?
	{		
		indices = new byte[numPoints];
		for(byte ii=0; ii<numPoints; ii++)
		{
			indices[ii]=ii;			
		}
//							{};
////								0, 1, 2,
////								2, 3, 0
////							};bugbug
	}





}
