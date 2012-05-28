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

var MAPPING_XY = 0;
var MAPPING_YZ = 1;
var MAPPING_XZ = 2;

var TYPE_FIXED = 0;
var TYPE_DYNAMIC = 1;
var TYPE_KINEMATIC = 2;
var TYPE_AREA = 3;

var SHAPE_BOX = 0;
var SHAPE_CIRCLE = 1;

var   b2Vec2 = Box2D.Common.Math.b2Vec2
,  b2AABB = Box2D.Collision.b2AABB
,	b2BodyDef = Box2D.Dynamics.b2BodyDef
,	b2Body = Box2D.Dynamics.b2Body
,	b2FixtureDef = Box2D.Dynamics.b2FixtureDef
,	b2Fixture = Box2D.Dynamics.b2Fixture
,	b2World = Box2D.Dynamics.b2World
,	b2MassData = Box2D.Collision.Shapes.b2MassData
,	b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
,	b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
,	b2DebugDraw = Box2D.Dynamics.b2DebugDraw
,  b2MouseJointDef =  Box2D.Dynamics.Joints.b2MouseJointDef
;

			
function ObjectProps()
{
	
	this.mType = TYPE_FIXED;
	this.mShape = SHAPE_BOX;
	this.mGroupIndex = 0; 
	this.mFriction = 0.2;
	this.mDensity = 0;
	this.mRestitution = 0.0;
	
}

function BodyData()
{
	this.mArea = undefined;
	this.mRef = undefined;
	this.mBody = undefined;
	this.mProps = undefined;
}



function Box2dData()
{
	this.mWorld;
	this.mName;
	this.mAreaModels = [];
	this.mDynModels = [];
	this.mFixModels = [];
	this.mMapping = MAPPING_XY;
}

function Box2dWrapper( app ) 
{
	this.mBox2dWorlds = {};
	this.mBox2dWorldsVec = [];
	this.mApp = app;
	this.mActive = false;

}


Box2dWrapper.prototype.initWorld = function(worldname, grav, mapping)
{
	if (this.mBox2dWorlds["worldname"] != undefined)
	{
		return;
	}
	
	var gravity = [0,0];
	ServerkoParse.parseFloatArray(gravity, grav);
	
	var vecgrav = new Box2D.Common.Math.b2Vec2(gravity[0], gravity[1]);
	var data = new Box2dData();
	
	var world = new Box2D.Dynamics.b2World( vecgrav  , true);
	data.mWorld = world;
	data.mName = worldname;
	if (mapping == "xy")
	{
		data.mMapping = MAPPING_XY;
	}else if (mapping == "xz")
	{
		data.mMapping = MAPPING_XZ;
	}if (mapping == "yz")
	{
		data.mMapping = MAPPING_YZ;
	}
	
	this.mActive = true;
	
	this.mBox2dWorldsVec.push(data);
	this.mBox2dWorlds[worldname] = data;
}

Box2dWrapper.prototype.addDynObject = function(worldname, objname, ref, props)
{
	var data = this.mBox2dWorlds[worldname];
	if (data == undefined)
	{
		return;
	}
	
	
	// Dynamic Body
	var bodyDef = new Box2D.Dynamics.b2BodyDef();
	bodyDef.type = b2Body.b2_dynamicBody;
	bodyDef.position.Set(ref.mPosition[0], ref.mPosition[1]);
	var body = data.mWorld.CreateBody(bodyDef);
	
	var fixtureDef = new Box2D.Dynamics.b2FixtureDef();
	if (props.mShape == SHAPE_BOX)
	{
		var dynamicBox = new Box2D.Collision.Shapes.b2PolygonShape();
		dynamicBox.SetAsBox(ref.mScale[0]/2,ref.mScale[1]/2);
		fixtureDef.shape = dynamicBox;
	}else
	{
		var dynamicCircle = new Box2D.Collision.Shapes.b2CircleShape();
		dynamicCircle.m_radius = ref.mScale[0]/2;
		fixtureDef.shape = dynamicCircle;
	}
	
	fixtureDef.density=props.mDensity;
	fixtureDef.friction=props.mFriction;
	fixtureDef.restitution = props.mRestitution;
	//kinematicBody
	fixtureDef.filter.groupIndex = props.mGroupIndex;
	body.CreateFixture(fixtureDef);
	
	var bodydata = new BodyData();
	bodydata.mRef = ref;
	bodydata.mBody = body;
	bodydata.mProps = props;
	ref.assignPsyData(bodydata);
	data.mDynModels.push(bodydata);
}

