import java.util.HashMap;
import java.util.Map;

import org.lwjgl.input.Keyboard;


public class KeyManager
{
	private long[] _isPressed;
	private long _lastTimeStamp;
	
	public KeyManager()
	{
		_isPressed = new long[400];  //bugbug const should be maximum keycode (change to hashtable if tooo high)
	}

	public String bump(long timeStamp)
	{
		String msg = "";
		int keyCount = 0;
		_lastTimeStamp=timeStamp;
		
		while(Keyboard.next()) 
		{			
			keyCount++;
			int key = Keyboard.getEventKey();
			int upOrDown = Keyboard.getEventKeyState()?1:0;  
			msg = String.format("keyNum=%d pressed=%d count=%d", key, upOrDown, keyCount);	
			_isPressed[key]=timeStamp*upOrDown;
		}
		
		return msg;
	}
	
	
	public boolean isKeyDown(int key)
	{
		return _isPressed[key]>0;
	}
	
}
