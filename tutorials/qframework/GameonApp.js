/*
   Copyright 2012, Telum Slavonski Brod, Croatia.

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
   
   This file is part of QFramework project, and can be used only as part of project.
   Should be used for peace, not war :)   
*/


function GameonApp(context, appname)
{
	this.mWorld  = new GameonWorld(this);
	this.mView = new GameonWorldView(this.mWorld, this);
	this.mDataGrid = new LayoutGrid(this.mWorld, this);
	this.mScript = new ServerkoParse(this);

    this.mPreExec = undefined;
	
	this.mUsername="Dembinjo"; 
    this.mContext = context;

    this.mAppName = appname;
    this.mResponsesQueue =  [];
    this.mScreenb = new Array(8);
    this.mHudb = new Array(8);        
	this.mSplashScreen= "";
    this.mSplashTime = 0;
    this.mSplashTimeStart = 0;
	this.mDrawSPlash = false;
	this.mSplashOutStart = false;
    this.mFocused = undefined;
	
	this.mAnims = new AnimFactory(this);
    this.mItems  = new ItemFactory(this);
    this.mTextures  = new TextureFactory(this);
	this.mColors  = new ColorFactory();
    this.mSounds  = new SoundFactory();
    this.mSettings  = new Q_Settings(this);
    this.mObjectsFact  = new ObjectsFactory(this);
	this.mBox2dWrapper  = new Box2dWrapper(this);
	
    this.mFrameDeltaTime = -1;
    this.mFrameLastTime = -1;

	this.mLock = false;	
	this.mSettings.init( this.mScript, context, appname);
	this.gl = undefined;
	this.mCameraSet = false;
	this.mDataChange = false;
	this.mRendering = false;

    this.mLastDrag = [1e07 ,0 , 0];
    this.mLastDragTime = 0;
    this.mLastClickTime = 0;	
	this.mLastDist = 0
	
	this.mTouchEnabled = true;
    this.mOnTouchCallback = undefined;
    this.mOnTouchEndCallback = undefined;
    this.mOnTouchStartCallback = undefined;
	
}

GameonApp.prototype.processData = function(gl , time)
{
	this.mBox2dWrapper.doFrame(this.mFrameDeltaTime);
    this.mAnims.process(time);
	this.execResponses(gl);
    this.mWorld.addModels(gl);    
	this.mTextures.flushTextures(gl);
}


GameonApp.prototype.hasData = function()
{
	return true;
	//System.out.println("to skip " + mResponsesQueue.size() + " " + mAnims.getCount());
	if (this.mDrawSPlash || this.mBox2dWrapper.isActive())
	{
		return true;
	}
	if (this.mDataChange == true)
	{
		this.mDataChange = false;
		return true;
	}
	if (this.mRendering)
	{
		return false;
	}
	
	if (this.mResponsesQueue.length == 0 && this.mAnims.getCount() == 0)
	{
		//System.out.println("skipping");
		this.mFrameLastTime  = -1;
		return false;
	}
	return true;
}
	
GameonApp.prototype.drawFrame = function (gl , time)
{
	//print(" frame "+ this.mFrameDeltaTime );	
	if (this.mRendering)
		return;
	this.mRendering = true;
	this.calcFrameDelay();
	
	this.gl = gl;
	
	this.processData(gl,this.mFrameDeltaTime);
	//this.mView.onSurfaceChanged(gl , this.mScreenW, this.mScreenH);
	if (this.mDrawSPlash)
	{
		this.mSplashTimeStart += this.mFrameDeltaTime;
		if (this.mSplashTimeStart > this.mSplashTime-500)
		{
			if (this.mSplashOutStart == false)
			{
				this.mDataGrid.animScreen("color" , "500,FFFFFFFF,00000000");
				this.mSplashOutStart = true;
			}
		}			
		if (this.mSplashTimeStart > this.mSplashTime)
		{
			this.mDrawSPlash = false;
			this.mView.lockDraw(false);
			this.mDataGrid.animScreen("color" , "500,00000000,FFFFFFFF");
		}
		else
		{
			this.mView.lockDraw(true);
			this.mView.drawSplash(gl);
		}
	}	else
	{
		this.mView.onDrawFrame(gl);
	}
	
	if (!this.mCameraSet)
	{
		this.mDataGrid.onCameraFit("fit", "4.0,0" , "world" );
		this.mDataGrid.onCameraFit("fit", "4.0,0" , "hud");
		this.mCameraSet = true;
	}	
	this.mRendering = false;
}
	 