Box2dWrapper.prototype.addAreaObject = function(worldname, objname, area, props)
{
	var data = this.mBox2dWorlds[worldname];
	if (data == undefined)
	{
		return;
	}
	
	
	// Dynamic Body
	var bodyDef = new Box2D.Dynamics.b2BodyDef();
	bodyDef.type = b2Body.b2_dynamicBody;
	bodyDef.position.Set(area.mLocation[0], area.mLocation[1]);
	var body = data.mWorld.CreateBody(bodyDef);
	
	var fixtureDef = new Box2D.Dynamics.b2FixtureDef();
	var dynamicBox = new Box2D.Collision.Shapes.b2PolygonShape();
	dynamicBox.SetAsBox(area.mBounds[0]/2,area.mBounds[1]/2);
	fixtureDef.shape = dynamicBox;
	fixtureDef.density=props.mDensity;
	fixtureDef.friction=props.mFriction;
	fixtureDef.restitution = props.mRestitution;
	//kinematicBody
	fixtureDef.filter.groupIndex = props.mGroupIndex;
	body.CreateFixture(fixtureDef);
	
	var bodydata = new BodyData();
	bodydata.mArea = area;
	bodydata.mBody = body;
	bodydata.mProps = props;
	area.assignPsyData(bodydata);
	data.mAreaModels.push(bodydata);
}	

Box2dWrapper.prototype.addFixedObject = function(worldname, objname, ref, props)
{
	var data = this.mBox2dWorlds[worldname];
	if (data == undefined)
	{
		return;
	}
	
	var bodyDef = new Box2D.Dynamics.b2BodyDef();
	
	bodyDef.position.Set(ref.mPosition[0], ref.mPosition[1]);
	var groundBody = data.mWorld.CreateBody(bodyDef);
	var fixtureDef = new Box2D.Dynamics.b2FixtureDef();
	if (props.mShape == SHAPE_BOX)
	{	    
		var shape = new Box2D.Collision.Shapes.b2PolygonShape();
		shape.SetAsBox(ref.mScale[0]/2,ref.mScale[1]/2);
		fixtureDef.shape = shape;
		fixtureDef.density=props.mDensity;
		fixtureDef.friction=props.mFriction;
		fixtureDef.restitution = props.mRestitution;		
		groundBody.CreateFixture(fixtureDef);
	}else
	{
		var shape = new Box2D.Collision.Shapes.b2CircleShape();
		shape.m_radius = ref.mScale[0]/2;
		fixtureDef.shape = shape;
		fixtureDef.density=props.mDensity;
		fixtureDef.friction=props.mFriction;
		fixtureDef.restitution = props.mRestitution;		
		
		groundBody.CreateFixture(fixtureDef);	    	
	}
	
	
	var bodydata = new BodyData();
	bodydata.mRef = ref;
	bodydata.mBody = groundBody;
	bodydata.mProps = props;
	ref.assignPsyData(bodydata);
	data.mFixModels.push(bodydata);
	
	
}

