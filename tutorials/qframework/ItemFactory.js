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

function ItemFactory( app) 
{

    this.mApp = app;

	this.mInitialized = false;

	this.mModels = {};

	this.mWorld = app.mWorld;
	this.mDefaultTransf = [0.0,0.0,0.0,1.0, 1.0,1.0, 0.0,0.0,0.0];

	this.mDefaultUv = [0.0,0.0,1.0,1.0];
	this.mDefaultColors = new Array();
    this.mDefaultColors[0] = [0xFFFFFFFF];
}

ItemFactory.prototype.create = function()
{
	
}

ItemFactory.prototype.createItem = function(type, item)
{
	var tok = type.split(".");
	
	var imageset = tok[0];
	var model = this.mModels[imageset];
	
	if (model == undefined) {
		return undefined;
	}
	
	var  imageid = -1;
	if (tok.length> 1)
		imageid = parseInt(tok[1]);
	
	return this.createItemFromModel(model, imageid, item);

}


ItemFactory.prototype.createItemFromModel = function(model, itemID, item)
{
	var fig = item;
	if (fig == undefined)
	{
		fig = new LayoutItem(this.mApp);
	}
	fig.mType = model.mModelTemplate;
	fig.mModel = model;
	fig.mItemID = itemID;
	fig.mOwner = itemID;
	fig.mOwnerMax = model.mSubmodels;
	

	return fig;
	
}

ItemFactory.prototype.createCard52 = function(itemID, data, item) {
	var fig = item;
	if (fig == undefined)
	{
		fig = new LayoutItem();
	}
	fig.mType = GameonModelData_Type.CARD52; 
	fig.mModel = this.mCard52;
	fig.mItemID = itemID;

	fig.mOwner = itemID;
	fig.mOwnerMax = 64;
	
	return fig;
}


ItemFactory.prototype.newFromTemplate = function(strType, strData , strColor) {
	var model = this.getFromTemplate(strType, strData, strColor);
	if (model != undefined)
	{
		this.mModels[strType] = model;
	}
}

ItemFactory.prototype.getFromTemplate = function(strType, strData, strColor) 
{

    if (this.mModels[strData] != undefined)
    {
        return this.mModels[strData];
    }

	var textid = this.mApp.textures().mTextureDefault;
	var color = undefined;
	
	if (strColor == undefined)
	{
		color = this.mApp.colors().white;
	}else
	{
		color = this.mApp.colors().getColor(strColor);
	}
	
	var grid = [1,1,1];
	
	
	var template = undefined;
	var tok = strData.split(".");
	if (tok.length == 1)
	{
		template = strData;
	}else
	{
		template = tok[0];
		grid[0] = parseFloat( tok[1]);
		grid[1] = parseFloat( tok[2] );
		grid[2] = parseFloat( tok[3] );
	}
	
		
	var model = new GameonModel(template , this.mApp , undefined);
	if (template == "cube")
	{
		var model = this.createFromType(GameonModelData_Type.CUBE, color , textid , grid);
		model.mModelTemplate = GameonModelData_Type.CUBE;
		model.mIsModel = true;
		return model;
		
	}else
	if (template == "sphere")
	{
		var model = this.createFromType(GameonModelData_Type.SPHERE, color , textid , grid);
		model.mModelTemplate = GameonModelData_Type.SPHERE;
		model.mIsModel = true;
		return model;
		
	}		
	if (template == "cylinder")
	{
		model.createModel(GameonModelData_Type.CYLINDER, TextureFactory.mTextureDefault);
		model.mModelTemplate = GameonModelData_Type.SFIGURE;
		model.mIsModel = true;
	} else if (template == "plane")
	{
		model.createPlane(-0.5,-0.5,0.0,0.5, 0.5,0.0, this.mApp.mColors.white);
		model.mModelTemplate = GameonModelData_Type.SFIGURE;
		model.mIsModel = true;
	} else if (template == "dicemodel")
	{
		model.createModel(GameonModelData_Type.DICE, TextureFactory.mTextureDefault);
		model.mModelTemplate = GameonModelData_Type.DICE;
		model.mIsModel = true;
	} else if (template == "card52")
	{
		model.createCard2(-0.5,-0.5,0.0,0.5, 0.5,0.0, this.mApp.mColors.transparent);
		model.mModelTemplate = GameonModelData_Type.CARD52;
		model.mForceHalfTexturing = true;
		model.mForcedOwner = 32;   
		model.mHasAlpha = true;
		model.mIsModel = true;
	} else if (template == "cardbela")
	{
		model.createCard(-0.5,-0.5,0.0,0.5, 0.5,0.0, this.mApp.mColors.transparent);
		model.mModelTemplate = GameonModelData_Type.CARD52;
		model.mForceHalfTexturing = true;
		model.mForcedOwner = 32;   
		model.mHasAlpha = true;
		model.mIsModel = true;
	}else if (template == "background")
	{
		model.createPlane(-0.5,-0.5,0.0,0.5, 0.5,0.0, color , grid);
		model.mModelTemplate = GameonModelData_Type.BACKGROUND;
		model.mHasAlpha = true;
		model.mIsModel = false;
	} else
	{
		return undefined;
	}
	
	return model;

}

