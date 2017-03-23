import RPi.GPIO as GPIO
import time
# blinking function
def blink(pin):
        GPIO.output(pin,GPIO.HIGH)
        time.sleep(0.01)
        GPIO.output(pin,GPIO.LOW)
        time.sleep(0.09)
        return


# bugbug kinda don't like this.  the breakout board has the old numbers!
# to use Raspberry Pi board pin numbers
GPIO.setmode(GPIO.BOARD)



# set up GPIO output channel
GPIO.setup(11, GPIO.OUT)



for i in range(0,100):
        blink(11)
GPIO.cleanup() 