GameonApp.prototype.surfaceChanged = function (gl,width, height)
{
	//this.mCS.init(width, height,1);
	this.mView.onSurfaceChanged(gl , width, height);
	this.mView.onSurfaceCreated(gl , width, height);
}

GameonApp.prototype.context = function()
{
	return this.mContext;
}

GameonApp.prototype.view = function()
{
	return this.mView;
}
	
GameonApp.prototype.onJSONData = function(gl,jsonData) 
{
	var gs;
		gs = jsonData["gs"];
		var room = gs["room"];
		for (var a=0; a< room.length; a++)
		{
			var roomobj = room[a];
			if (roomobj == undefined)
			{
				continue;
			}
			var type = roomobj["res"];
			if (type == "event")
			{
				// on event
				this.onEvent2(gl,roomobj);
			}else if (type == "layout"){
				// onlayout
				this.mDataGrid.initLayout2(roomobj);
			}else if (type == "texts"){
				// onlayout
				this.mTextures.initTextures(roomobj);
			}else if (type == "objs"){
				// onlayout
				this.mObjectsFact.initObjects(roomobj);
			}else if (type == "models"){
				// onlayout
				this.mItems.initModels(roomobj);
			}else if (type == "animation"){
				// onlayout
				this.mAnims.initAnimation(roomobj);
			}else if (type == "box2dobjs")
			{
				// onlayout
				this.mBox2dWrapper.initObjects(roomobj);
			}
		}
	  
}        

				  

GameonApp.prototype.execResponses = function(gl)
{
	if (GameonApp.lock == true)
	{	
		//console.log(" locked ");
		return;
	}

	if (this.mCameraSet == false)
	{
		this.mDataGrid.onCameraSet("0,0,0","0,0,5");
		this.mDataGrid.onCameraSetHud("0,0,0","0,0,5");
		this.mCameraSet = true;
	}
		
	while( this.mResponsesQueue.length > 0)
	{
		var jsonData = this.mResponsesQueue[0];
		this.mDataChanged = true;
		//console.log(" resp " + this.mResponsesQueue.length);
/*		try
		{*/

			this.onJSONData(gl,jsonData);
/*		} catch ( e)
		{
			console.error( e.toString() );
			//console.log(" resp " + this.mResponsesQueue.length);
			return;
		}*/
		this.mResponsesQueue.splice(0,1);
		if (GameonApp.lock == true)
		{
			//console.log(" locked2222 ");
			return;
		}
	}
	

}

GameonApp.prototype.queueResponse = function(response)
{
	this.mResponsesQueue.push(response);
}

GameonApp.prototype.start = function(script , preexec) 
{
	this.mPreExec = preexec;
	this.mSettings.setParser(this.mScript);
	if (this.mPreExec != undefined)
	{
		this.mScript.execScript(this.mPreExec);
	}
	// exec scripts
	this.mScript.loadScript(script,100);
}

GameonApp.prototype.onClick = function(x, y) 
{
	var delay = new Date().getTime() - this.mLastClickTime;

	var field = this.mDataGrid.onClickNearest(x, y);
	
	if (field != undefined && field.mOnclick != undefined) {
		// send data
		var datastr = field.mOnclick;
		if (datastr.indexOf("js:") == 0)
		{
			//Log.d("model" , " exec data " + datastr.substring(3));
			if (datastr.indexOf(";") == datastr.length-1)
			{
				this.mScript.execScript(datastr.substring(3));
			}else
			{
				var cmd  = datastr.substring(3);
				cmd += "('" + field.mArea + "',"+ field.mIndex;
				cmd += "," + delay + ",[" + field.mLoc[0] + "," + field.mLoc[1] + "," + field.mLoc[2] + "]"; 
				cmd += ","+ this.mLastDist;
				cmd += ");" ;
				this.mScript.execScript(cmd);
			}
		}else
		{
			datastr += "," + field.mArea + "," + field.mIndex;
			//Log.d("model" , " send data " + datastr);
			this.mScript.sendUserData( datastr);
		} 
	}
	if (this.mFocused != undefined)
	{
		this.onFocusLost(this.mFocused);
		this.mFocused = undefined;
	}   
	
	this.mLastDist = 0;
}

