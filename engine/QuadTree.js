'use strict';

var MAX_QUADTREE_DEPTH = 10;
var DISTANCE_MUL = 2;


function QuadTree(glProgram, faceId, cubePosition, depth, x, y, width, parent) {

	this.faceId = faceId;

	// Cube Position is the position on the cube where the QuadTree lives on.
	this.cubePosition = cubePosition;

	// Drawing
	this.program = glProgram;

	// Set the parent QuadTree
	this.parent = parent;

	// Coordinates
	this.x = x;
	this.y = y;

	// Skip drawing children in the same frame as they're created
	this.hasCreatedChildrenInFrame = false;

	this.isParent = false;

	// Depth of the QuadTree, 0 is the first LOD level, 1 is the second, etc.
	this.depth = depth;

	// Width of the QuadTree. Starts with 2 on the first LOD, then 1, 0.5, etc.
	this.width = width;

	this.width2 = this.width * planetScale * this.width * planetScale;

	// Children
	this.northWest = null;
	this.northEast = null;
	this.southWest = null;
	this.southEast = null;

	// Create the mesh for this QuadTree
	this.createMesh();

	// Create the AABB for frustum culling.
	if (this.cubePosition.x != 0) {
	//	this.center = vec3.fromValues(x + width * 0.5, y - width * 0.5, this.cubePosition.x);
		this.bottomLeft = this.terrainPatch.min;
		this.aabox = new AABox(this.bottomLeft, this.terrainPatch.meshWidthX, this.terrainPatch.meshWidthY, this.terrainPatch.meshDepth);
	}
	else if (this.cubePosition.y != 0) {
		//this.center = vec3.fromValues(x + width * 0.5, this.cubePosition.y, (y - width * 0.5) * -1);
		this.bottomLeft = this.terrainPatch.min;
		this.aabox = new AABox(this.bottomLeft, this.terrainPatch.meshWidthX, this.terrainPatch.meshDepth, this.terrainPatch.meshWidthY);
	}
	else if (this.cubePosition.z != 0) {
	//	this.center = vec3.fromValues(this.cubePosition.z, (y - width * 0.5), (x + width * 0.5));
		this.bottomLeft = this.terrainPatch.min;
		this.aabox = new AABox(this.bottomLeft, this.terrainPatch.meshDepth, this.terrainPatch.meshWidthY, this.terrainPatch.meshWidthX);
	}

	this.center = this.terrainPatch.centerPos;


	//console.log(this.center);
	//this.center = vec3.fromValues((this.terrainPatch.min[0] + this.terrainPatch.max[0]) / 2, (this.terrainPatch.min[1] + this.terrainPatch.max[1]) / 2, (this.terrainPatch.min[2] + this.terrainPatch.max[2]) / 2)

	//setSpherePoint(this.center);

	//this.center = getSpherePoint(this.faceId, this.center[0], this.center[1], this.center[2]);
	//console.log(this.center[0]);

	
}

QuadTree.prototype.createMesh = function() {
	this.terrainPatch = new TerrainPatch(glProgram, patchSize, this.faceId, this.cubePosition, this.x, this.y, this.width, this.depth);
}


QuadTree.prototype.killChildren = function() {

	this.northWest.kill();
	this.northEast.kill();
	this.southWest.kill();
	this.southEast.kill();

	this.northWest = null;
	this.northEast = null;
	this.southWest = null;
	this.southEast = null;

	this.isParent = false;

	if (this.depth > 0) {
		this.parent.isParent = true;
	}
}

QuadTree.prototype.parentUpdate = function() {
	this.checkKill();
}

QuadTree.prototype.leafUpdate = function() {
	if (this.depth < MAX_QUADTREE_DEPTH && this.fastDist() < this.width2 * DISTANCE_MUL) {
		this.createChildren();
	}
}

QuadTree.prototype.fastDist = function() {
	var dx = frustum.camPos[0] - this.center.x;
	var dy = frustum.camPos[1] - this.center.y;
	var dz = frustum.camPos[2] - this.center.z;

	return (dx*dx + dy*dy + dz*dz) * 0.5;
}

QuadTree.prototype.checkKill = function() {
	var dist = this.fastDist();

	if (dist >= this.width2 * 5 || this.depth >= MAX_QUADTREE_DEPTH) {
		this.killChildren();
	}
}

QuadTree.prototype.draw = function(distPlanet, distHorizon, skipDraw) {
	if (this.isParent) {
		this.parentUpdate();
	}

	if (!skipDraw) {
		skipDraw = !frustum.boxInFrustum(this.aabox);
	}

	// If there are no children, draw this
	if (this.northWest == null && this.northEast == null && this.southWest == null && this.southEast == null) {
		this.leafUpdate();

		if (this.isParent && !this.hasCreatedChildrenInFrame) {
			this.drawChildren(distPlanet, distHorizon, skipDraw);
		}
		else {
			var distPatch = this.fastDist();

			if (this.hasCreatedChildrenInFrame) {
				this.hasCreatedChildrenInFrame = false;
			}

			if (!skipDraw && distHorizon >= distPatch - this.width2) {
			//if (!this.terrainPatch.isHorizonCulled(distHorizon)) {
				this.terrainPatch.draw();
				numPatchesRendered++;
			}
		}
	}
	else {
		this.drawChildren(distPlanet, distHorizon, skipDraw);
	}
}

QuadTree.prototype.kill = function() {
	
}

QuadTree.prototype.drawChildren = function(distPlanet, distHorizon, skipDraw) {
	this.northWest.draw(distPlanet, distHorizon, skipDraw);
	this.northEast.draw(distPlanet, distHorizon, skipDraw);
	this.southWest.draw(distPlanet, distHorizon, skipDraw);
	this.southEast.draw(distPlanet, distHorizon, skipDraw);
}

QuadTree.prototype.createChildren = function() {
	this.isParent = true;
	this.hasCreatedChildrenInFrame = true;
	
	if (this.depth > 0) {
		this.parent.isParent = false;
	}

	var halfwidth = this.width * 0.5;

	this.northWest = new QuadTree(this.program, this.faceId, this.cubePosition, this.depth + 1, 
		this.x, 
		this.y, 
		halfwidth,
		this);

	this.northEast = new QuadTree(this.program, this.faceId, this.cubePosition, this.depth + 1, 
		this.x + halfwidth, 
		this.y, 
		halfwidth,
		this);

	this.southWest = new QuadTree(this.program, this.faceId, this.cubePosition, this.depth + 1,
		this.x, 
		this.y - halfwidth, 
		halfwidth,
		this);

	this.southEast = new QuadTree(this.program, this.faceId, this.cubePosition, this.depth + 1,
		this.x + halfwidth,
		this.y - halfwidth, 
		halfwidth,
		this);
}