

import java.awt.Color;
import java.awt.Font;
import java.awt.FontMetrics;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.awt.image.DataBuffer;
import java.awt.image.DataBufferByte;
import java.awt.image.DataBufferInt;
import java.io.File;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.nio.IntBuffer;
import java.util.HashMap;
import java.util.Map;
import java.awt.GraphicsEnvironment;

import javax.imageio.ImageIO;

import org.lwjgl.BufferUtils;
import org.lwjgl.opengl.GL11;
import org.lwjgl.util.glu.GLU;



/**
 * A TrueType font implementation originally for Slick, edited for Bobjob's Engine
 *    http://lwjgl.org/forum/index.php/topic,2951.0.html
 * @original author James Chambers (Jimmy)
 * @original author Jeremy Adams (elias4444)
 * @original author Kevin Glass (kevglass)
 * @original author Peter Korzuszek (genail)
 * 
 * @new version edited by David Aaron Muhar (bobjob)
 * 
 * @new version edited by Steven McClure (smcclure879/Ayvex)
 * 
 */


public class TrueTypeFont 
{
	public final static int  //enum-ish
		ALIGN_LEFT = 0,
		ALIGN_RIGHT = 1,
		ALIGN_CENTER = 2;	
	
	private IntObject[] charArray = new IntObject[256];    //holds necessary information about the font characters
	
	
	private Map<Character, IntObject> customChars = new HashMap<Character, IntObject>();  /** Map of user defined font characters (Character <-> IntObject) */

	private boolean antiAlias;

	private int fontSize = 0;
	private int fontHeight = 0;
	private int textureWidth = 512;  //default values
	private int textureHeight = 512;

	private Font font;                // A reference to Java's AWT Font that we create our font texture from 
	private FontMetrics fontMetrics;  //The font metrics for our Java AWT font
	private int fontTextureID;
	private Color totallyTransparent=new Color(0,0,255,0);  //some extra blue in there for detectability of non-transparent leakage  
	private Color fontColor=Color.WHITE;
	
	private int correctL = 9, correctR = 8;
	
	private int charXspace=5;  //spacing on the left margin in the characters texture
	
	//attributes of one char in the texture image
	private class IntObject 
	{
		public int width;
		public int height;
		public int storedX;
		public int storedY;
	}

	public TrueTypeFont(Font font, boolean antiAlias) 
	{
		this( font, antiAlias, (char[])null );
	}
	public TrueTypeFont(Font font, boolean antiAlias, String additionalChars)
	{
		this(
				font, 
				antiAlias, 
				(  (additionalChars==null) ? "" : additionalChars  ).toCharArray()
				
			);	
	}
	public TrueTypeFont(Font font, boolean antiAlias, char[] additionalChars) 
	{
		this.font = font;
		this.fontSize = font.getSize()+3;
		this.antiAlias = antiAlias;

		createSet( additionalChars );
		
		fontHeight -= 1;
		if (fontHeight < 1) fontHeight = 1;
	}

//	from original lib, don't know if it's still needed
//	public void setCorrection(boolean on) 
//	{
//		if (on) {
//			correctL = 2;
//			correctR = 1;
//		} else {
//			correctL = 0;
//			correctR = 0;
//		}
//	}
	
	private BufferedImage getFontImage(char ch) 
	{
		// Create a temporary image to extract the character's size
		BufferedImage tempfontImage = new BufferedImage(1, 1, BufferedImage.TYPE_INT_ARGB);
		Graphics2D g = (Graphics2D) tempfontImage.getGraphics();
		if (antiAlias == true) 
		{
			g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
		}
		g.setFont(font);
		
		fontMetrics = g.getFontMetrics();
		int charwidth = fontMetrics.charWidth(ch)+8;
		if (charwidth <= 0)  charwidth = 7;
		int charheight = fontMetrics.getHeight()+3;
		if (charheight <= 0)  charheight = fontSize;
		

		// Create another image holding the character we are creating
		BufferedImage fontImage;
		fontImage = new BufferedImage(charwidth, charheight, BufferedImage.TYPE_INT_ARGB);
		Graphics2D gt = (Graphics2D) fontImage.getGraphics();
		if (antiAlias == true) gt.setRenderingHint(RenderingHints.KEY_ANTIALIASING,	RenderingHints.VALUE_ANTIALIAS_ON);
		gt.setFont(font);
		int charx = charXspace;
		int chary = 1;  //bugbug const like above...(needed in the use of the texture also???)
		gt.setBackground(totallyTransparent);
		gt.setColor(fontColor);
		gt.drawString(String.valueOf(ch), charx, chary+fontMetrics.getAscent());

		return fontImage;
	}