GameonApp.prototype.endScript = function() 
{
	


}
GameonApp.prototype.startScripts = function()
{
}
	
GameonApp.prototype.init = function()
{
	this.mScript.loadFramework();
	this.mScript.set();
}

GameonApp.prototype.setScreenBounds = function()
{
	var hud = this.mWorld.getDomainByName("hud");
	var world = this.mWorld.getDomainByName("world");
	hud.mCS.getScreenBounds(this.mHudb);
	world.mCS.getScreenBounds(this.mScreenb);
	
	var script = "Q.layout.canvasw =";
	script += world.mCS.getCanvasW(); 
	script += ";Q.layout.canvash = ";
	script += world.mCS.getCanvasH();
	
	script += ";Q.layout.worldxmin = ";
	script += this.mScreenb[0];
	script += ";Q.layout.worldxmax = ";
	script += this.mScreenb[2];
	
	script += ";Q.layout.worldymin = ";
	script += this.mScreenb[5];
	script += ";Q.layout.worldymax = ";
	script += this.mScreenb[3];
	
	script += ";Q.layout.hudxmin = ";
	script += this.mHudb[0];
	script += ";Q.layout.hudxmax = ";
	script += this.mHudb[2];
	
	script += ";Q.layout.hudymin = ";
	script += this.mHudb[5];
	script += ";Q.layout.hudymax = ";
	script += this.mHudb[3];
	
	script += ";";	    
	this.mScript.execScript(script);    
}

	
GameonApp.prototype.onTextInput = function(resptype, respdata) 
{
	var res = prompt("", resptype);
	if (res != undefined)
	{
		var truncated = res.replace("[^A-Za-z0-9 ]", ""); 
		var script = respdata + "('" + truncated + "' , 1);";
		this.mScript.execScript(script);
	}else
	{
		var script = respdata + "(undefined, 1);";
		this.mScript.execScript(script);		
	}		
}

GameonApp.prototype.sendEvent = function(resptype , respdata)
{
	var delay = parseInt(resptype);
	this.mScript.execScript(respdata , delay);    	
}
	
GameonApp.prototype.sendExec = function(resptype , respdata)
{
	var delay = parseInt(resptype);
	this.mScript.execScript(respdata , delay);    	
}

GameonApp.prototype.onPause = function() {


}
GameonApp.prototype.loadModule = function(resptype , respdata)
{
	this.mScript.loadModule(resptype);            
}

GameonApp.prototype.loadModule2 = function(resptype , respdata)
{
	this.mScript.loadModule2(resptype);    
}


GameonApp.prototype.execScript = function(script)
{
	this.mScript.execScript(script , 10);
}

GameonApp.prototype.goUrl = function(type , data)
{
	//mEaglView.goUrl(type, data);
}

GameonApp.prototype.touchStart = function(x, y) 
{
	if (!this.mTouchEnabled)
		return;    	
	this.fireTouchEvent(1,x, y, 0);//rayVec , rayVecHud);
}

GameonApp.prototype.touchEnd = function(x, y, pressdelay) {
	if (!this.mTouchEnabled)
		return;    	
	this.fireTouchEvent(2,x, y, pressdelay);//rayVec , rayVecHud);
	this.onClick(x, y );//rayVec , rayVecHud);
}


GameonApp.prototype.connect = function(serverip , script)
{
	this.mScript.connect(serverip , script);
}

GameonApp.prototype.disconnect = function()
{
	this.mScript.disconnect();
}

GameonApp.prototype.join = function(data , script)
{
	var tok =  data.split("|");
	var addr = undefined;
	var user = undefined;
	if (tok.length > 0)
	{
		addr = tok[0];
	}
	if (tok.length > 1)
	{
		user = tok[1];
	}    	
	
	this.mScript.join(addr, user , script);
}


GameonApp.prototype.send = function(data)
{
	this.mScript.send(data);
}

