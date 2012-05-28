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

function GameonCS( ) 
{
	this.mCanvasW = 0.0;
	this.mCanvasH = 0.0;
	this.mCanvasZ = 0.0;
	this.mViewport = new Array(0 ,0,0,0);
	this.mLookAt = new Array(0,0,0,0 , 0,0,0,0 , 0,0,0,0 , 0,0,0,0);
	this.mProjection = new Array(0,0,0,0 , 0,0,0,0 , 0,0,0,0 , 0,0,0,0);
	this.mProjData = new Array(0,0,0,0);

	this.mCameraEye= new Array(0.0,0.0,5.0);
	this.mCameraLookAt = new Array(0,0,0);

	this.mHudInit = false;
	this.mSpaceInit = false;

	this.mBBox = new Array(0,0,0,0 , 0,0,0,0);

	this.mUpZ = new Array(0,1,0);
	this.mUpZHud = new Array(0,1,0);
	this.mScreenHeight = 0;
	this.mScreenWidth = 0;
	
}	

GameonCS.prototype.setGlu = function(g)
{
	//glu = g;
}

GameonCS.prototype.saveViewport = function(viewport , w, h) {
	this.mScreenHeight = h;
	this.mScreenWidth = w;
	this.mViewport[0] = viewport[0];
	this.mViewport[1] = viewport[1];
	this.mViewport[2] = viewport[2];
	this.mViewport[3] = viewport[3];

}

GameonCS.prototype.saveProjection = function( left, right, top, bottom, near,  far )
{
	
	this.mProjection = GMath.frustrum( left, right
			, top, bottom, near , far);

}

GameonCS.prototype.saveProjectionHud = function( left, right, top, bottom, near,  far )
{
			
	this.mProjectionHud = GMath.frustrum( left, right
			, top, bottom, near , far);
			

	//gl.glGetFloatv(GL2.GL_PROJECTION_MATRIX, mProjection, 0);
}


GameonCS.prototype.set = function()
{
}	

GameonCS.prototype.init = function(canvasw, canvash, canvasz ) 
{

	this.mCanvasW = canvasw;
	this.mCanvasH = canvash;
	this.mCanvasZ = canvasz;
}


GameonCS.prototype.screen2space = function(x, y, spacecoords) {
	var c = [3];
	var f = [3];
	y = this.mViewport[3] - y;

	GMath.unProject(x,y, 1.0 ,
			this.mLookAt, 
			this.mProjection, 
			this.mViewport, 
			f );
	GMath.unProject(x,y, 0.0 ,
			this.mLookAt, 
			this.mProjection, 
			this.mViewport, 
			c );    		
	
	f[0] -= c[0];
	f[1] -= c[1];
	f[2] -= c[2];
	var rayLength = Math.sqrt(c[0]*c[0] + c[1]*c[1] + c[2]*c[2]);
	//normalize
	f[0] /= rayLength;
	f[1] /= rayLength;
	f[2] /= rayLength;

	//T = [planeNormal.(pointOnPlane - rayOrigin)]/planeNormal.rayDirection;
	//pointInPlane = rayOrigin + (rayDirection * T);

	var dot1, dot2;

	var pointInPlaneX = 0;
	var pointInPlaneY = 0;
	var pointInPlaneZ = 0;
	var planeNormalX = 0;
	var planeNormalY = 0;
	var planeNormalZ = -1;

	pointInPlaneX -= c[0];
	pointInPlaneY -= c[1];
	pointInPlaneZ -= c[2];

	dot1 = (planeNormalX * pointInPlaneX) + (planeNormalY * pointInPlaneY) + (planeNormalZ * pointInPlaneZ);
	dot2 = (planeNormalX * f[0]) + (planeNormalY * f[1]) + (planeNormalZ * f[2]);

	var t = dot1/dot2;

	f[0] *= t;
	f[1] *= t;
/*
	Log.d("model", " o " + f[0]  + " , "+ f[1]  + " , "+ f[2]  );
	Log.d("model", " o " + (f[0] + c[0]) + " , "+ (f[1]  + c[1]) );
*/
	spacecoords[0] = f[0] + c[0];
	spacecoords[1] = f[1] + c[1];
}

GameonCS.prototype.saveLookAt = function(eye, center, up) {
	for (var a=0; a< 16; a++)
	{
		this.mLookAt[a] = 0;
	}
	GMath.lookAt(this.mLookAt, eye , center , up);
	
}

GameonCS.prototype.saveLookAtHud = function(eye, center, up) {
	for (var a=0; a< 16; a++)
	{
		this.mLookAtHud[a] = 0;
	}		
	GMath.lookAt(this.mLookAtHud, eye , center , up);
	
}

GameonCS.prototype.screen2spaceVec = function(x,y, vec)
{
	var c = [0.0, 0.0,0.0];
	y = this.mScreenHeight - y;
	GMath.unProject(x,y, 1.0,this.mLookAt, 
			this.mProjection, 
			this.mViewport, 
			c );
	vec[0] = c[0] - this.mCameraEye[0];
	vec[1] = c[1] - this.mCameraEye[1];
	vec[2] = c[2] - this.mCameraEye[2];
}

