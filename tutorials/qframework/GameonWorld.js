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

var MAX_INTEGER = 9007199254740992;

function GameonWorld(app)
{

	this.mDomains = [];
    this.mModelList = [];
    this.mModelList2 = [];    
    this.mNewModels = [];
	this.mInDraw = false;
	
	this.mSplashModel = undefined;
	this.mAmbientLight = [ 1.0 , 1.0, 1.0, 1.0];
	this.mAmbientLightChanged = false;
	this.mApp = app;
	this.mViewWidth = 0;
	this.mViewHeight = 0;
	this.mModelList = [];
	this.mModelList2 = [];
	this.mNewModels = [];
	
	GameonWorld.mWorld = this;	
	
	this.addDomain("world",0, true);
	this.addDomain("hud",10000, true);	
}


GameonWorld.prototype.initSplash = function(gl , name)
{
	var model = new GameonModel("splash", this.mApp , undefined);
	model.createPlane(-1.5, -1.0, 0.0, 1.5, 1.0, 0.0,this.mApp.colors().white , undefined);
	
	this.mApp.textures().newTexture(gl, "q_splash", name, true);
	model.setTexture( this.mApp.textures().getTexture("q_splash"));
	var ref = new GameonModelRef(undefined , this);
	ref.mLoc = GameonWorld_Display.HUD;
	model.addref(ref);
	this.mSplashModel = model;
	model.generate(gl);
	model.mEnabled = true;		
}

GameonWorld.prototype.add = function(model)
{
	if (model.isValid())
	{	
		var i = this.mNewModels.indexOf(model);
		if (i>= 0)
		{
			console.error(" model alerady in ");
		}
		this.mNewModels.push(model);
		model.generate();
	}

}

GameonWorld.prototype.remove = function(model)
{
	var i = this.mModelList.indexOf(model);
	if ( i >= 0)
	{
		this.mModelList.splice(i,1);
	}
	i = this.mModelList2.indexOf(model);
	if ( i >= 0)
	{
		this.mModelList2.splice(i,1);
	}
	
	for (var a =0 ; a< this.mDomains.length ; a++)
	{
		var domain = this.mDomains[a];
		domain.remVisible(model , true);
	}	

}
	

GameonWorld.prototype.reinit = function() {
	this.mLockedDraw = true;
	var len = this.mModelList.length;
	for (var a=0; a< len; a++) {
		var model = this.mModelList[a];
		model.reset();
	}

	this.mLockedDraw = false;
}


GameonWorld.prototype.addModels = function(gl)
{
	for (var a=0 ; a < this.mNewModels.length; a++)
	{
		var model= this.mNewModels[a];
		if (model.mIsModel)
		{
			var i = this.mModelList2.indexOf(model);
			if (i>= 0)
			{
				console.error(" model alerady in 1");
			}		
			model.generate();
			this.mModelList2.push(model);				
		}else
		{
			var i = this.mModelList.indexOf(model);
			if (i>= 0)
			{
				console.error(" model alerady in 2");
			}				
			model.generate();
			this.mModelList.push(model);
		}
	}
	this.mNewModels = [];

}

GameonWorld.prototype.draw = function(gl , delay) {
	if (this.mLockedDraw) return;
	if (this.mAmbientLightChanged)
	{
		//gl.glLightModelfv(gl.LIGHT_MODEL_AMBIENT, this.mAmbientLight,0);
		this.mAmbientLightChanged = false;
		gl.uniform4f(gl.getUniformLocation(gl.program, "ambientL"), 
		this.mAmbientLight[0], this.mAmbientLight[1],
		this.mAmbientLight[2], this.mAmbientLight[3]);		
	}

	for (var a =0 ; a< this.mDomains.length ; a++)
	{
		var domain = this.mDomains[a];
		domain.draw(gl , delay);
	}	

}