GameonApp.prototype.stop = function() 
{
	this.mScript.disconnect();
	
}

GameonApp.prototype.mouseDragged = function(x, y , notimecheck) {
	// 
	if (this.mFrameDeltaTime == 0)
		this.mLastDragTime += 100;
	else
		this.mLastDragTime += this.mFrameDeltaTime;
	
	if (!notimecheck && this.mLastDragTime < 100)
	{
		//return;
	}
	this.fireTouchEvent(0,x, y, 0);
	this.mLastDragTime = 0;
	
	var field = this.mDataGrid.onDragNearest(x , y);
	
	if (field != undefined && this.mFocused != undefined)
	{
		if (field.mArea == this.mFocused.mArea )
		{
			if (this.mLastDrag[0] == 1e07)
			{
				this.mLastDrag[0] = field.mLoc[0];
				this.mLastDrag[1] = field.mLoc[1];
				this.mLastDrag[2] = field.mLoc[2];
				return;
			}else
			{
				var delta0 = field.mLoc[0]- this.mLastDrag[0];
				var delta1 = field.mLoc[1]- this.mLastDrag[1];
				var delta2 = field.mLoc[2]- this.mLastDrag[2];
				
				this.mLastDist = Math.sqrt( (delta0*delta0)+(delta1*delta1)+(delta2*delta2) );			
				
				var area = this.mDataGrid.getArea(field.mArea);
				if (area != undefined)
				{
					area.onDragg(field.mLoc[0] -this.mLastDrag[0],
									field.mLoc[1] -this.mLastDrag[1],
									field.mLoc[2] -this.mLastDrag[2]);
				}
			}
			
			this.mLastDrag[0] = field.mLoc[0];
			this.mLastDrag[1] = field.mLoc[1];
			this.mLastDrag[2] = field.mLoc[2];
		}	
		if (field.mArea ==  this.mFocused.mArea && 
			field.mIndex == this.mFocused.mIndex)
		{
			return;
		}else
		{
			this.onFocusLost(this.mFocused);
			this.mFocused = undefined;
			this.mLastDrag[0] = 1e07;
		}
	}else if (this.mFocused != undefined)
	{
		this.onFocusLost(this.mFocused);
		this.mFocused = undefined;        		
	}
	
	this.mFocused = field;
	if (field != undefined)
	{
		this.onFocusGain(field);
	}

	this.mLastDrag[0] = 1e07;
}


GameonApp.prototype.onFocusGain = function(field)
{
	if (field == undefined || field.mOnFocusGain == undefined)
		return;
	
	var datastr = field.mOnFocusGain;
	if (datastr.indexOf("js:") == 0)
	{
		if (datastr.indexOf(";") == datastr.length-1)
		{
			this.mScript.execScript(datastr.substring(3));
		}else
		{			
			var cmd  = datastr.substring(3);
			cmd += "('" + field.mArea + "',"+ field.mIndex + ");" ;
			this.mScript.execScript(cmd);
		}
		
	}else
	{
		datastr += "," + field.mArea + "," + field.mIndex;
		this.mScript.sendUserData( datastr);
	} 		
	//System.out.println("  onFocusGain " + field.mArea);
}

GameonApp.prototype.onFocusLost = function(field)
{
	if (field == undefined)
		return;
	if (field == undefined || field.mOnFocusLost == undefined)
		return;
	
	var datastr = field.mOnFocusLost;
	if (datastr.indexOf("js:") == 0)
	{
		if (datastr.indexOf(";") == datastr.length)
		{
			this.mScript.execScript(datastr.substring(3));
		}else
		{			
			var cmd  = datastr.substring(3);
			cmd += "('" + field.mArea + "',"+ field.mIndex + ");" ;
			this.mScript.execScript(cmd);
		}
	}else
	{
		datastr += "," + field.mArea + "," + field.mIndex;
		this.mScript.sendUserData( datastr);
	} 		
	
	//System.out.println("  onFocusLost " + field.mArea);
}

GameonApp.prototype.onFocusProbe = function(x, y)
{
	this.mLastClickTime = new Date().getTime();
	this.mouseDragged(x, y , true);
}