ItemFactory.prototype.setTexture = function(strType, strData) {
	// get object
	var model = this.mModels[strType];
	if (model == undefined) {
		return;
	}
	
	var offsetx = 0, offsety = 0;
	var texture = undefined;
	var tok = strData.split(";");
	
	if (tok.length == 1)
	{
		// no offset
		texture = strData;
	}else {
		texture = tok[0];
		var offset = tok[1];
		var tok2 =  offset.split(",");
		offsetx = tok2[0];
		offsety = tok2[1];
	}
	
	model.mTextureID = this.mApp.mTextures.getTexture(texture);
	model.setTextureOffset(offsetx, offsety);
}

ItemFactory.prototype.createModel = function(strType, domainname) {
	// get object
	var model = this.mModels[strType];
	if (model == undefined) {
		return;
	}
	model.mIsModel = true;
	var domain = this.mApp.world().getDomainByName(domainname);
	if (domain != undefined)
	{
		this.mWorld.add(model);
	}else
	{
		this.mWorld.add(model);
	}	
}	

ItemFactory.prototype.setSubmodels = function(strType, strData) {
	// get object
	var model = this.mModels[strType];
	if (model == undefined) {
		return;
	}
	var vals = [0,0];
	var count = ServerkoParse.parseIntArray(vals,strData);
	if (count == 1)
	{
		model.mSubmodels = vals[0];
	}
	else
	{
		model.mSubmodels = vals[0];
		model.mForcedOwner = vals[1];
	}
	
}		

ItemFactory.prototype.createFromType = function(template, color, texture , grid) 
{
    var model = new GameonModel("template" , this.mApp, undefined);
    this.addModelFromType(model, template, color, texture, grid);
    return model;
}

