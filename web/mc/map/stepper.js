// Copyright 2014 Ayvex Light Industries

var StepperModule = (function()  //module Stepper
{
	//each step needs to be set off by the step before it, but on different thread to account for dynamic code

	function Stepper(maxSteps)    //class Stepper
	{
		this.arrSteps=[];
		this.stepsTaken=0;
		this.waitsTaken=0;
		this.stepsLimit=maxSteps || 20;
		this.waitsLimit=this.stepsLimit/2;
		this.ii=0;  //the step number!!
	}
	
	Stepper.Create = function(steps)
	{
		var retval=new Stepper();
		retval.arrSteps=steps;
		return retval;
	}

	//public
	Stepper.prototype.run = function()
	{	
		this.doSteps();
	}	
	
	Stepper.prototype.advance = function()
	{
		this.ii++;
		this.doSteps();	
	}
	
	Stepper.prototype.isBad=function()
	{
		if (this.ii>=this.arrSteps.length) 
		{
			//bugbug needed???  alert("walked off end of array errCode658im");
			return true;
		}			
		
		if (this.ii>this.stepsLimit)
		{
			alert("doSteps limit passed errCode333kz");
			return true;
		}
		
		if (this.waitsTaken>this.waitsLimit)
		{
			alert("wait limits exceeded errCode519zp");
			return true;
		}
		
		var thisStep = this.arrSteps[this.ii];
		if (thisStep==null) 
		{
			alert("thisStep is null errCode521fr");
			return true;
		}	
		
		if (this.waitsTaken>this.waitLimit)
		{
			alert("exceeded waitsTaken errCode659pk");
			return true;
		}
		
		return false;	
	}

	
	Stepper.prototype.doSteps =	function()
	{
		if (this.isBad()) return;		
		var thisStep = this.arrSteps[this.ii];
		var thisStepType = typeof thisStep;
		
		if (thisStepType=='function')
		{
			this.doStep( function(){ thisStep(); this.advance(); }  );
		}
		else if (thisStepType=='object')
		{
			var command = thisStep[0];
			switch(command)
			{
				case "waiton": 	
					this.waitsTaken++;  
					this.doStep(function()	{ 
									if (thisStep[1]()) //keep doing this until the condition is true  //who is still using this , is this good logic still?  bugbug
										this.ii++;      //then we do the advance
									else
										alert('bugbug:1149rd WAIT');  //bugbug
									//else it's
									this.doSteps();  //without advancing!
								 
								}); 
					break;
				default: 
					alert('errCode323wj,cmd='+command);
					break;
			}
		}
		else
		{
			alert('errCode1119rw:stepType='+thisStepType);
		}

	}


	Stepper.prototype.doStep = function(fnStep)  
	{
		setTimeout(fnStep.bind(this),100);  //bugbug const?
	}

	
	return { //public classes...
		Stepper:Stepper
	};
}
)();