GameonWorld.prototype.prepare = function(gl) {

	//gl.glEnableClientState(gl.GL_TEXTURE_COORD_ARRAY);
	//gl.glEnableClientState(gl.GL_COLOR_ARRAY);
	//gl.glEnable( gl.GL_COLOR_MATERIAL);
	//gl.glEnableClientState(gl.GL_VERTEX_ARRAY);	
	
	gl.enable(gl.CULL_FACE);
	gl.frontFace(gl.CCW);
	//gl.glEnable(gl.GL_TEXTURE_2D);
	//gl.activeTexture(gl.GL_TEXTURE0);
	 //gl.shadeModel(gl.GL_SMOOTH);
	//gl.hint(gl.PERSPECTIVE_CORRECTION_HINT,gl.NICEST);

			
	gl.clearColor(0.0, 0.0, 0.0,1.0);
	//gl.glShadeModel(GL.GL_SMOOTH);
	
	gl.disable(gl.STENCIL_TEST);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);
	//gl.depthFunc(gl.LESS);
	//gl.depthMask(1);
	//gl.depthRange( 0.01, 10 );
	console.log (" DEPTH_TEST " + gl.getParameter(gl.DEPTH_TEST));
	console.log (" DEPTH_RANGE " + gl.getParameter(gl.DEPTH_RANGE)[0]);
	console.log (" DEPTH_RANGE " + gl.getParameter(gl.DEPTH_RANGE)[1]);
	console.log (" DEPTH_FUNC " + gl.getParameter(gl.DEPTH_FUNC));
	console.log (" DEPTH_BITS " + gl.getParameter(gl.DEPTH_BITS));
	
	
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	//gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
	//gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
	//gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
	
	//gl.glEnable(GL.GL_TEXTURE_2D);
	//gl.disable(gl.DITHER);
	
	//gl.enable(gl.ALPHA_TEST);
	//gl.alphaFunc(gl.GREATER,0.0);
	//gl.enable(gl.LIGHTING);
	//gl.lightModelfv(gl.LIGHT_MODEL_AMBIENT, this.mAmbientLight,0);
	gl.uniform4f(gl.getUniformLocation(gl.program, "ambientL"), 
		this.mAmbientLight[0], this.mAmbientLight[1],
		this.mAmbientLight[2], this.mAmbientLight[3]);		
	
}

GameonWorld.prototype.clear = function() {

	this.mLockedDraw = true;
	this.mModelList.clear();
	this.mNewModels.clear();
	this.mTexts.clear();
	this.mTextsHud.clear();
	this.mLocked = false;
	this.mLockedDraw = false;

	for (var a =0 ; a< this.mDomains.length ; a++)
	{
		var domain = this.mDomains[a];
		domain.clear();
	}	
	
}

GameonWorld.prototype.reinit = function() {
	this.mLockedDraw = true;
	var len = this.mModelList.length;
	for (var a=0; a< len; a++) {
		var model = this.mModelList[a];
		model.reset();
	}

	this.mLockedDraw = false;
}



GameonWorld.prototype.drawSplash = function(gl) {
	if (this.mSplashModel != undefined)
	{
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		
		if (this.mAmbientLightChanged)
		{
			//gl.glLightModelfv(gl.LIGHT_MODEL_AMBIENT, this.mAmbientLight,0);
			this.mAmbientLightChanged = false;
			gl.uniform4f(gl.getUniformLocation(gl.program, "ambientL"), 
			this.mAmbientLight[0], this.mAmbientLight[1],
			this.mAmbientLight[2], this.mAmbientLight[3]);		
		}	
	
		this.mSplashModel.setState(LayoutArea_State.VISIBLE);
		this.mSplashModel.draw(gl, MAX_INTEGER);
		this.mSplashModel.setState(LayoutArea_State.HIDDEN);
	}
	
}

GameonWorld.prototype.setAmbientLight = function(a , r, g, b)
{
	this.mAmbientLight[0] = a;
	this.mAmbientLight[1] = r;
	this.mAmbientLight[2] = g;
	this.mAmbientLight[3] = b;
	this.mAmbientLightChanged = true;
}

GameonWorld.prototype.getAmbientLight = function()
{
	var ret = new Array(4);
	ret[0] = this.mAmbientLight[0];
	ret[1] = this.mAmbientLight[1];
	ret[2] = this.mAmbientLight[2];
	ret[3] = this.mAmbientLight[3]; 
	return ret;
}

GameonWorld.prototype.setAmbientLightGl = function( a , r, g, b, gl)
{
	this.mAmbientLight[0] = a;
	this.mAmbientLight[1] = r;
	this.mAmbientLight[2] = g;
	this.mAmbientLight[3] = b;
	this.mAmbientLightChanged = true;
	//gl.glLightModelfv(GL2.GL_LIGHT_MODEL_AMBIENT, mWorld.mAmbientLight,0);
	gl.uniform4f(gl.getUniformLocation(gl.program, "ambientL"), 
			this.mAmbientLight[0], this.mAmbientLight[1],
			this.mAmbientLight[2], this.mAmbientLight[3]);	
			
}