GameonCS.prototype.screen2spaceVecHud = function(x,y, vec)
{
	var c = [0.0, 0.0,0.0];
	y = this.mViewport[3] - y;
	GMath.unProject(x,y, 1.0, this.mLookAtHud, 
			this.mProjectionHud, 
			this.mViewport, 
			c );
	vec[0] = c[0] - this.mCameraEyeHud[0];
	vec[1] = c[1] - this.mCameraEyeHud[1];
	vec[2] = c[2] - this.mCameraEyeHud[2];
}

GameonCS.prototype.snap_cam_z = function(eye,  center,  up) 
{
	 
	var lookAt = [16];
	var eye2 = [3];
	
	for (var a=0; a< 3;a++)
	{
		eye2[a] = eye[a];
	}
	
	for (var  ez = eye[2]; ez <10; ez += 0.05)
	{
		var cordx = this.mCanvasW;
		var cordy = 0;

		var x,y,z;
		eye2[2] = ez;
		var win = [3];
		GMath.lookAt(lookAt,eye2,center,up);
		if (GMath.project(cordx, cordy, 0.0, 
					lookAt,
					 this.mProjection,
					 this.mViewport,
					 win,0) &&  win[0]> 0 && win[0] < this.mViewport[2] )
		{
			this.mCameraEye[0] = 0;
			this.mCameraEye[1] = 0;		
			this.mCameraEye[2] = ez;
			
			this.mCameraLookAt[0] = 0;
			this.mCameraLookAt[1] = 0;
			this.mCameraLookAt[2] = 0;
			
			this.mUpZ[0] = 0;
			this.mUpZ[1] = 1;
			this.mUpZ[2] = 0;			
			this.saveLookAt(this.mCameraEye , this.mCameraLookAt , this.mUpZ);         	        	
			return ez;
		}
		 
	}
	return 0;
}

GameonCS.prototype.setCamera = function(lookat ,eye)
{
	this.mCameraEye[0] = eye[0];
	this.mCameraEye[1] = eye[1];
	this.mCameraEye[2] = eye[2];    

	this.mCameraLookAt[0] = lookat[0];
	this.mCameraLookAt[1] = lookat[1];
	this.mCameraLookAt[2] = lookat[2];    
	
	this.saveLookAt(this.mCameraEye , this.mCameraLookAt , this.mUpZ);
	
}

GameonCS.prototype.applyCamera = function(gl)
{
	if (!this.mSpaceInit)
	{
		this.mSpaceInit = true;
		this.saveLookAt(this.mCameraEye ,  this.mCameraLookAt , this.mUpZ);
		
	}

	gl.perspectiveMatrix.makeIdentity();
	gl.perspectiveMatrix.perspective(this.mProjData[0] , this.mProjData[1] , this.mProjData[2] , this.mProjData[3]);
	
	var lookat = new J3DIMatrix4();
	lookat.load(this.mLookAt);
	gl.perspectiveMatrix.multiply(lookat);
	gl.perspectiveMatrix.setUniform(gl , gl.u_modelProjMatrixLoc, false);
	
}


GameonCS.prototype.getScreenBounds = function(world , hud )
{

	var temp = [2];
	this.screen2space(this.mViewport[0] , this.mViewport[1], temp);
	world[0] = temp[0] ;world[1] = temp[1];
	
	this.screen2space(this.mViewport[2] , this.mViewport[1], temp);
	world[2] = temp[0] ;world[3] = temp[1];
	
	this.screen2space(this.mViewport[2] , this.mViewport[3], temp);
	world[4] = temp[0] ;world[5] = temp[1];
	
	this.screen2space(this.mViewport[0] , this.mViewport[3], temp);
	world[6] = temp[0] ;world[7] = temp[1];


	for (var a=0; a< 8; a++)
	{
		this.mBBox[a] = world[a];
	}
	
	
}

GameonCS.prototype.getCanvasW = function()
{
	return this.mViewport[2] - this.mViewport[0];
}

GameonCS.prototype.getCanvasH = function()
{
	return this.mViewport[3] - this.mViewport[1];
}

GameonCS.prototype.saveProj = function( fovy , aspect , zmin , zmax)
{
	this.mProjData[0] = fovy;
	this.mProjData[1] = aspect;
	this.mProjData[2] = zmin;
	this.mProjData[3] = zmax;
	
}

GameonCS.prototype.getCanvasW = function()
{
	return this.mViewport[2] - this.mViewport[0];
}

GameonCS.prototype.getCanvasH = function()
{
	return this.mViewport[3] - this.mViewport[1];
}

GameonCS.prototype.worldWidth = function()
{
	return this.mBBox[2] - this.mBBox[0];
}

GameonCS.prototype.worldHeight = function()
{
	return this.mBBox[2] - this.mBBox[0];
}	

GameonCS.prototype.worldCenterX = function()
{
	return (this.mBBox[2] + this.mBBox[0]) / 2;
}

GameonCS.prototype.worldCenterY = function()
{
	return (this.mBBox[1] + this.mBBox[5]) / 2;
}	


GameonCS.prototype.eye = function()
{
	return this.mCameraEye;
}	

