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

function GLShape( world) {
	this.mWorld = world;
	this.mFaceList = [];
	this.mVertexList = [];
	
}
	
GLShape.prototype.addFace = function(face) 
{
	this.mFaceList.push(face);
}
	
GLShape.prototype.setFaceColor = function(face, color) 
{
	this.mFaceList[face].setColor(color);
}
			
GLShape.prototype.putIndices = function(buffer) 
{
	for (var i = 0; i < this.mFaceList.length; i++)
	{
		var face = this.mFaceList[i];
		face.putIndices(buffer);
	}

}
	
GLShape.prototype.getIndexCount = function() 
{
	var count = 0;
	for (var i = 0; i < this.mFaceList.length; i++)
	{
		var face = this.mFaceList[i];
		count += face.getIndexCount();
	}
	return count;
}


GLShape.prototype.addVertex = function(x, y, z, tu, tv, color) 
{
	for (var i = 0; i < this.mVertexList.length; i++)
	{
		var vertex = this.mVertexList[i];
		if (vertex.x == x && vertex.y == y && vertex.z == z &&
			vertex.tu == tu && vertex.tv == tv && 
			vertex.red== color.red &&
			vertex.green== color.green &&
			vertex.blue== color.blue &&
			vertex.alpha== color.alpha)  
		{
			return vertex;
		}
	}
	
	// doesn't exist, so create new vertex
	var vertex = this.mWorld.addVertex(x, y, z, tu, tv);
	
	vertex.red= color.red;
	vertex.green= color.green;
	vertex.blue= color.blue;
	vertex.alpha= color.alpha;

	this.mVertexList.push(vertex);
	return vertex;
}

GLShape.prototype.addVertexNoIndex = function(x, y, z, tu, tv, color) 
{
	
	var vertex = this.mWorld.addVertex(x, y, z, tu, tv);
	vertex.red= color.red;
	vertex.green= color.green;
	vertex.blue= color.blue;
	vertex.alpha= color.alpha;
	this.mVertexList.push(vertex);
	return vertex;
}

GLShape.prototype.addVertexColor = function(x, y, z, tu, tv, color) 
{
    var red = color[1];
    var green = color[2];
    var blue = color[3];
    var alpha = color[0];
    
    for (var i = 0; i < this.mVertexList.length; i++)
	{
		var vertex = this.mVertexList[i];
		if (vertex.x == x && vertex.y == y && vertex.z == z &&
			vertex.tu == tu && vertex.tv == tv && 
			vertex.red== red &&
			vertex.green== green &&
			vertex.blue== blue &&
			vertex.alpha== alpha)  
		{
			return vertex;
		}
	}
    
    var vertex = this.mWorld.addVertex(x, y, z, tu, tv);
	
	vertex.red= red;
	vertex.green= green;
	vertex.blue= blue;
	vertex.alpha= alpha;

	this.mVertexList.push(vertex);
	return vertex;

}


GLShape.prototype.addVertexColorInt = function(x, y, z, tu, tv, color) 
{
    var red = ColorFactory.decodeR(color) / 255.0;
    var green = ColorFactory.decodeG(color) / 255.0;
    var blue = ColorFactory.decodeB(color) / 255.0;
    var alpha = ColorFactory.decodeA(color) / 255.0;

	for (var i = 0; i < this.mVertexList.length; i++)
	{
		var vertex = this.mVertexList[i];
		if (vertex.x == x && vertex.y == y && vertex.z == z &&
			vertex.tu == tu && vertex.tv == tv && 
			vertex.red== red &&
			vertex.green== green &&
			vertex.blue== blue &&
			vertex.alpha== alpha)  
		{
			return vertex;
		}
	}
    
	var vertex = this.mWorld.addVertex(x, y, z, tu, tv);
	
	vertex.red= red;
	vertex.green= green;
	vertex.blue= blue;
	vertex.alpha= alpha;

	this.mVertexList.push(vertex);
	return vertex;
}