GameonWorld.prototype.getDomain = function( id)
{
	for (var a =0 ; a< this.mDomains.length ; a++)
	{
		var domain = this.mDomains[a];
		if (domain.mRenderId == id)
		{
			return domain;
		}
	}
	return undefined;
}

GameonWorld.prototype.getDomainByName = function(name)
{
	for (var a =0 ; a< this.mDomains.length ; a++)
	{
		var domain = this.mDomains[a];
		if (domain.mName == name)
		{
			return domain;
		}
	}
	return undefined;
}	

GameonWorld.prototype.addDomain = function(name, i, visible) 
{
	for (var a =0 ; a< this.mDomains.length ; a++)
	{
		var domain = this.mDomains[a];
		if (domain.mName == name || domain.mRenderId == i)
		{
			return undefined;
		}
	}
	
	var newdomain = new RenderDomain(name, this.mApp , this.mViewWidth, this.mViewHeight);
	if (visible)
	{
		newdomain.show();
	}
	newdomain.mRenderId = i;
	
	var inserted = false;
	for (var a =0 ; a< this.mDomains.length ; a++)
	{
		var old = this.mDomains[a];
		if (old.mRenderId > i)
		{
			this.mDomains.splice(a, 0 ,newdomain);
			inserted = true;
			break;
		}
	}

	if (!inserted)
	{
		this.mDomains.push(newdomain);
	}
	return newdomain;
}


GameonWorld.prototype.onSurfaceChanged = function(gl,width, height) 
{
	this.mViewWidth = width;
	this.mViewHeight = height;
	for (var a =0 ; a< this.mDomains.length ; a++)
	{
		var domain = this.mDomains[a];
		domain.onSurfaceChanged(gl, width, height);
	}
}

GameonWorld.prototype.onSurfaceCreated = function(gl)
{
	for (var a =0 ; a< this.mDomains.length ; a++)
	{
		var domain = this.mDomains[a];
		domain.onSurfaceCreated(gl);
	}
}

GameonWorld.prototype.domainCreate = function(name, id, coordsstr) 
{
	var domain = this.getDomainByName(name);
	if (domain != undefined)
	{
		return;
	}
	
	var newdomain  = this.addDomain(name, parseInt(id), false);
	if (newdomain != undefined && coordsstr != undefined && coordsstr.length > 0)
	{
		var coords = new Array(4);
		ServerkoParse.parseFloatArray(coords, coordsstr);
		newdomain.setBounds(this.mViewWidth, this.mViewHeight , coords);
		
		
	}
}

GameonWorld.prototype.domainRemove = function(name) 
{
	var domain = this.getDomainByName(name);
	if (domain != undefined)
	{
		domain.clear();
		var i = this.mDomains.indexOf(domain);
		if ( i >= 0)
		{
			this.mDomains.splice( i,1 );
		}
	}
}

GameonWorld.prototype.gerRelativeX = function(x) 
{
	return x/this.mViewWidth;
}

GameonWorld.prototype.gerRelativeY = function(y) 
{
	return y/this.mViewHeight;
}

GameonWorld.prototype.domainShow = function(name) 
{
	var domain = this.getDomainByName(name);
	if (domain != undefined)
	{
		domain.show();
	}
}

GameonWorld.prototype.domainHide = function(name) 
{
	var domain = this.getDomainByName(name);
	if (domain != undefined)
	{
		domain.hide();
	}		
}

GameonWorld.prototype.onTouchModel = function(x, y, click) 
{
	var data= undefined;
	for (var a= this.mDomains.length-1 ; a>=0;  a--)
	{
		var domain = this.mDomains[a];
		data= domain.onTouchModel(x,y, click, true);
		if (data != undefined)
		{
			return data;
		}
	}
	return null;
}

GameonWorld.prototype.domainPan = function(name, mode, scrollers,coords) 
{
	var domain = this.getDomainByName(name);
	if (domain != undefined)
	{
		domain.pan(mode, scrollers,coords);
	}
	
}

GameonWorld.prototype.panDomain = function(x, y) 
{
	for (var a= this.mDomains.length-1 ; a>=0;  a--)
	{
		var domain = this.mDomains[a];
		if (domain.onPan(x,y))
		{
			return true;
		}
	}
	return false;
}

GameonWorld.prototype.resetDomainPan = function() 
{
	for (var a= this.mDomains.length-1 ; a>=0;  a--)
	{
		var domain = this.mDomains[a];
		domain.resetPan();
	}
}