GameonApp.prototype.setSplash  = function( splash, delay)
{
	this.mSplashTime = delay;
	this.mSplashScreen = splash;
	this.mSplashTimeStart = 0;
	if (this.mSplashScreen != undefined && this.mSplashScreen.length > 0)
	{
		this.mDrawSPlash = true;
	}	

}

GameonApp.prototype.setEnv = function( name, data)
{
	if (name == "textparam")
	{
		var value = data.split(",");
		var cp = 0.0;
		if (value.length == 5)
			cp = parseFloat(value[4]);
		this.mTextures.setParam( parseFloat(value[0]), parseFloat(value[1]), parseFloat(value[2]), parseFloat(value[3]) , cp);
		
	}
}

GameonApp.prototype.onEvent2 = function(gl, response)
{

		var respid = response["id"];
		var respdata = response["data"];
		var respdata2 = response["data2"];
		var respdata3 = response["data3"];
		var respdata4 = response["data4"];
		var resptype = response["type"];
		var eventid = parseInt( respid);
	  switch (eventid) {
		case 100:
			this.sendEvent(resptype, respdata);
			break;
		case 101:
			this.sendExec(resptype, respdata);
			break;
		case 102:
			this.loadModule(resptype , respdata);
			break;
		case 103:
			this.loadModule2(resptype , respdata);
		break;            
		case 200:
			this.setEnv(resptype, respdata);
		break;			
		case 201:
			this.registerOnTouch(resptype , 0);
		break;
		case 202:
			this.registerOnTouch(resptype , 1);
		break;
		case 203:
			this.registerOnTouch(resptype , 2);
		break;				
		case 1002:
			this.onTextInput(resptype , respdata);
		break;
		case 1200:
			this.goUrl(resptype, respdata);
			//[self goUrl:resptype data:respdata];
		break;            
		case 2600:
			this.mSettings.open();
			break;
		case 2601:
			this.mSettings.save();
			break;
		case 2610:
			this.mSettings.writeInt(resptype , respdata);
		break;
		case 2611:
			this.mSettings.writeStr(resptype , respdata);
			break;            
		case 2620:
			this.mSettings.loadInt(resptype , respdata);
			break;
		case 2621:
			this.mSettings.loadStr(resptype , respdata);
			break;
		case 2622:
			this.mSettings.loadArray(resptype , respdata);
			break;			
		
		case 4000:
			this.mTextures.newTexture(gl ,resptype  , respdata, true);
		break; 
		case 4001:
			this.mTextures.deleteTexture(gl ,resptype );
		break;			
		case 4100:
			this.mObjectsFact.create(resptype , respdata , respdata2 , respdata3);
			break;
		case 4110:
			this.mObjectsFact.place(resptype , respdata);
			break;
		case 4120:
			this.mObjectsFact.scale(resptype , respdata);
			break;
		case 4130:
			this.mObjectsFact.texture(resptype , respdata, respdata2);
			break;
		case 4140:
			this.mObjectsFact.state(resptype , respdata);
			break;
		case 4150:
			this.mObjectsFact.remove(resptype , respdata);
			break;				
		case 4200:
			this.mAnims.move(resptype , respdata,respdata2,respdata3);
			break;			
		case 4210:
			this.mAnims.rotate(resptype , respdata,respdata2,respdata3);
			break;			
		case 5000:
			this.mSounds.newSound(resptype , respdata);
		break;
		case 5010:
			this.mSounds.onPlaySound(resptype  , respdata);
		break;
		case 5011:
			var val = parseFloat(resptype);
			this.mSounds.setVolume(val);
		break;
		case 5012:
			var mutval = parseInt(respdata);
			this.mSounds.setMute(mutval);
		break;

        case 6001:
              this.mItems.newFromTemplate(resptype, respdata , undefined);
          break;
        case 6002:
              this.mItems.setTexture(resptype, respdata);
          break;        	  
        case 6003:
              this.mItems.createModel(resptype, respdata);
          break;        	          	  
        case 6004:
              this.mItems.setSubmodels(resptype, respdata);
          break;
        case 6005:
            this.mItems.newEmpty(resptype);
            break;
        case 6006:
            this.mItems.addShape(resptype, respdata, respdata2, respdata3, respdata4);
            break;
        case 6007:
            this.mItems.addShapeFromData(resptype, respdata, respdata2 , respdata3);
            break;          
		case 7000:
			this.connect(resptype, respdata);
		  break;            
		case 7001:
			this.join(resptype , respdata);
		  break;                        
		case 7002:
			this.send(resptype);
		  break;
		case 7003:
			this.disconnect();
		  break;
		case 7005:
			this.get(resptype , respdata);
			break;
		case 8000:
			this.mWorld.domainCreate(resptype , respdata , respdata2);
			break;
		case 8001:
			this.mWorld.domainRemove(resptype);
			break;
		case 8002:
			this.mWorld.domainShow(resptype);
			break;
		case 8003:
			this.mWorld.domainHide(resptype);
			break;    							
		case 9000:
			this.mBox2dWrapper.initWorld(resptype, respdata , respdata2);
			break;
		case 9001:
			this.mBox2dWrapper.removeWorld(resptype);
			break;		  
		default:
			this.mDataGrid.onEvent2(response);

	  }		  

}