	private void createSet( char[] customCharsArray ) 
	{
		// If there are custom chars then I expand the font texture twice	
		// In any case this should be done in other way. Texture with size 512x512
		// can maintain only 256 characters with resolution of 32x32. The texture
		// size should be calculated dynamically by looking at character sizes. 
		if	(customCharsArray != null && customCharsArray.length > 0) 	textureWidth *= 2;

		try 
		{
			BufferedImage imgTemp = new BufferedImage(textureWidth, textureHeight, BufferedImage.TYPE_INT_ARGB);
			Graphics2D g2d = (Graphics2D) imgTemp.getGraphics();
			g2d.setBackground(totallyTransparent);  
			
			//bugbug  probably not needed going forward...
			//g2d.setComposite(AlphaComposite.getInstance(AlphaComposite.CLEAR, 0.0f));
			//g2d.setColor(totallyTransparent);
			//g2d.clearRect(0, 0, textureWidth, textureHeight);
			//g2d.fillRect(0,0,textureWidth,textureHeight);
			//g2d.setComposite(AlphaComposite.getInstance(AlphaComposite.SRC_OVER,1.0f));
			
			
			int rowHeight = 0;
			int positionX = 0;
			int positionY = 0;
			
			int customCharsLength = ( customCharsArray != null ) ? customCharsArray.length : 0; 

			for (int i = 0; i < 256 + customCharsLength; i++) 
			{				
				// get 0-255 characters and then custom characters
				char ch = ( i < 256 ) ? (char) i : customCharsArray[i-256];
				
				BufferedImage fontImage = getFontImage(ch);

				IntObject newIntObject = new IntObject();

				newIntObject.width = fontImage.getWidth();
				newIntObject.height = fontImage.getHeight();

				if (positionX + newIntObject.width >= textureWidth) 
				{
					positionX = 0;
					positionY += rowHeight;
					rowHeight = 0;
				}

				newIntObject.storedX = positionX;
				newIntObject.storedY = positionY;

				if (newIntObject.height > fontHeight) 	fontHeight = newIntObject.height;
				if (newIntObject.height > rowHeight ) 	rowHeight  = newIntObject.height;

				// Draw it here
				g2d.drawImage(fontImage, positionX, positionY, null);

				positionX += newIntObject.width;

				if( i < 256 )  // standard characters
				{ 
					charArray[i] = newIntObject;  
				} 
				else  // custom characters
				{ 
					customChars.put( new Character( ch ), newIntObject );  
				}

				//fontImage = null;  //bugbug not needed methinks
			}

			fontTextureID = loadImage(imgTemp);
				// .getTexture(font.toString(), imgTemp);

			//DebugPersistImage(imgTemp,"C:\\foo\\foo.png");
			
			
		} catch (Exception e) {
			System.err.println("Failed to create font.");
			e.printStackTrace();
		}
	}
	
	private void DebugPersistImage(BufferedImage imgTemp, String fileToSave)
	{
		try 
		{
		    File outputfile = new File(fileToSave);
		    ImageIO.write(imgTemp, "png", outputfile);
		}
		catch (IOException e) 
		{
			System.err.println(e.toString());
		}
		
	}

		
	private void drawQuad(
							float drawX, float drawY,
							float drawX2, float drawY2,
							float srcX, float srcY, 
							float srcX2, float srcY2
						) 
	{
		float TextureSrcX = (srcX+charXspace)/textureWidth;
		float TextureSrcY = srcY/textureHeight;
		float TextureSrcX2 = (srcX2+charXspace)/textureWidth;
		float TextureSrcY2 = srcY2/textureHeight;
		
		//wound widdershins  and that seems OK  (bugbug revisit)
		GL11.glTexCoord2f(TextureSrcX, TextureSrcY);
		GL11.glVertex2f(drawX, drawY2);
		GL11.glTexCoord2f(TextureSrcX, TextureSrcY2);
		GL11.glVertex2f(drawX, drawY);
		GL11.glTexCoord2f(TextureSrcX2, TextureSrcY2);
		GL11.glVertex2f(drawX2, drawY);
		GL11.glTexCoord2f(TextureSrcX2, TextureSrcY);
		GL11.glVertex2f(drawX2, drawY2);
	}
	
	

