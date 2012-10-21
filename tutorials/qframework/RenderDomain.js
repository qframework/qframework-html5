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

function RenderDomain(name, app, w, h)
{

    this.mVisibleModelList = [];	
	this.mVisibleModelList2 = [];    	
	this.mTexts = new TextRender();
	this.mApp = app;
    this.mPanX = false;
    this.mPanY = false;
    this.mPanCoords = [ -1000.0,1000.0,-1000.0,1000.0];
    this.mLastPanX = -1;
    this.mLastPanY = -1;
	
	this.mRenderId = -1;
    this.mSpaceBottomLeft = [0,0];
    this.mSpaceTopRight = [0,0];
	this.mName = name;
	
	this.mFov = 45;
	this.mNear = 0.1;
	this.mFar = 8.7;
	this.mOffsetX = 0;
	this.mOffsetY = 0;
	this.mWidth = w;
	this.mHeight = h;
	
	this.mViewport = [0,0,w,h];
	
	this.mOffXPerct = 0.0;
	this.mOffYPerct = 0.0;
	this.mWidthPerct = 1.0;
	this.mHeightPerct = 1.0;
	this.mAspect = 1.0;
	this.mCS = new GameonCS(app);

	this.mVisible = false;
	this.mHorizontalScroller = undefined;
	this.mVerticalScroller = undefined;

}


RenderDomain.prototype.draw = function(gl , delay) 
{
	if (!this.mVisible)
	{
		return;
	}

	gl.viewport(this.mViewport[0], this.mViewport[1], this.mViewport[2], this.mViewport[3] );
	gl.clear(gl.DEPTH_BUFFER_BIT);

	this.mCS.applyCamera(gl , delay);
	

	var len = this.mVisibleModelList.length;
	
	for (var a=0; a< len; a++) {
		var model = this.mVisibleModelList[a];
		if (!model.mHasAlpha)
		{
			model.draw(gl, this.mRenderId);
		}
	}
	for (var a=0; a < len ; a++) {
		var model = this.mVisibleModelList[a];
		if (model.mHasAlpha)
		{
			model.draw(gl, this.mRenderId);
		}
	}

	len = this.mVisibleModelList2.length;
	for (var a=0; a< len; a++) {
		var model = this.mVisibleModelList2[a];
		if (!model.mHasAlpha)
		{
			model.draw(gl, this.mRenderId);
		}
	}
	for (var a=0; a < len ; a++) {
		var model = this.mVisibleModelList2[a];
		if (model.mHasAlpha)
		{
			model.draw(gl, this.mRenderId);
		}
	}
	
	//gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	this.mTexts.render(gl);
}

RenderDomain.prototype.clear = function() {

	for (var a = 0 ; a < this.mVisibleModelList.length; a++)
	{
		var model  = this.mVisibleModelList[a];
		model.hideDomainRefs(this.mRenderId);
	}
	for (var a = 0 ; a < this.mVisibleModelList2.length; a++)
	{
		var model  = this.mVisibleModelList2[a];
		model.hideDomainRefs(this.mRenderId);
	}		
	this.mTexts.clear();

}
RenderDomain.prototype.setVisible = function(model)
{
	if (model.mIsModel)
	{
		if (this.mVisibleModelList2.indexOf(model) < 0)
		{
		
			for (var a=0; a< this.mVisibleModelList2.length; a++)
			{
				if (this.mVisibleModelList2[a].mTextureID == model.mTextureID)
				{
					this.mVisibleModelList2.splice(a,0,model);	
					return;
				}
			}
			this.mVisibleModelList2.push(model);	
		}
	}else
	{
		if (this.mVisibleModelList.indexOf(model) < 0)
		{
			for (var a=0; a< this.mVisibleModelList.length; a++)
			{
				if (this.mVisibleModelList[a].mTextureID == model.mTextureID)
				{
					this.mVisibleModelList.splice(a,0,model);	
					return;
				}
			}		
			this.mVisibleModelList.push(model);	
		}		
	}
}

RenderDomain.prototype.remVisible = function(model , force)
{
	var countvis = model.getVisibleRefs(this.mRenderId);
	if (countvis > 0 && !force)
	{
		return;
	}

	if (model.mIsModel)
	{
		var i = this.mVisibleModelList2.indexOf(model);
		if ( i >= 0)
		{
			this.mVisibleModelList2.splice(i,1);	
		}
	}else
	{
		var i = this.mVisibleModelList.indexOf(model);
		if (i >= 0)
		{
			this.mVisibleModelList.splice(i,1);	
		}		
	}
}	