Box2dWrapper.prototype.doFrame = function(delay)
{
	if (!this.mActive)
	{
		return;
	}
	var velocityIterations = 6;
	var positionIterations = 2;
	var timeStep = delay/1000;
	//print(" psy step "+ timeStep + " " + delay );
	for (var a=0; a< this.mBox2dWorldsVec.length ; a++)
	{
		var data = this.mBox2dWorldsVec[a];
		//print(" psy step "+ timeStep + " " + delay );
		data.mWorld.Step(timeStep, velocityIterations, positionIterations);
		for (var b=0; b < data.mDynModels.length; b++)
		{
			var bodydata = data.mDynModels[b];
			if (bodydata.mRef == undefined)
			{
				continue;
			}
			
			var position = bodydata.mBody.GetPosition();
			bodydata.mRef.setPosition(position.x, position.y, 0.1);
			//System.out.println( " rot = " + bodydata.mBody.getAngle());
			bodydata.mRef.setRotate(0, 0, bodydata.mBody.GetAngle() * 360 / 3.14);
			bodydata.mRef.set();
		}
		
		for (var b=0; b < data.mAreaModels.length; b++)
		{
			var bodydata = data.mAreaModels[b];
			if (bodydata.mArea == undefined)
			{
				continue;
			}		

			var position = bodydata.mBody.GetPosition();
			bodydata.mArea.mLocation[0] = position.x;
			bodydata.mArea.mLocation[1] = position.y;
			bodydata.mArea.mRotation[2] = bodydata.mBody.GetAngle() * 360 / 3.14;
			bodydata.mArea.updateModelsTransformation();
		}
		//data.mWorld.ClearForces();
	}
	

}

Box2dWrapper.prototype.initObjects = function(response)
{
	// init layout
	var areas;
	if (response == undefined)
	{
		return;
	}
	areas = response["object"];
	var worldid = response["worldid"];
	for (var a=0; a< areas.length; a++)
	{
		var pCurr = areas[a];
		this.processObject(worldid,pCurr);
	}

}

Box2dWrapper.prototype.processObject = function(worldid, objData) 
{
	var name = objData["name"];
	var type = objData["type"];
	var refid = objData["refid"];
	
	var props = new ObjectProps();
	
	if (objData["template"] != undefined)
	{
		var data = objData["template"];
		if (data == "box")
		{
			props.mShape = SHAPE_BOX;
		}else
		{
			props.mShape = SHAPE_CIRCLE;
		}
	}
	if (objData["friction"] != undefined)
	{
		var data = objData["friction"];
		props.mFriction = parseFloat(data);
	}
	if (objData["density"] != undefined)
	{
		var data = objData["density"];
		props.mDensity = parseFloat(data);
	}
	if (objData["restitution"] != undefined)
	{
		var data = objData["restitution"];
		props.mRestitution = parseFloat(data);
	}
	if (objData["groupIndex"] != undefined)
	{
		var data = objData["groupIndex"];
		props.mGroupIndex = parseInt(data);
	}			
	
	
	if (type == "dynamic")
	{
		var ref = this.mApp.objects().getRef(refid);
		if (ref == undefined)
		{
			return;
		}
		
		props.mType = TYPE_DYNAMIC;
		this.addDynObject(worldid, name, ref , props);
	}else if (type == "fixed")
	{
		var ref = this.mApp.objects().getRef(refid);
		if (ref == undefined)
		{
			return;
		}
		
		props.mType = TYPE_FIXED;
		this.addFixedObject(worldid, name, ref , props);
	}else if (type == "area")
	{
		var area = this.mApp.grid().getArea(refid);
		props.mType = TYPE_AREA;
		this.addAreaObject(worldid, name, area , props);
	}
}

Box2dWrapper.prototype.isActive = function()
{
	return this.mActive;
}


Box2dWrapper.prototype.removeWorld = function(worldname)
{
	var data = this.mBox2dWorlds[worldname];
	if (data == undefined)
	{
		return;
	}
	for (var b=0; b < data.mDynModels.length; b++)
	{
		var bdata = data.mDynModels[b];
		bdata.mRef.assignPsyData(undefined);
	}

	for (var b=0; b < data.mFixModels.length; b++)
	{
		var bdata = data.mFixModels[b];
		bdata.mRef.assignPsyData(undefined);
	}

	for (var b=0; b < data.mAreaModels.length; b++)
	{
		var bdata = data.mAreaModels[b];
		bdata.mArea.assignPsyData(undefined);
	}
	 
	delete this.mBox2dWorlds[data];
	var i = this.mBox2dWorldsVec.indexOf(data);
	if ( i >= 0)
	{
		this.mBox2dWorldsVec.splice( i,1 );
	}

	
	if (this.mBox2dWorldsVec.length == 0)
	{
		this.mActive = false;
	}
}
