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

function StringString()
{
	this.a = "";
	this.b = "";
}

	TextureFactory_Type =
	{
		DEFAULT:0,
		FONT:1
	}

function TextureFactory_MaterialData(texturef)
{
	this.mTextFact = texturef;
	this.ambient = 1.0;
	this.diffuse = 1.0;
	this.alpha = 1.0;
	this.ambientMap = undefined;
	this.diffuseMap = undefined;
	this.ambientMapId = this.mTextFact.get(TextureFactory_Type.DEFAULT);
	this.diffuseMapId = this.mTextFact.get(TextureFactory_Type.DEFAULT);
	this.t = undefined;
}

TextureFactory_MaterialData.prototype.setDiffuseMap = function(gl,folder, data) 
{
	this.diffuseMap = data;
	var textname = data;
	var textfile = folder + data;
	this.diffuseMapId = this.mTextFact.newTexture(gl, textname, textfile, true);
}

TextureFactory_MaterialData.prototype.setAmbientMap = function(gl,folder, data) 
{
	this.ambientMap = data;
	var textname = data;
	var textfile = folder +  data;
	this.ambientMapId = this.mTextFact.newTexture(gl, textname, textfile, true);
}

TextureFactory_MaterialData.prototype.setAlpha = function(data) 
{
	// 
	this.alpha = parseFloat(data);
}

TextureFactory_MaterialData.prototype.setAlpha2 = function(data) 
{
	// 
	this.alpha = 1.0-parseFloat(data);
}

TextureFactory_MaterialData.prototype.setDiffuse = function(data) 
{
	var difdata = ServerkoParse.parseFloatArray2(data);
	this.diffuse = new GLColor(
			difdata[0], 
			difdata[1], 
			difdata[2],
			this.alpha);
	
}

TextureFactory_MaterialData.prototype.setAmbient = function(data) 
{
	var ambdata = ServerkoParse.parseFloatArray2(data);
	this.ambient= new GLColor(
			ambdata[0], 
			ambdata[1], 
			ambdata[2],
			this.alpha);			
}

TextureFactory_MaterialData.prototype.setTransform = function(data)
{
	this.t = ServerkoParse.parseFloatArray2(data);
}

	

function TextureFactory( app) 
{
    
	this.mTextureDefault = 1;
	this.mTextureFont = 1;
	this.mTextures = {};//new HashMap<String, Integer>();
	this.mTextureIds = []; //new Vector<Texture>();
	this.mInfos = []; //new Vector<StringString>();
	this.mToDelete = []; //new Vector<String>();
	this.mApp = app;
	this.mU1 = 0.0;
	this.mV1 = 0.0;
	this.mU2 = 0.0;
	this.mV2 = 0.0;
	this.mCp = 0.0;

	this.mMaterials = {};
}

TextureFactory.prototype.init = function(gl) {

	this.clear();
	this.mTextureDefault = this.loadTextureFromFile( gl, "whitesys.png" , true);
	this.mTextureFont = this.loadTextureFromFile( gl, "fontsys.png" , true);
	for (var a=0; a< this.mInfos.length; a++)
	{
		var e = this.mInfos.get(a);
		this.newTexture(gl,e.b, e.a , false);
	}
	
}	

TextureFactory.prototype.handleLoadedTexture = function(texture) {
	gl.bindTexture(gl.TEXTURE_2D, texture);
	//gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.bindTexture(gl.TEXTURE_2D, null);
}
	
TextureFactory.prototype.loadTextureFromFile = function(gl , fname , system)
{
	//id = loadImageTexture(gl, "res/" + fname);
	var id = gl.createTexture();
	id.image = new Image();
	id.image.callback = this;
		id.image.onload = function () {
		this.callback.mApp.mDataChange = true;
		this.callback.handleLoadedTexture(id)
	}

	if (system == true)
	{
		id.image.src = "qres/" + fname;
	}
	else
	{
		id.image.src = "res/" + fname;
	}
	
	return id;
}

TextureFactory.prototype.get = function(type) {
	switch (type) {
	
		case TextureFactory_Type.FONT: return this.mTextureFont;
		case TextureFactory_Type.DEFAULT: return this.mTextureDefault;
	}
	return this.mTextureDefault;
}

