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


function ObjectsFactory(app)
{
	this.mApp = app;
	this.mItems = {};
}
	

ObjectsFactory.prototype.get = function(name)
{
	var model = this.mItems[name];
	return model;

}

ObjectsFactory.prototype.addModel = function( name, item , domainname)
{
	if ( this.mItems[name] != undefined)
	{
		return;
	}
	
	var domain = this.mApp.world().getDomainByName(domainname);
	if (domain != undefined)
	{
		this.mApp.world().add(item.mModel);
	}else
	{	
		this.mApp.mWorld.add(item.mModel);
	}
	
	item.mModel.mEnabled = true;
	this.mItems[name] =  item;
}

ObjectsFactory.prototype.removeModel = function( name)
{
	if (this.mItems[name] == undefined)
	{
		return;
	}	
	var item = this.mItems[name];

	var model = item.mModel;
	//model.setVisible(false);

	delete this.mItems[name];
	this.mApp.mWorld.remove(model);
	// todo check if model hangs on in world
}

ObjectsFactory.prototype.create = function(name, data , loc , color) 
{
	if ( this.mItems[name] != undefined)
	{
		return;
	}
	
	
	var model = this.mApp.mItems.getFromTemplate(name,data , color);
	if (model != undefined)
	{
        var modelnew = model.copyOfModel();
		var item = new LayoutItem(this.mApp);
		item.mModel = modelnew;
		if (loc != undefined)
		{
			var domain = this.mApp.world().getDomainByName(loc);
			//model.mLoc = domain.mRenderId;
			this.addModel(name,item, loc);
		}else
		{		
			this.addModel(name,item);
		}
	}
}	

ObjectsFactory.prototype.place = function(name, data , state) 
{
    var refid = this.refId(name);
    
	var item = this.mItems[refid.name];
	if (item == undefined)
	{
		return;
	}
	var model = item.mModel;

    var coords = new Array(3);
    ServerkoParse.parseFloatArray(coords, data);

    var ref = model.getRefById(refid , 0);
	ref.setPosition(coords);
	ref.set();

	if (state != undefined)
	{
		var visible = false;
		if (state == "visible")
		{
			visible = true;
		}
		ref.setVisible(visible);			
	}	
}

ObjectsFactory.prototype.scale = function(name, data) 
{
    var refid = this.refId(name);
    
	var item = this.mItems[refid.name];
	if (item == undefined)
	{
		return;
	}
	var model = item.mModel;

    var coords = new Array(3);
    ServerkoParse.parseFloatArray(coords, data , 0);

    var ref = model.getRefById(refid,0);
    ref.setScale(coords);
    ref.set();
}

ObjectsFactory.prototype.rotate = function(name, data) 
{
    var refid = this.refId(name);
    
	var item = this.mItems[refid.name];
	if (item == undefined)
	{
		return;
	}
	var model = item.mModel;

    var coords = new Array(3);
    ServerkoParse.parseFloatArray(coords, data);

    var ref = model.getRefById(refid,0);
    ref.setRotate(coords);
    ref.set();
}


ObjectsFactory.prototype.texture = function(name, data , submodel) 
{
    var refid = this.refId(name);
	var item = this.mItems[refid.name];
	if (item == undefined)
	{
		return;
	}
	
	var model = item.mModel;
	var r = model.getRefById(refid,0);
    
    if (data != undefined && data.length > 0)
    {
        var text = this.mApp.mTextures.getTexture(data);
        model.setTexture(text);
    }
    if (submodel != undefined && submodel.length > 0)
    {
        var arr = new Array(2);
        ServerkoParse.parseIntArray(arr,submodel);
        r.setOwner(arr[0] , arr[1]);
    }
     
}
//TODO mutliple references with name.refid , default 0!

ObjectsFactory.prototype.state = function(name, data) 
{
    var refid = this.refId(name);
	var item = this.mItems[refid.name];

	if (item == undefined)
	{
		return;
	}
	var model = item.mModel;
	var ref = model.getRefById(refid , 0);

	var visible = false;
	if (data == "visible")
	{
		visible = true;
	}
	if (model.mRefs.length == 0)
	{
		this.place(name, "0,0,0", null);
	}
	
	ref.setVisible(visible);
	//model.setVisible(visible);
}


ObjectsFactory.prototype.remove = function(name, data) 
{
	var item = this.mItems[name];
	if (item == undefined)
	{
		return;
	}
	var model = item.mModel;
	this.removeModel(name);
}		


ObjectsFactory.prototype.initObjects = function(response)
{
	var areas;
	areas = response["object"];
	for (var a=0; a< areas.length; a++)
	{
		//ServerkoAreaData* pCurr = [response.mAreaDatas objectAtIndex:a];
		var pCurr = areas[a];
		this.processObject(pCurr);
	}	

}

ObjectsFactory.prototype.processObject = function( objData) {
	var name = objData["name"];
	var template = objData["template"];
	
	var color= undefined;
	if (objData["color"] != undefined)
	{
		color= objData["color"];
	}
	
	this.create(name , template, undefined, color);
	
	if (objData["location"] != undefined)
	{	        
		var data = objData["location"];    
		this.place(name, data, null);
	}
	
	if (objData["bounds"] != undefined)
	{	        
		var data = objData["bounds"];    
		this.scale(name, data);
	}
	
	if (objData["texture"] != undefined)
	{	        
		var data = objData["texture"];    
		this.texture(name, data , "" );
	}
	
	if (objData["state"] != undefined)
	{	        
		var data = objData["state"];    
		this.state(name, data);
	}	
	if (objData["rotate"] != undefined)
	{	        
		var data = objData["rotate"];    
		this.rotate(name, data);
	}	
	if (objData["iter"] != undefined)
	{
		var data = objData["iter"];
		this.setIter(name, data);
	}
	if (objData["onclick"] != undefined)
	{
		var data = objData["onclick"];
		this.setOnClick(name, data);
	}			
}

ObjectsFactory.prototype.refId = function(name)
{
    var refdata = new GameonModel_RefId();
    var tok =  name.split(".");
	var count = tok.length;
	if (count == 2)
	{
		refdata.name = tok[0];
		refdata.id = parseInt(tok[1]);
	}else
	if (count == 3)
	{
		refdata.name = tok[0];
		refdata.alias = tok[2];
		refdata.id = -1;
	}
	else
    {
        refdata.name = name;
        refdata.id = 0;
    }
    return refdata;
}


ObjectsFactory.prototype.getRef = function(name)
{
    var refid = this.refId(name);
    var item = this.mItems[refid.name];
    if (item == undefined)
    {
        return undefined;
    }
    
    var model = item.mModel;
    var ref = model.getRefById(refid , 0);
    return ref;
    
}    

ObjectsFactory.prototype.setIter = function(name, data) 
{
	var refid = this.refId(name);
	var item = this.mItems[refid.name];
	if (item == undefined)
	{
		return;
	}
	var model = item.mModel;
	var num = parseInt(data);
	model.setupIter(num);
}

ObjectsFactory.prototype.setOnClick = function(name, data) 
{
	var refid = this.refId(name);
	var item = this.mItems[refid.name];
	if (item == undefined)
	{
		return;
	}
	var model = item.mModel;
	model.mOnClick = data;
}