	public int getWidth(String whatchars) 
	{
		int totalwidth = 0;
		IntObject intObject = null;
		int currentChar = 0;
		for (int i = 0; i < whatchars.length(); i++) 
		{
			currentChar = whatchars.charAt(i);
			
			if (currentChar < 256)  	intObject = charArray[currentChar];
			else						intObject = (IntObject)customChars.get( new Character( (char) currentChar ) );			
			
			if( intObject != null )  	totalwidth += intObject.width;
		}
		return totalwidth;
	}

	public int getHeight()                    { return fontHeight; }
	public int getHeight(String HeightString) {	return fontHeight; }  //bugbug NYI  and why 3 anyway??
	public int getLineHeight()                { return fontHeight; }

	public void drawString(float x, float y, String whatchars, float scaleX, float scaleY) 
	{
		drawString(x,y,whatchars, 0, whatchars.length()-1, scaleX, scaleY, ALIGN_LEFT);
	}
	
	public void drawString(float x, float y, String whatchars, float scaleX, float scaleY, int format) 
	{
		drawString(x,y,whatchars, 0, whatchars.length()-1, scaleX, scaleY, format);
	}


	public void drawString(float x, float y,
							String whatchars, int startIndex, int endIndex,
							float scaleX, float scaleY,
							int format
							) 
	{
		
		IntObject intObject = null;
		int charCurrent;
		

		int totalwidth = 0;
		int i = startIndex, d, c;
		float startY = 0;
		
		switch (format) 
		{
			case ALIGN_RIGHT: 
			{
				d = -1;
				c = correctR;
			
				while (i < endIndex) 
				{
					if (whatchars.charAt(i) == '\n')   startY -= fontHeight;
					i++;
				}
				break;
			}
			case ALIGN_CENTER: 
			{
				for (int l = startIndex; l <= endIndex; l++) 
				{
					charCurrent = whatchars.charAt(l);
					if (charCurrent == '\n') break;
					
					if (charCurrent < 256) 				intObject = charArray[charCurrent];
					else 								intObject = (IntObject)customChars.get( new Character( (char) charCurrent ) );

					totalwidth += intObject.width-correctL;
				}
				totalwidth /= -2;
			}
			case ALIGN_LEFT:
			default: 
			{
				d = 1;
				c = correctL;
				break;
			}
		
		}

		GL11.glEnable(GL11.GL_TEXTURE_2D);  //THIS was the missing thing!
		GL11.glBindTexture(GL11.GL_TEXTURE_2D, fontTextureID);
		GL11.glBegin(GL11.GL_QUADS);
		
		while (i >= startIndex && i <= endIndex) 
		{			
			charCurrent = whatchars.charAt(i);
			if (charCurrent < 256) 
			{
				intObject = charArray[charCurrent];
			}
			else
			{
				intObject = (IntObject)customChars.get( new Character( (char) charCurrent ) );
			} 
			
			if( intObject != null ) 
			{
				if (d < 0)   totalwidth += (intObject.width-c) * d;
				
				if (charCurrent == '\n') 
				{
					startY -= fontHeight * d;
					totalwidth = 0;
					if (format == ALIGN_CENTER) 
					{
						for (int l = i+1; l <= endIndex; l++) 
						{
							charCurrent = whatchars.charAt(l);
							if (charCurrent == '\n') break;

							if (charCurrent < 256) 		intObject = charArray[charCurrent];
							else 						intObject = (IntObject)customChars.get( new Character( (char) charCurrent ) );

							totalwidth += intObject.width-correctL;
						}
						totalwidth /= -2;
					}
					//if center get next lines total width/2;
				}
				else 
				{
					drawQuad(   totalwidth  * scaleX + x,      						startY * scaleY + y,
								(totalwidth+ intObject.width) * scaleX + x,         (startY + intObject.height) * scaleY + y,
								intObject.storedX,              					intObject.storedY,
								intObject.storedX+ intObject.width,               	intObject.storedY+ intObject.height
							);
					
					if (d > 0) totalwidth += (intObject.width-c) * d ;
				}
				i += d;
			
			}
		}
		GL11.glEnd();  
	}
	
	
	public static int loadImage(BufferedImage bufferedImage) 
	{
	    try 
	    {
		    short width       = (short)bufferedImage.getWidth();
		    short height      = (short)bufferedImage.getHeight();
		    //textureLoader.bpp = bufferedImage.getColorModel().hasAlpha() ? (byte)32 : (byte)24;
		    int bpp = (byte)bufferedImage.getColorModel().getPixelSize();
		    ByteBuffer byteBuffer;
		    DataBuffer db = bufferedImage.getData().getDataBuffer();
		    if (db instanceof DataBufferInt) 
		    {
		    	int intI[] = ((DataBufferInt)(db)).getData();
		    	byte newI[] = new byte[intI.length * 4];
		    	for (int i = 0; i < intI.length; i++) 
		    	{
		    		byte b[] = intToByteArray(intI[i]);
		    		int newIndex = i*4;
		    		
		    		newI[newIndex]   = b[1];
		    		newI[newIndex+1] = b[2];
		    		newI[newIndex+2] = b[3];
		    		newI[newIndex+3] = b[0];
		    	}
		    	
		    	byteBuffer  = ByteBuffer.allocateDirect(width*height*(bpp/8))
			                           .order(ByteOrder.nativeOrder())
			                           .put(newI);
		    }
		    else 
		    {
		    	byteBuffer  = ByteBuffer.allocateDirect(width*height*(bpp/8))
			                           .order(ByteOrder.nativeOrder())
			                           .put(((DataBufferByte)(bufferedImage.getData().getDataBuffer())).getData());
		    }
		    byteBuffer.flip();
		    
		    
		    int internalFormat = GL11.GL_RGBA8,
			format = GL11.GL_RGBA;
			IntBuffer   textureId =  BufferUtils.createIntBuffer(1);;
			GL11.glGenTextures(textureId);
			GL11.glBindTexture(GL11.GL_TEXTURE_2D, textureId.get(0));
			

			GL11.glTexParameteri(GL11.GL_TEXTURE_2D, GL11.GL_TEXTURE_WRAP_S, GL11.GL_CLAMP);
			GL11.glTexParameteri(GL11.GL_TEXTURE_2D, GL11.GL_TEXTURE_WRAP_T, GL11.GL_CLAMP);
			
			GL11.glTexParameteri(GL11.GL_TEXTURE_2D, GL11.GL_TEXTURE_MAG_FILTER, GL11.GL_LINEAR);
			GL11.glTexParameteri(GL11.GL_TEXTURE_2D, GL11.GL_TEXTURE_MIN_FILTER, GL11.GL_LINEAR);
			
			GL11.glTexEnvf(GL11.GL_TEXTURE_ENV, GL11.GL_TEXTURE_ENV_MODE, GL11.GL_MODULATE);
			
			
			
			GLU.gluBuild2DMipmaps(GL11.GL_TEXTURE_2D,
			      internalFormat,
			      width,
			      height,
			      format,
			      GL11.GL_UNSIGNED_BYTE,
			      byteBuffer);
			return textureId.get(0);
		    
		} catch (Exception e) {
	    	e.printStackTrace();
	    	System.exit(-1);
	    }
		
		return -1;
	}
	
	
	public static boolean isSupported(String fontname) {
		Font font[] = getFonts();
		for (int i = font.length-1; i >= 0; i--) {
			if (font[i].getName().equalsIgnoreCase(fontname))
				return true;
		}
		return false;
	}
	
	
	public static Font[] getFonts() 
	{
		return GraphicsEnvironment.getLocalGraphicsEnvironment().getAllFonts();
	}
	
	
	public static byte[] intToByteArray(int value) 
	{
        return new byte[] 
        		{
	                (byte)(value >>> 24),
	                (byte)(value >>> 16),
	                (byte)(value >>> 8),
	                (byte) value
                };
	}
	
	public void destroy() 
	{
		IntBuffer scratch = BufferUtils.createIntBuffer(1);
		scratch.put(0, fontTextureID);
		GL11.glBindTexture(GL11.GL_TEXTURE_2D, 0);
		GL11.glDeleteTextures(scratch);
	}
}