TextureFactory.prototype.getTexture = function(strData) {

	if (this.mTextures[strData] != undefined)
	{
		//Log.d("model" , " returning " + mTextures.get(strData));
		return this.mTextures[strData];
	}
	return this.mTextureDefault;
}

TextureFactory.prototype.deleteTexture = function(gl ,textname)
{
	this.mToDelete.push(textname);
}

TextureFactory.prototype.flushTextures = function(gl)
{
	for (var a=0; a< this.mToDelete.length ; a++)
	{
		this.clearTexture(gl , this.mToDelete[a]);
	}
	
	this.mToDelete = [];
}

TextureFactory.prototype.clearTexture = function(gl, textname)
{
	if (this.mTextures[textname] != undefined)
	{
		var id = this.mTextures[textname];
		gl.deleteTexture(id);
		delete this.mTextures[textname];
		for (var a=0; a < this.mInfos.length; a++)
		{
			var info = this.mInfos[a];
			if (info.b == textname)
			{
				this.mInfos.splice(a,1);
				break;
			}
		}
	}
	
}

TextureFactory.prototype.clear = function() {
	// TODO Auto-generated method stub
	this.mTextures = {};
	this.mInfos = [];
			
}


TextureFactory.prototype.newTexture = function(gl,textname , textfile, add)
{
	
	
	var texture =  this.loadTextureFromFile( gl, textfile , false);
	if (texture != undefined)
	{
		this.mTextures[textname] = texture;
		if (add)
		{
			var info = new StringString();
			info.a = textfile;
			info.b = textname;
			this.mInfos.push( info );
		}
		if (textname== "font")
		{
			this.mTextureFont = texture;
		}		
	}else
	{
		//System.out.println("cant load " + textname);
	}

	return texture;
}

TextureFactory.prototype.setParam = function( u1,v1,u2,v2, cp)
{
	this.mU1 = u1;
	this.mU2 = u2;
	this.mV1 = v1;
	this.mV2 = v2;	
	this.mCp = cp;	
}


TextureFactory.prototype.initTextures = function(response)
{
	var areas;
	areas = response["texture"];
	for (var a=0; a< areas.length; a++)
	{
		var pCurr = areas[a];
		this.processTexture(pCurr);
	}	

}

TextureFactory.prototype.processTexture = function( objData) {
	var name = objData["name"];
	var file = objData["file"];
	this.newTexture(gl,name , file , true);
	

}

TextureFactory.prototype.loadMaterial = function (gl, folder, fname)
{
	// 
	var objstr = this.mApp.getStringFromFile(folder + fname);
	var tok = objstr.split("\n");
	var current = undefined;
	
	for (var a=0; a< tok.length; a++)
	{		
		var line = tok[a];
		line = line.replace("\r", "");
		line = line.replace("\t", "");
		if (line.indexOf("#") == 0)
		{
			continue;
		}else
		if (line.indexOf("newmtl") == 0)
		{
			current = new TextureFactory_MaterialData(this);
			this.mMaterials[line.substring(7)] = current;
		}else				
		if (line.indexOf("Ka") == 0)
		{
			current.setAmbient(line.substring(3));
		}else
		if (line.indexOf("Kd") == 0)
		{
			current.setDiffuse(line.substring(3));
		}else
		if (line.indexOf("d ") == 0)
		{
			current.setAlpha(line.substring(2));
		}else
		if (line.indexOf("Tr") == 0)
		{
			current.setAlpha2(line.substring(2));
		}else
		if (line.indexOf("map_Ka") == 0)
		{
			current.setAmbientMap(gl,folder, line.substring(7));
		}else
		if (line.indexOf("map_Kd") == 0)
		{
			current.setDiffuseMap(gl,folder, line.substring(7));
		}else
		if (line.indexOf("t ") == 0)
		{
			current.setTransform(line.substring(2));
		}
	}
}

TextureFactory.prototype.getMaterial = function(substring) 
{
	return this.mMaterials[substring];
}