ItemFactory.prototype.addModelFromType = function(model, template, color, texture, grid) 
{
	if (template == GameonModelData_Type.SFIGURE)
	{
		model.createModel(GameonModelData_Type.CYLINDER, TextureFactory.mTextureDefault);
		model.mModelTemplate = GameonModelData_Type.SFIGURE;
		model.mIsModel = true;
	} else if (template == GameonModelData_Type.CUBE)
	{
		model.createModel(GameonModelData_Type.CUBE, TextureFactory.mTextureDefault, color, grid);
		model.mModelTemplate = GameonModelData_Type.CUBE;
		model.mIsModel = true;
	} else if (template == GameonModelData_Type.SPHERE)
	{
		model.createModel(GameonModelData_Type.SPHERE, TextureFactory.mTextureDefault, color, grid);
		model.mModelTemplate = GameonModelData_Type.SPHERE;
		model.mIsModel = true;
	}else if (template == GameonModelData_Type.CARD52)
	{
		model.createCard2(-0.5,-0.5,0.0,0.5, 0.5,0.0, this.mApp.mColors.transparent);
		model.mModelTemplate = GameonModelData_Type.CARD52;
		model.mForceHalfTexturing = true;
		model.mForcedOwner = 32;   
		model.mHasAlpha = true;
		model.mIsModel = true;
	} else if (template == GameonModelData_Type.BACKGROUND)
	{
		model.createPlane(-0.5,-0.5,0.0,0.5, 0.5,0.0, color, grid);
		model.mModelTemplate = GameonModelData_Type.BACKGROUND;
		model.mForceHalfTexturing = false;
		model.mHasAlpha = false;
		model.setTexture(texture);
	} else if (template == GameonModelData_Type.BACKIMAGE)
	{
		model.createPlane2(-0.5,-0.5,0.0,0.5, 0.5,0.0, color);
		model.mModelTemplate = GameonModelData_Type.BACKGROUND;
		model.mForceHalfTexturing = false;
		model.mHasAlpha = false;
		model.setTexture(texture);
	}
	
	return model;

}

ItemFactory.prototype.initModels = function(response)
{
	var areas;
	areas = response["model"];
	for (var a=0; a< areas.length; a++)
	{
		//ServerkoAreaData* pCurr = [response.mAreaDatas objectAtIndex:a];
		var pCurr = areas[a];
		this.processObject(pCurr);
	}	

}

ItemFactory.prototype.processObject = function( objData) {
	var name = objData["name"];
	var template = objData["template"];
	var color= undefined;
	if (objData["color"] != undefined)
	{
		color= objData["color"];
	}
	
	this.newFromTemplate(name , template);
	
	if (objData["texture"] != undefined)
	{	        
		var data = objData["texture"];    
		this.setTexture(name, data);
	}

	if (objData["texture"] != undefined)
	{	        
		var data = objData["texture"];    
		this.setTexture(name, data);
	}
	
	if (objData["submodels"] != undefined)
	{	        
		var data = objData["submodels"];    
		this.setSubmodels(name, data);
	}	
		
	this.createModel(name,"");

}

ItemFactory.prototype.newEmpty = function(name) 
{
    var model = new GameonModel(name , this.mApp, undefined);
    model.mIsModel = true;
    if (model != undefined)
    {
        this.mModels[name] = model;
    }
}

ItemFactory.prototype.addShape = function(name, type, transform, colors, uvbounds) 
{
    var model = this.mModels[name];
    if (model == undefined) {
        return;
    }

    var transf;
    var uvb;
    var cols;
    
    if (transform != undefined)
    {
        transf = new Array(9);
        for (var a=0; a< 9; a++)
        {
            transf[a] = this.mDefaultTransf[a];
        }
        
        ServerkoParse.parseFloatArray(transf,  transform);
    }
    else
    {
        transf = this.mDefaultTransf;
    }
    

    var mat = new Array(16);
    GMath.matrixIdentity(mat);
    GMath.matrixTranslate(mat, transf[0],transf[1],transf[2]);
    GMath.matrixRotate(mat,transf[6], 1, 0, 0);
    GMath.matrixRotate(mat,transf[7], 0, 1, 0);
    GMath.matrixRotate(mat,transf[8], 0, 0, 1);
    GMath.matrixScale(mat, transf[3],transf[4],transf[5]);		
    
    
    if (uvbounds != undefined)
    {
        uvb = new Array(6);
        ServerkoParse.parseFloatArray(uvb , uvbounds);
    }
    else
    {
        uvb = this.mDefaultUv;
    }

    if (colors != undefined)
    {
        cols = ServerkoParse.parseColorVector(colors);
    }else
    {
        cols = this.mDefaultColors;
    }
    
    
    if (type == "plane")
    {
        model.addPlane(mat, cols, uvb);
    }
	else if (type == "cylinder")
	{
		model.createModelFromData2(GameonModelData.modelCyl, mat, uvb, cols);
	}
	else if (type == "cube")
	{
		model.createModelFromData2(GameonModelData.modelCube, mat, uvb, cols);
	}		
	
    /*
    else if (type.equals("cube"))
    {
        model.addCube(bounds, cols, uvb);
    }else if (type.equals("cylinder"))
    {
        model.addCyl(bounds, cols, uvb);
    }else if (type.equals("sphere"))
    {
        model.addSphere(bounds, cols, uvb);
    }else if (type.equals("pyramid"))
    {
        model.addPyramid(bounds, cols, uvb);
    }*/
    
}