RenderDomain.prototype.texts = function()
{
	return this.mTexts;
}

RenderDomain.prototype.perspective = function(gl,fovy, aspect, zmin , zmax, frustrumUpdate)
{
	var xmin, xmax, ymin, ymax;
	ymax = zmin * Math.tan(fovy * Math.PI / 360.0);
	ymin = -ymax;
	xmin = ymin * aspect;
	xmax = ymax * aspect;
	if (frustrumUpdate)
	{
		gl.perspectiveMatrix.perspective(fovy , aspect , zmin , zmax);
	}else
	{
		this.mCS.saveProjection(xmin , xmax , ymin , ymax , zmin , zmax);
		this.mCS.saveProj(fovy, aspect, zmin, zmax);
	}
}


RenderDomain.prototype.setFov = function(fovf, nearf, farf) 
{
	this.mFar = farf;
	this.mNear = nearf;
	this.mFov = fovf;
	this.perspective(gl, this.mFov , this.mWidth/this.mHeight , this.mNear , this.mFar , false);

}

RenderDomain.prototype.onSurfaceChanged = function (gl , width, height)
{
	var newWidth = width;
	var newHeight = height;

	this.mWidth = this.mWidthPerct * newWidth;
	this.mHeight = this.mHeightPerct * newHeight;
	this.mOffsetX = this.mOffXPerct * newWidth;
	this.mOffsetY = this.mOffYPerct * newHeight;
	this.mViewport[0] = this.mOffsetX;
	this.mViewport[1] = this.mOffsetY;
	this.mViewport[2] = this.mWidth;
	this.mViewport[3] = this.mHeight;
	
	this.mCS.saveViewport( this.mViewport, width, height);
	this.perspective(gl , this.mFov , this.mWidth/this.mHeight, this.mNear , this.mFar, false);
	
}


RenderDomain.prototype.onSurfaceCreated = function(gl) 
{
	
}

RenderDomain.prototype.removeText = function(text)
{
	this.mTexts.remove(text);
}



RenderDomain.prototype.setBounds = function(width, height, coords) 
{
	this.mOffXPerct = coords[0];
	this.mOffYPerct = coords[1];
	this.mWidthPerct = coords[2];
	this.mHeightPerct = coords[3];
	
	this.onSurfaceChanged(gl, width, height);
	
}



RenderDomain.prototype.show = function() 
{
	this.mVisible = true;
}

RenderDomain.prototype.hide = function() 
{
	this.mVisible = false;
	
}	

RenderDomain.prototype.onTouchModel = function(x, y, click, noareas) 
{
	var rayVec = [ 0,0,0];
	var eye = undefined;
	
	this.mCS.screen2spaceVec(x, y, rayVec);
	eye = this.mCS.eye();
	
	var data = undefined;
	var len = this.mVisibleModelList.length;
	for (var a=0; a< len; a++)
	{
		var model = this.mVisibleModelList[a];
		if (noareas && model.mParentArea!= undefined)
		{
			continue;
		}
		data = model.onTouch(eye , rayVec , this.mRenderId,click);
		if (data != undefined)
		{
			return data;
		}
	}

	len = this.mVisibleModelList2.length;
	for (var a=0; a< len; a++) 
	{
		var model = this.mVisibleModelList2[a];
		if (noareas && model.mParentArea!= undefined)
		{
			continue;
		}			
		
		data = model.onTouch(eye , rayVec , this.mRenderId,click);
		if (data != undefined)
		{
			return data;
		}			
	}

	return undefined;
}	


RenderDomain.prototype.pan = function(mode, scrollers, coords) 
{
	if (mode = "enable")
	{
		// enable x and y
		this.mPanX = true;
		this.mPanY = true;
	}else if (mode == "enablex")
	{
		// enable x
		this.mPanX = true;
		this.mPanY = false;			
	}else if (mode == "enabley")
	{
		// enable y
		this.mPanX = false;
		this.mPanY = true;			
	}else if (mode == "disable")
	{
		// disable all
		this.mPanX = false;
		this.mPanY = false;			
	}
	if (coords != undefined)
	{
		ServerkoParse.parseFloatArray(this.mPanCoords, coords);
	}
	
	if (scrollers != undefined && scrollers == "true")
	{
		if (this.mPanX)
		{
			//mHorizontalScroller = new GameonModel("horscroll", mApp, null);
		}
	}
}