GameonApp.prototype.calcFrameDelay = function()
{

	if (this.mFrameLastTime  == -1)
	{
		this.mFrameLastTime  = new Date().getTime(); 
		this.mFrameDeltaTime = 0;
	}else
	{
		this.mFrameDeltaTime = new Date().getTime() - this.mFrameLastTime;
		this.mFrameLastTime += this.mFrameDeltaTime; 
	}	

	//console.log( "dela "+ this.mFrameDeltaTime);
}


GameonApp.prototype.anims = function()
{
	return this.mAnims;
}

GameonApp.prototype.colors = function()
{
	return this.mColors;
}
GameonApp.prototype.items = function()
{
	return this.mItems;
}
GameonApp.prototype.textures = function()
{
	return this.mTextures;
}
GameonApp.prototype.sounds = function()
{
	return this.mSounds;
}
GameonApp.prototype.settings = function()
{
	return this.mSettings;
}
GameonApp.prototype.objects = function()
{
	return this.mObjectsFact;
}
GameonApp.prototype.cs = function()
{
	return this.mCS;    
}
GameonApp.prototype.world = function()
{
	return this.mWorld;
}
GameonApp.prototype.grid = function()
{
	return this.mDataGrid;
}

GameonApp.prototype.script = function()
{
	return this.mScript;
}

GameonApp.prototype.view = function()
{
	return this.mView;
}

GameonApp.prototype.frameDelta = function() {
	return this.mFrameDeltaTime;

}

GameonApp.prototype.get = function(uri, callback)
{
	this.mScript.get(uri, callback);
}

GameonApp.prototype.registerOnTouch = function(resptype , type) {
	if (type == 0)
		this.mOnTouchCallback = resptype;
	if (type == 1)
		this.mOnTouchStartCallback = resptype;
	if (type == 2)
		this.mOnTouchEndCallback = resptype;    	
}

GameonApp.prototype.fireTouchEvent = function(type, x , y, delay)
{
	// 0 touch event
	if (type == 0 && this.mOnTouchCallback != undefined && this.mOnTouchCallback.length > 0)
	{
		var data = this.mOnTouchCallback + "(" + this.mWorld.gerRelativeX(x) + ","+ this.mWorld.gerRelativeY(y)+ ");";
		this.mScript.execScript(data , 0);        	        	        	
	}
	
	// 1 touch start
	if (type == 1 && this.mOnTouchStartCallback != undefined && this.mOnTouchStartCallback.length > 0 )
	{
		var data = this.mOnTouchStartCallback + "(" + this.mWorld.gerRelativeX(x) + ","+ this.mWorld.gerRelativeY(y)+ ");";
		this.mScript.execScript(data , 0);        	        	
	}
	
	// 2 touch end + delay        
	if (type == 2 && this.mOnTouchEndCallback != undefined && this.mOnTouchEndCallback.length > 0)
	{
		var data = this.mOnTouchEndCallback + "(" + this.mWorld.gerRelativeX(x) + ","+ this.mWorld.gerRelativeY(y)+ ", " + delay+");";
		this.mScript.execScript(data , 0);        	
	}
}