ItemFactory.prototype.addShapeFromData = function(name, data, transform, uvbounds) 
{
    var model = mModels.get[name];
    if (model == undefined) {
        return;
    }

    var transf;
    var uvb;
    var cols;
    
    if (transform != undefined)
    {
        transf = new Array(9);
        ServerkoParse.parseFloatArray(transf,  transform);
    }
    else
    {
        transf = this.mDefaultTransf;
    }
    
    if (uvbounds != undefined)
    {
        uvb = new Array(6);
        ServerkoParse.parseFloatArray(uvb , uvbounds);
    }
    else
    {
        uvb = this.mDefaultUv;
    }

    
    var mat = new Array(16);
    
    GMath.matrixIdentity(mat);
    GMath.matrixTranslate(mat, transf[0],transf[1],transf[2]);
    GMath.matrixRotate(mat,transf[6], 1, 0, 0);
    GMath.matrixRotate(mat,transf[7], 0, 1, 0);
    GMath.matrixRotate(mat,transf[8], 0, 0, 1);
    GMath.matrixScale(mat, transf[3],transf[4],transf[5]);		
    
    var inputdata = ServerkoParse.parseFloatVector(data);
    model.createModelFromData(inputdata, mat, uvb);
}

ItemFactory.prototype.createModelFromFile = function(gl, modelname, fname)
{
	var model = this.mModels[modelname];
	if (model != undefined) {
		return;
	}
	
	model = new GameonModel(modelname , this.mApp,undefined);
	
	var location = "";
	location += fname;
	var vertices = new Array();
	var textvertices = new Array();

	var folder = "";
	if (fname.indexOf("/") != -1)
	{
		folder = fname.substring(0, fname.indexOf("/")+1);
	}
	
	var objstr = this.mApp.getStringFromFile(location);
	
	
	var tok = objstr.split("\n");
	for (var a =0; a < tok.length; a++)
	{
		var line = tok[a];
		line = line.replace("\r", "");
		if (line.indexOf("#") == 0)
		{
			continue;
		}
		if (line.indexOf("v ") == 0)
		{
			vertices.push(this.parseVertices(line.substring(2)));
		}else
		if (line.indexOf("vt ") == 0)
		{
			textvertices.push(this.parseTextureVertices(line.substring(3)));
		}else
		if (line.indexOf("vn ") == 0)
		{
			continue;
		}else					
		if (line.indexOf("vp ") == 0)
		{
			continue;
		}else
		if (line.indexOf("f ") == 0)
		{
			model.addShapeFromString(vertices, textvertices, line.substring(2));
		}else
		if (line.indexOf("mtllib ") == 0)
		{
			this.mApp.textures().loadMaterial(gl, folder, line.substring(7));
		}else
		if (line.indexOf("usemtl ") == 0)
		{
			model.useMaterial(line.substring(7));
		}
	}
	// TODO multiple material textures
	// TODO normals and much more
	model.normalize();
	model.invert(false,true,false);
	this.mModels[modelname] = model;

}

ItemFactory.prototype.parseVertices = function(data) 
{
	data = data.trim();
	return ServerkoParse.parseFloatArray2(data);
}

ItemFactory.prototype.parseTextureVertices = function(data) 
{
	data = data.trim();
	return ServerkoParse.parseFloatArray2(data);
}