RenderDomain.prototype.onPan = function(x, y) 
{
	
	if (!this.mPanX && !this.mPanY)
	{
		return false;
	}
	
	if ( x < this.mOffsetX || x > this.mOffsetX + this.mWidth || y < this.mOffsetY || y > this.mOffsetY + this.mHeight)
	{
		return false;
	}
	
	// calculate delta
	if (this.mLastPanX == -1)
	{
		this.mLastPanX = x; 
		this.mLastPanY = y;
		return true;
	}
	
	var deltax = x - this.mLastPanX;
	var deltay = y - this.mLastPanY;

	
	var eye = this.mCS.eye();

	var lookat = this.mCS.lookat();
	
	var lasteyex = eye[0];
	var lasteyey = eye[1];
	var lastlookx = lookat[0];
	var lastlooky = lookat[1];
	
	
	if (this.mPanX)
	{
		eye[0] -= deltax/50.0;
		lookat[0] -= deltax/50.0;
	}
	if (this.mPanY)
	{
		eye[1] += deltay/50.0;
		lookat[1] += deltay/50.0;
	}
	
	
	//System.out.println( eye[0] );
	this.mCS.setCamera(lookat , eye);
	this.mLastPanX = x; 
	this.mLastPanY = y;
	
	var canreturn = false;
	var lastrunx = eye[0];
	var lastruny = eye[1];
	
	do 
	{
		
		lastrunx = eye[0];
		lastruny = eye[1];
		
		this.mCS.screen2space(this.mOffsetX+this.mWidth, -this.mOffsetY, this.mSpaceTopRight);
		this.mCS.screen2space(this.mOffsetX, -this.mOffsetY+this.mHeight, this.mSpaceBottomLeft);
/*
		System.out.println( mSpaceBottomLeft[0]+","+ mSpaceBottomLeft[1]+","+ 
				mSpaceTopRight[0] +","+  mSpaceTopRight[1]);
		
		System.out.println( mSpaceBottomLeft[0]+","+ mSpaceBottomLeft[1]+","+ 
							mSpaceTopRight[0] +","+  mSpaceTopRight[1]);
		*/
		canreturn = true;
		if (this.mPanCoords[0] != -1000)
		{
			if (this.mPanX)
			{
				if ((this.mPanCoords[1] - this.mPanCoords[0]) < (this.mSpaceTopRight[0] - this.mSpaceBottomLeft[0]))
				{
					eye[0] = lasteyex;
					lookat[0] = lastlookx;
					this.mCS.setCamera(lookat , eye);
					canreturn = true;
					
				}else
				if (this.mSpaceBottomLeft[0] < this.mPanCoords[0]+0.001 || this.mSpaceTopRight[0] > this.mPanCoords[1]-0.001)
				{
					eye[0] = (lasteyex + eye[0]) / 2;
					lookat[0] = (lastlookx + lookat[0]) / 2;
					this.mCS.setCamera(lookat , eye);
					canreturn = false;
				}
			}
			
			if (this.mPanY )
			{
				if ((this.mPanCoords[3] - this.mPanCoords[2]) < (this.mSpaceTopRight[1] - this.mSpaceBottomLeft[1]))
				{
					eye[1] = lasteyey;
					lookat[1] = lastlooky;
					this.mCS.setCamera(lookat , eye);
					canreturn = true;						
				}else
				if (this.mSpaceBottomLeft[1] < this.mPanCoords[2]+0.001 || this.mSpaceTopRight[1] > this.mPanCoords[3]-0.001)
				{
					eye[1] = (lasteyey + eye[1]) / 2;
					lookat[1] = (lastlooky + lookat[1]) / 2;
					this.mCS.setCamera(lookat , eye);
					canreturn = false;
				}
			}
		}
		if (lastrunx == eye[0] && lastruny == eye[1])
		{
			break;
		}
	}while(!canreturn);
	return true;
}



RenderDomain.prototype.resetPan = function() 
{
	this.mLastPanX = -1;
	this.mLastPanY = -1;
}	

